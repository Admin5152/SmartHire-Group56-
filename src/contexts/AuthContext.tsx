import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name: string;
  role: "applicant" | "hr";
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role: "applicant" | "hr") => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "applicant" | "hr") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// HR Admin credentials
const HR_ADMIN_EMAIL = "group56@gmail.com";
const HR_ADMIN_PASSWORD = "Group56";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("user_id", supabaseUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!profile) {
      throw new Error("Profile not found for this account.");
    }

    setUser({
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: profile.name,
      role: profile.role as "applicant" | "hr",
    });
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateFromSession = async (sessionUser: SupabaseUser | null) => {
      if (!isMounted) return;

      if (!sessionUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        await fetchUserProfile(sessionUser);
      } catch (error) {
        console.error("Error hydrating user profile:", error);
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateFromSession(session?.user ?? null);
    });

    // Then restore existing session
    void supabase.auth.getSession().then(({ data: { session } }) => {
      void hydrateFromSession(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, role: "applicant" | "hr") => {
    const normalizedEmail = normalizeEmail(email);

    // Check HR admin credentials
    if (role === "hr") {
      if (normalizedEmail !== HR_ADMIN_EMAIL || password !== HR_ADMIN_PASSWORD) {
        throw new Error("Invalid HR admin credentials. Access denied.");
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Failed to sign in. Please try again.");
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (profileError) {
      await supabase.auth.signOut();
      throw new Error("Unable to load account profile. Please try again.");
    }

    if (!profile) {
      await supabase.auth.signOut();
      throw new Error("Account profile missing. Please sign up again.");
    }

    if (profile.role !== role) {
      await supabase.auth.signOut();
      throw new Error(`This account is registered as ${profile.role}, not ${role}.`);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: "applicant" | "hr") => {
    const normalizedEmail = normalizeEmail(email);

    // Only allow HR signup with admin credentials
    if (role === "hr") {
      if (normalizedEmail !== HR_ADMIN_EMAIL || password !== HR_ADMIN_PASSWORD) {
        throw new Error("HR accounts can only be created with admin credentials.");
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error("Failed to create account");
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      user_id: data.user.id,
      name,
      role,
    });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      throw new Error("Failed to create user profile");
    }

    await fetchUserProfile(data.user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

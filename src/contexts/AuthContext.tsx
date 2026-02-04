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
const HR_ADMIN_EMAIL = "Group56@gmail.com";
const HR_ADMIN_PASSWORD = "Group56";

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

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchUserProfile(session.user);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", supabaseUser.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (profile) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name: profile.name,
          role: profile.role as "applicant" | "hr",
        });
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const signIn = async (email: string, password: string, role: "applicant" | "hr") => {
    // Check HR admin credentials
    if (role === "hr") {
      if (email !== HR_ADMIN_EMAIL || password !== HR_ADMIN_PASSWORD) {
        throw new Error("Invalid HR admin credentials. Access denied.");
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Verify user role matches requested role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profile && profile.role !== role) {
        await supabase.auth.signOut();
        throw new Error(`This account is registered as ${profile.role}, not ${role}.`);
      }
    }
  };

  const signUp = async (email: string, password: string, name: string, role: "applicant" | "hr") => {
    // Only allow HR signup with admin credentials
    if (role === "hr") {
      if (email !== HR_ADMIN_EMAIL || password !== HR_ADMIN_PASSWORD) {
        throw new Error("HR accounts can only be created with admin credentials.");
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: data.user.id,
        name,
        role,
      });

      if (profileError) {
        console.error("Error creating profile:", profileError);
        throw new Error("Failed to create user profile");
      }

      // Fetch the profile to update local state
      await fetchUserProfile(data.user);
    }
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

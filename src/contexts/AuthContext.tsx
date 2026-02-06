import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "applicant" | "hr";
}

interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string, role: "applicant" | "hr") => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "applicant" | "hr") => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "smarthire_session";

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
    // Check for existing session
    const savedSession = localStorage.getItem(SESSION_KEY);
    if (savedSession) {
      try {
        const session: Session = JSON.parse(savedSession);
        api.setToken(session.access_token);
        fetchCurrentUser();
      } catch {
        localStorage.removeItem(SESSION_KEY);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const { data, error } = await api.getMe();
      if (error || !data?.user) {
        localStorage.removeItem(SESSION_KEY);
        api.setToken(null);
        setUser(null);
      } else {
        setUser(data.user);
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
      api.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, role: "applicant" | "hr") => {
    const { data, error } = await api.signIn(email, password, role);
    
    if (error) {
      throw new Error(error);
    }

    if (data?.session) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.session));
      api.setToken(data.session.access_token);
    }

    if (data?.user) {
      setUser(data.user);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: "applicant" | "hr") => {
    const { data, error } = await api.signUp(email, password, name, role);
    
    if (error) {
      throw new Error(error);
    }

    // After signup, sign in automatically
    await signIn(email, password, role);
  };

  const signOut = async () => {
    await api.signOut();
    localStorage.removeItem(SESSION_KEY);
    api.setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

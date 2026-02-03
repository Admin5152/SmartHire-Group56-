import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: "applicant" | "hr";
}

interface AuthContextType {
  user: User | null;
  isFirstLogin: boolean;
  setIsFirstLogin: (value: boolean) => void;
  signIn: (email: string, password: string, role: "applicant" | "hr") => Promise<void>;
  signUp: (email: string, password: string, name: string, role: "applicant" | "hr") => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("companyx_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("companyx_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("companyx_user");
    }
  }, [user]);

  const signIn = async (email: string, password: string, role: "applicant" | "hr") => {
    // Mock sign in - replace with actual API call
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
      role,
    };
    
    const firstLoginKey = `companyx_first_login_${email}`;
    const hasLoggedInBefore = localStorage.getItem(firstLoginKey);
    
    if (!hasLoggedInBefore) {
      setIsFirstLogin(true);
      localStorage.setItem(firstLoginKey, "true");
    }
    
    setUser(mockUser);
  };

  const signUp = async (email: string, password: string, name: string, role: "applicant" | "hr") => {
    // Mock sign up - replace with actual API call
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      role,
    };
    setIsFirstLogin(true);
    setUser(mockUser);
  };

  const signOut = () => {
    setUser(null);
    setIsFirstLogin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isFirstLogin, setIsFirstLogin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

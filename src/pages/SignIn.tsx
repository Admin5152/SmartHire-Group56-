import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Briefcase, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"applicant" | "hr">("applicant");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password, role);
      toast.success("Welcome back!");
      navigate(role === "applicant" ? "/applicant/dashboard" : "/hr/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Abstract Art */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Layered abstract background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A2463] via-[#1E3A8A] to-[#3B82F6]" />
        
        {/* Floating shapes */}
        <div className="absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-[#3B82F6]/30 blur-3xl animate-blob" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-[#06B6D4]/20 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[50%] left-[40%] w-64 h-64 rounded-full bg-[#8B5CF6]/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
        
        {/* Geometric shapes */}
        <div className="absolute top-[15%] right-[20%] w-32 h-32 border-2 border-white/10 rounded-2xl rotate-12 animate-float" />
        <div className="absolute bottom-[30%] left-[20%] w-24 h-24 border-2 border-white/10 rounded-full animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[60%] right-[30%] w-16 h-16 bg-white/5 rounded-xl rotate-45 animate-float" style={{ animationDelay: "1.5s" }} />
        
        {/* Diagonal lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="100%" x2="100%" y2="0" stroke="white" strokeWidth="0.5" />
          <line x1="20%" y1="100%" x2="100%" y2="20%" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="80%" x2="80%" y2="0" stroke="white" strokeWidth="0.5" />
        </svg>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold text-white">SmartHire</span>
          </Link>
          
          <div className="space-y-6">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Find the right<br />talent, faster.
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              AI-powered resume screening that helps you make smarter hiring decisions.
            </p>
            <div className="flex gap-8 text-white/60">
              <div>
                <div className="text-3xl font-bold text-white">5000+</div>
                <div className="text-sm">Applicants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-sm">Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50+</div>
                <div className="text-sm">Companies</div>
              </div>
            </div>
          </div>
          
          <p className="text-white/40 text-sm">
            © 2026 SmartHire. Born at KNUST.
          </p>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-xl font-bold">SmartHire</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to your SmartHire account</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("applicant")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                role === "applicant"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Briefcase className={`w-6 h-6 ${role === "applicant" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${role === "applicant" ? "text-primary" : "text-muted-foreground"}`}>
                Applicant
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRole("hr")}
              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                role === "hr"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              <Building2 className={`w-6 h-6 ${role === "hr" ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-sm font-medium ${role === "hr" ? "text-primary" : "text-muted-foreground"}`}>
                HR / Admin
              </span>
            </button>
          </div>

          {role === "hr" && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <strong>Note:</strong> HR access requires admin credentials.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 20s infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-20px) rotate(12deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default SignIn;

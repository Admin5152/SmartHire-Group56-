import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleRetry = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div
        className={`text-center transition-all duration-700 ${fadeIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      >
        {/* Ghost illustration */}
        <div className="mx-auto mb-8 w-48 h-48 relative">
          <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Floating shapes */}
            <g className="animate-pulse" style={{ animationDuration: "3s" }}>
              <polygon points="40,50 50,35 60,50 50,55" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" opacity="0.6" />
              <rect x="145" y="40" width="12" height="12" rx="2" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" opacity="0.5" transform="rotate(20 151 46)" />
              <polygon points="155,75 162,65 169,75" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" opacity="0.4" />
              <circle cx="35" cy="120" r="4" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" opacity="0.5" />
              <path d="M25,90 L35,85 L30,95 Z" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="2" opacity="0.6" />
            </g>
            {/* Ghost body */}
            <g>
              <ellipse cx="100" cy="160" rx="40" ry="8" fill="hsl(217, 91%, 90%)" opacity="0.5" />
              <path
                d="M60,120 C60,75 75,50 100,50 C125,50 140,75 140,120 L140,150 L128,140 L116,150 L104,140 L92,150 L80,140 L68,150 L60,145 Z"
                fill="hsl(217, 91%, 65%)"
                opacity="0.9"
              />
              <path
                d="M65,120 C65,78 78,55 100,55 C122,55 135,78 135,120 L135,145 L125,137 L115,145 L105,137 L95,145 L85,137 L75,145 L65,140 Z"
                fill="hsl(217, 91%, 75%)"
                opacity="0.7"
              />
              {/* Eyes */}
              <ellipse cx="85" cy="100" rx="8" ry="10" fill="white" />
              <ellipse cx="115" cy="100" rx="8" ry="10" fill="white" />
              <ellipse cx="87" cy="103" rx="4" ry="5" fill="hsl(217, 91%, 30%)" />
              <ellipse cx="117" cy="103" rx="4" ry="5" fill="hsl(217, 91%, 30%)" />
              {/* Sad mouth */}
              <path d="M90,118 Q100,112 110,118" fill="none" stroke="hsl(217, 91%, 30%)" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            {/* Wire/cord */}
            <path
              d="M60,145 Q40,155 30,145 Q20,135 25,125"
              fill="none"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth="2"
              opacity="0.6"
            />
            {/* Small hex shapes */}
            <g opacity="0.5">
              <circle cx="165" cy="110" r="5" fill="none" stroke="hsl(217, 91%, 60%)" strokeWidth="1.5" />
              <line x1="163" y1="108" x2="167" y2="112" stroke="hsl(217, 91%, 60%)" strokeWidth="1.5" />
              <line x1="167" y1="108" x2="163" y2="112" stroke="hsl(217, 91%, 60%)" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Page Not Found
        </h1>
        <p className="mb-8 text-lg text-muted-foreground max-w-md mx-auto">
          We couldn't find the page you were looking for. Check the URL to make sure it's correct and try again.
        </p>

        <Button
          onClick={handleRetry}
          size="lg"
          className="gap-2 px-8 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

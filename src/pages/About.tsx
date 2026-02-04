import { Link } from "react-router-dom";
import { Users, Rocket, Target, Heart, Award, Globe, Zap, Shield } from "lucide-react";

const About = () => {
  const benefits = [
    { icon: Globe, title: "Remote First", description: "Work from anywhere in the world" },
    { icon: Award, title: "Competitive Pay", description: "Top-tier compensation packages" },
    { icon: Heart, title: "Health & Wellness", description: "Comprehensive health benefits" },
    { icon: Zap, title: "Learning Budget", description: "Annual budget for growth" },
    { icon: Shield, title: "401(k) Match", description: "Company matched retirement" },
    { icon: Users, title: "Team Events", description: "Regular team building activities" },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="section-title mb-4">About SmartHire</h1>
          <p className="section-subtitle mx-auto">
            We're revolutionizing the hiring process with AI-powered solutions.
          </p>
        </div>

        {/* Story */}
        <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg text-muted-foreground">
            <p className="mb-4">
              SmartHire began as a university project at KNUST (Kwame Nkrumah University of Science and Technology) 
              in Ghana. What started as a group assignment for our software engineering course quickly became 
              something much bigger when we realized the real-world problem we were solving.
            </p>
            <p className="mb-4">
              As students, we saw firsthand how frustrating the job application process was—both for applicants 
              who felt their resumes were getting lost, and for recruiters drowning in hundreds of applications. 
              We knew there had to be a smarter way.
            </p>
            <p className="mb-4">
              Our team of five passionate students built the first version of SmartHire in just three months. 
              The AI-powered resume analyzer we developed could match candidates to job requirements in seconds, 
              saving HR teams hours of manual screening while giving applicants a fairer chance.
            </p>
            <p>
              Today, SmartHire serves companies across Ghana and beyond, helping them find the best talent 
              faster than ever. We're proud of our KNUST roots and continue to innovate with the same 
              collaborative spirit that started it all.
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Join Companies Using SmartHire</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={benefit.title}
                className="glass-card-hover p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card p-8 md:p-12 text-center max-w-2xl mx-auto animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-4">Ready to Join Us?</h2>
          <p className="text-muted-foreground mb-6">
            Explore our open positions and take the next step in your career.
          </p>
          <Link to="/jobs" className="btn-primary">
            View Open Positions
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;

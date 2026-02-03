import { Link } from "react-router-dom";
import { ArrowRight, Users, Rocket, Target, Heart, Briefcase, ChevronRight } from "lucide-react";
import { useJobs } from "@/contexts/JobsContext";

const Landing = () => {
  const { jobs } = useJobs();

  const values = [
    {
      icon: Rocket,
      title: "Innovation First",
      description: "We push boundaries and embrace new technologies to solve tomorrow's problems today.",
    },
    {
      icon: Users,
      title: "Collaborative Spirit",
      description: "Great ideas come from diverse teams working together with mutual respect and trust.",
    },
    {
      icon: Target,
      title: "Excellence Driven",
      description: "We set high standards and continuously strive to exceed them in everything we do.",
    },
    {
      icon: Heart,
      title: "People Matter",
      description: "Our team members are our greatest asset. We invest in growth and well-being.",
    },
  ];

  const expectations = [
    "Passion for technology and continuous learning",
    "Strong communication and collaboration skills",
    "Problem-solving mindset with attention to detail",
    "Commitment to quality and best practices",
    "Ability to work in a fast-paced environment",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="space-y-4">
            <h1 
              className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight animate-[fade-in_1s_ease-out_forwards] opacity-0"
              style={{ animationDelay: "0.3s" }}
            >
              Welcome
            </h1>
            <p 
              className="text-3xl md:text-4xl lg:text-5xl font-light text-white/90 animate-[fade-in_1s_ease-out_forwards] opacity-0"
              style={{ animationDelay: "0.8s" }}
            >
              Glad you're here
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-[fade-in_1s_ease-out_forwards] opacity-0"
              style={{ animationDelay: "1.3s" }}
            >
              <Link to="/jobs" className="bg-white text-primary font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 inline-flex items-center gap-2 text-lg">
                View Available Jobs
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/signin" className="bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 backdrop-blur-sm transition-all duration-300 hover:bg-white/30 inline-flex items-center gap-2 text-lg">
                Sign In to Apply
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="section-title mb-6">About Company X</h2>
            <p className="section-subtitle mx-auto text-lg">
              Founded in 2015, Company X has grown from a small startup to a leading technology company serving millions of users worldwide. We build products that make complex processes simple and empower businesses to achieve more.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Team Members" },
              { value: "50M+", label: "Users Worldwide" },
              { value: "30+", label: "Countries" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Our Values</h2>
            <p className="section-subtitle mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="glass-card-hover p-8 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expectations Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="section-title mb-6">What We Expect</h2>
                <p className="text-muted-foreground text-lg mb-8">
                  We're looking for talented individuals who share our passion for excellence and innovation. Here's what we value in our team members:
                </p>
                <ul className="space-y-4">
                  {expectations.map((expectation, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-success" />
                      </div>
                      <span className="text-foreground">{expectation}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-8">
                <div className="text-center">
                  <Briefcase className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{jobs.length} Open Positions</h3>
                  <p className="text-muted-foreground mb-6">
                    Explore our current openings and find the perfect role for you.
                  </p>
                  <Link to="/jobs" className="btn-primary inline-flex items-center gap-2">
                    Browse All Jobs
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Take the first step towards an exciting career at Company X. We can't wait to meet you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/jobs"
              className="bg-white text-primary font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
            >
              View Available Jobs
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/signup"
              className="bg-white/20 text-primary-foreground font-semibold px-8 py-4 rounded-xl border border-white/30 transition-all duration-300 hover:bg-white/30 inline-flex items-center gap-2"
            >
              Create Account
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-primary-foreground/80">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">X</span>
              </div>
              <span className="text-xl font-bold text-primary-foreground">Company X</span>
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/about" className="hover:text-primary-foreground transition-colors">About</Link>
              <Link to="/jobs" className="hover:text-primary-foreground transition-colors">Careers</Link>
              <a href="#" className="hover:text-primary-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Terms</a>
            </div>
            <div className="text-sm">
              © 2024 Company X. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import { Link } from "react-router-dom";
import { ArrowRight, Users, Rocket, Target, Heart, Briefcase, ChevronRight, Phone, Award, Globe, Zap, Shield, Mail, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Job {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  requirements: string[];
  department: string;
  location: string;
  type: string;
  posted_date: string;
}

const Landing = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showContact, setShowContact] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("posted_date", { ascending: false })
        .limit(6);
      
      if (!error && data) {
        setJobs(data);
      }
    };
    fetchJobs();
  }, []);

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

  const benefits = [
    { icon: Globe, title: "Remote First", description: "Work from anywhere in the world" },
    { icon: Award, title: "Competitive Pay", description: "Top-tier compensation packages" },
    { icon: Heart, title: "Health & Wellness", description: "Comprehensive health benefits" },
    { icon: Zap, title: "Learning Budget", description: "Annual budget for growth" },
    { icon: Shield, title: "401(k) Match", description: "Company matched retirement" },
    { icon: Users, title: "Team Events", description: "Regular team building activities" },
  ];

  const expectations = [
    "Passion for technology and continuous learning",
    "Strong communication and collaboration skills",
    "Problem-solving mindset with attention to detail",
    "Commitment to quality and best practices",
    "Ability to work in a fast-paced environment",
  ];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        {/* Gradient fallback while video loads */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50 transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`} />
        
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src="/videos/hero-background.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="space-y-8">
            <div className="space-y-3">
              <h1 
                className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight animate-[fade-in_1.2s_ease-out_forwards] opacity-0"
                style={{ 
                  animationDelay: "0.3s",
                  fontFamily: "'Playfair Display', 'Georgia', serif",
                  textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                Welcome
              </h1>
              <p 
                className="text-2xl md:text-3xl lg:text-4xl font-light text-white/95 animate-[fade-in_1.2s_ease-out_forwards] opacity-0 tracking-wide"
                style={{ 
                  animationDelay: "0.8s",
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.05em',
                  textShadow: '0 2px 15px rgba(0,0,0,0.5)'
                }}
              >
                Glad you're here
              </p>
            </div>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-[fade-in_1.2s_ease-out_forwards] opacity-0"
              style={{ animationDelay: "1.3s" }}
            >
              <a 
                href="#jobs" 
                className="bg-white text-primary font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 inline-flex items-center gap-2 text-lg group"
              >
                View Available Jobs
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </a>
              <Link 
                to="/signin" 
                className="bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border-2 border-white/40 backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:border-white/60 inline-flex items-center gap-2 text-lg group"
              >
                Sign In to Apply
                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
          style={{ animationDelay: "2s" }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-2">
            <div className="w-1.5 h-2 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="section-title mb-6">About SmartHire</h2>
            <div className="prose prose-lg text-muted-foreground text-left max-w-3xl mx-auto">
              <p className="mb-4 text-lg">
                SmartHire started as a simple idea during our time as students at KNUST (Kwame Nkrumah University of Science and Technology). What began as a group project for our software engineering class has grown into something we never imagined.
              </p>
              <p className="mb-4">
                We noticed how difficult and inefficient the hiring process was for both employers and job seekers. Traditional resume screening was time-consuming, often biased, and missed great candidates. That's when we decided to build a smarter solution.
              </p>
              <p>
                Today, SmartHire uses AI-powered resume analysis to help companies find the best talent faster, while giving applicants a fair chance to showcase their skills. We're proud to serve companies across Ghana and beyond, and we're just getting started.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            {[
              { value: "50+", label: "Companies" },
              { value: "1000+", label: "Jobs Posted" },
              { value: "1000+", label: "Applicants" },
              { value: "98%", label: "Satisfaction" },
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
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
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

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Why Join Us</h2>
            <p className="section-subtitle mx-auto">
              We invest in our people and their future
            </p>
          </div>
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
      </section>

      {/* Expectations Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
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
                  <a href="#jobs" className="btn-primary inline-flex items-center gap-2">
                    Browse All Jobs
                    <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="py-12 sm:py-16 md:py-24 bg-white scroll-mt-4">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title mb-6">We offer</h2>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                "Software Engineer",
                "Product Manager",
                "UX Designer",
                "Data Scientist",
                "DevOps Engineer",
                "QA Engineer",
                "Backend Engineer",
                "Frontend Engineer",
                "Full Stack Developer",
                "Cloud Architect",
                "Security Engineer",
                "Machine Learning Engineer",
              ].map((role) => (
                <span
                  key={role}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20"
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="section-subtitle mx-auto max-w-2xl">
              Join our team and help shape the future of technology
            </p>
          </div>

          {jobs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {jobs.map((job, index) => (
                <div
                  key={job.id}
                  className="glass-card-hover p-6 animate-fade-in-up group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{job.department}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                      {job.type}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  {job.tech_stack && job.tech_stack.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Tech Stack:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.tech_stack.slice(0, 4).map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-background text-foreground rounded text-xs border border-border"
                          >
                            {tech}
                          </span>
                        ))}
                        {job.tech_stack.length > 4 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
                            +{job.tech_stack.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all text-sm group"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No open positions yet</h3>
              <p className="text-muted-foreground">Check back soon for new opportunities!</p>
            </div>
          )}

          {jobs.length > 6 && (
            <div className="text-center mt-12">
              <Link
                to="/jobs"
                className="btn-primary inline-flex items-center gap-2"
              >
                View All {jobs.length} Positions
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Take the first step towards an exciting career at SmartHire. We can't wait to meet you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#jobs"
              className="bg-white text-primary font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 inline-flex items-center gap-2"
            >
              View Available Jobs
              <ArrowRight className="w-5 h-5" />
            </a>
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
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-xl font-bold text-primary-foreground">SmartHire</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#about" className="hover:text-primary-foreground transition-colors">About</a>
              <a href="#jobs" className="hover:text-primary-foreground transition-colors">Careers</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-foreground transition-colors">Terms</a>
            </div>
            <div className="text-sm">
              © 2024 SmartHire. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showContact && (
          <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-80 animate-[scale-in_0.3s_ease-out] border border-border">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg">Contact Us</h3>
              <button
                onClick={() => setShowContact(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Phone</p>
                  <a href="tel:+233241234567" className="text-muted-foreground hover:text-primary transition-colors">
                    +233 53 177 1042
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Email</p>
                  <a href="mailto:careers@smarthire.com" className="text-muted-foreground hover:text-primary transition-colors">
                    careers@smarthire.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Office</p>
                  <p className="text-muted-foreground text-sm">
                    KNUST Campus<br />
                    Kumasi, Ghana
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowContact(!showContact)}
          className="bg-primary text-primary-foreground w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group hover:shadow-primary/50"
          aria-label="Contact us"
        >
          {showContact ? (
            <span className="text-2xl">✕</span>
          ) : (
            <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Landing;

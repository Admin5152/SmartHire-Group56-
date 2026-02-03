import { Link } from "react-router-dom";
import { Users, Rocket, Target, Heart, Award, Globe, Zap, Shield } from "lucide-react";

const About = () => {
  const milestones = [
    { year: "2015", title: "Founded", description: "Started with a vision to transform technology" },
    { year: "2017", title: "Series A", description: "Raised $10M to scale operations" },
    { year: "2019", title: "Global Expansion", description: "Opened offices in 5 countries" },
    { year: "2021", title: "100K Users", description: "Reached our first major milestone" },
    { year: "2023", title: "Series C", description: "Raised $100M for global growth" },
    { year: "2024", title: "50M Users", description: "Serving millions worldwide" },
  ];

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
          <h1 className="section-title mb-4">About Company X</h1>
          <p className="section-subtitle mx-auto">
            We're building the future of technology, one innovation at a time.
          </p>
        </div>

        {/* Story */}
        <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-16 animate-fade-in-up">
          <h2 className="text-2xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-lg text-muted-foreground">
            <p className="mb-4">
              Company X was founded in 2015 with a simple mission: to make complex technology accessible to everyone. What started as a small team of passionate engineers has grown into a global company serving millions of users.
            </p>
            <p className="mb-4">
              Today, we're at the forefront of innovation, building products that transform how businesses operate and how people work. Our diverse team of over 500 talented individuals brings together unique perspectives and expertise from around the world.
            </p>
            <p>
              We believe that the best ideas come from collaboration, and we're committed to creating an environment where everyone can thrive and do their best work.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Journey</h2>
          <div className="grid md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className="glass-card p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                <div className="font-semibold mb-1">{milestone.title}</div>
                <div className="text-sm text-muted-foreground">{milestone.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Join Us</h2>
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

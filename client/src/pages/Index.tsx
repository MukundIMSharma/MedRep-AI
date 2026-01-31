import { Link } from "react-router-dom";
import { FlaskConical, MessageSquare, Shield, FileCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI-Powered Chat",
    description: "Get instant answers about drug approvals, safety, and reimbursement from verified sources",
  },
  {
    icon: Shield,
    title: "Trust-First Design",
    description: "Every response includes source citations. We never make claims without verified data",
  },
  {
    icon: FileCheck,
    title: "Multi-Category Search",
    description: "Query across CDSCO approvals, safety information, and Ayushman Bharat coverage",
  },
];

export default function Index() {
  const { user } = useAuth();

  // If user is logged in, redirect to chat
  if (user) {
    return null; // Protected route will handle redirection
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              AI-Powered Medical Information
            </span>
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6 animate-slide-up">
            <div className="w-20 h-20 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
              <FlaskConical className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            Your Digital
            <span className="text-gradient block">Medical Representative</span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up">
            Get instant, accurate drug and reimbursement information from verified 
            Indian sources. Built for healthcare professionals who need reliable answers fast.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Link to="/register">
              <Button size="lg" className="gradient-primary text-primary-foreground shadow-glow h-12 px-8">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="glass rounded-xl p-6 transition-all hover:border-primary/30 hover:shadow-glow animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">MedRep AI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Information from verified sources only. Not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

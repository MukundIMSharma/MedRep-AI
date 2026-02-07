import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Upload, MessageSquare, Menu, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-white/5 bg-card/40 backdrop-blur-3xl sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="gradient-primary p-2.5 rounded-2xl shadow-glow transition-all group-hover:scale-110 group-hover:rotate-3 ring-4 ring-primary/10">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-foreground group-hover:text-primary transition-colors">MedRep AI</span>
              <div className="flex items-center gap-1.5 hidden sm:flex">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 -mt-0.5">
                  Verified Data Portal
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/">
                  <Button
                    variant={isActive("/") ? "secondary" : "ghost"}
                    className={`gap-2 rounded-xl transition-all ${isActive("/") ? "bg-primary/10 text-primary border-primary/20" : ""}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                </Link>

                {isAdmin && (
                  <Link to="/admin/documents">
                    <Button
                      variant={isActive("/admin/documents") ? "secondary" : "ghost"}
                      className={`gap-2 rounded-xl transition-all ${isActive("/admin/documents") ? "bg-primary/10 text-primary border-primary/20" : ""}`}
                    >
                      <Upload className="w-4 h-4" />
                      Documents
                    </Button>
                  </Link>
                )}

                <div className="h-6 w-px bg-white/10 mx-2" />

                <div className="flex items-center gap-4 pl-2">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-bold tracking-tight text-foreground">{user.fullname}</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary/70">
                      {isAdmin ? "System Admin" : "Clinical Partner"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="rounded-xl font-bold tracking-widest text-xs uppercase">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="gradient-primary text-primary-foreground rounded-xl shadow-glow font-bold tracking-widest text-xs uppercase px-6">
                    Join Network
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl bg-white/5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-white/5 animate-pop-in">
            {user ? (
              <div className="space-y-3">
                <div className="px-4 py-4 rounded-2xl bg-white/5 mb-4">
                  <p className="font-bold text-foreground tracking-tight">{user.fullname}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mt-1">{user.email}</p>
                </div>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-12 justify-start gap-3 rounded-2xl">
                    <MessageSquare className="w-5 h-5" />
                    Clinical Chat
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin/documents" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full h-12 justify-start gap-3 rounded-2xl">
                      <Upload className="w-5 h-5" />
                      Document Manager
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full h-12 justify-start gap-3 rounded-2xl text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Terminate Session
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full h-12 rounded-2xl">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-12 gradient-primary text-primary-foreground rounded-2xl">
                    Get Started Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

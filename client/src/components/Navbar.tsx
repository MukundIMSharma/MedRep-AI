import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LogOut, Upload, MessageSquare, Menu, X, FlaskConical } from "lucide-react";
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
    <nav className="border-b border-border glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="gradient-primary p-2 rounded-xl shadow-glow transition-transform group-hover:scale-105">
              <FlaskConical className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">MedRep AI</span>
              <span className="text-[10px] text-muted-foreground -mt-1 hidden sm:block">
                Digital Medical Representative
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/">
                  <Button
                    variant={isActive("/") ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                </Link>

                {isAdmin && (
                  <Link to="/admin/documents">
                    <Button
                      variant={isActive("/admin/documents") ? "secondary" : "ghost"}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Documents
                    </Button>
                  </Link>
                )}

                <div className="h-6 w-px bg-border mx-2" />

                <div className="flex items-center gap-3">
                  <div className="text-right hidden lg:block">
                    <p className="text-sm font-medium text-foreground">{user.fullname}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Administrator" : "Healthcare Professional"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button className="gradient-primary text-primary-foreground shadow-glow">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {user ? (
              <div className="space-y-2">
                <div className="px-2 py-3 border-b border-border mb-2">
                  <p className="font-medium text-foreground">{user.fullname}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin/documents" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Upload className="w-4 h-4" />
                      Documents
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 text-destructive"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gradient-primary text-primary-foreground">
                    Get Started
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

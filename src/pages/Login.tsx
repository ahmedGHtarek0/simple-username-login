import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User, LogIn, Sparkles } from "lucide-react";

interface LoginProps {
  onLogin: (username: string) => void;
}

const ALLOWED_USERS = ["testname", "elzohary"];

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      if (!ALLOWED_USERS.includes(trimmed)) {
        toast({ title: "Invalid username", description: "User not found.", variant: "destructive" });
        return;
      }

      localStorage.setItem("loggedInUser", trimmed);
      onLogin(trimmed);
    }, 300);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/30 blur-3xl" />
      </div>

      <Card className="w-full max-w-md shadow-2xl border-border/50 backdrop-blur-sm relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="mt-2">Enter your username to access your profile</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12 text-base"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Try logging in with <span className="font-semibold text-foreground">testname</span> or <span className="font-semibold text-foreground">elzohary</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

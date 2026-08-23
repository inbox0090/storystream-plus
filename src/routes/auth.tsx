import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Novaflix" },
      { name: "description", content: "Sign in or create your Novaflix account to start streaming." },
      { property: "og:title", content: "Sign in — Novaflix" },
      { property: "og:description", content: "Sign in or create your Novaflix account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAuthenticated) void navigate({ to: "/profiles" });
  }, [isAuthenticated, navigate]);

  const signIn = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    void navigate({ to: "/profiles" });
  };

  const signUp = async () => {
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/profiles` },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your inbox if confirmation is required.");
  };

  const google = async () => {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-background px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-background" />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-card/90 p-8 backdrop-blur">
        <Link to="/" className="font-display text-3xl tracking-widest text-primary">
          NOVAFLIX
        </Link>
        <Tabs defaultValue="signin" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <TabsContent value="signin" className="mt-4">
            <Button className="w-full" disabled={busy} onClick={() => void signIn()}>
              Sign in
            </Button>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
            <Button className="w-full" disabled={busy} onClick={() => void signUp()}>
              Create account
            </Button>
          </TabsContent>
        </Tabs>
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button variant="secondary" className="w-full" onClick={() => void google()}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}

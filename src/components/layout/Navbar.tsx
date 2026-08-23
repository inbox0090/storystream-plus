import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { profilesQuery } from "@/lib/user-data";
import { useActiveProfile } from "@/store/profile";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/browse/series", label: "Series" },
  { to: "/browse/movies", label: "Movies" },
  { to: "/my-list", label: "My List" },
  { to: "/plans", label: "Plans" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { activeProfileId, setActiveProfile } = useActiveProfile();
  const { data: profiles = [] } = useQuery(profilesQuery(user?.id));
  const active = profiles.find((p) => p.id === activeProfileId);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setActiveProfile(null);
    navigate({ to: "/" });
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "bg-background/95 backdrop-blur" : "bg-gradient-to-b from-black/80 to-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:gap-8 md:px-8">
        <Link to="/" className="font-display text-2xl tracking-widest text-primary md:text-3xl">
          NOVAFLIX
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground font-semibold" }}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" aria-label="Search">
            <Link to="/search">
              <Search className="size-5" />
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <Link
                to="/profiles"
                className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent"
              >
                <span
                  className="grid size-8 place-items-center rounded font-semibold text-black"
                  style={{ backgroundColor: active?.avatar_color ?? "#e50914" }}
                >
                  {active?.name?.[0]?.toUpperCase() ?? <UserCircle2 className="size-4" />}
                </span>
                <span className="hidden md:inline">{active?.name ?? "Profiles"}</span>
              </Link>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

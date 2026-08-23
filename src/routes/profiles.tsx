import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2, Baby } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useViewerContext } from "@/hooks/useCatalog";
import { AVATAR_COLORS, createProfile, deleteProfile } from "@/lib/user-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profiles")({
  head: () => ({
    meta: [
      { title: "Who's watching? — Novaflix" },
      { name: "description", content: "Switch between viewer profiles or create a new kids profile." },
      { property: "og:title", content: "Who's watching? — Novaflix" },
      { property: "og:description", content: "Manage the viewer profiles on your Novaflix account." },
    ],
  }),
  component: ProfilesPage,
});

function ProfilesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, loading, profiles, setActiveProfile } = useViewerContext();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(AVATAR_COLORS[0]!);
  const [isKids, setIsKids] = useState(false);

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      await createProfile({ userId: user.id, name: name.trim(), avatarColor: color, isKids });
    },
    onSuccess: () => {
      setOpen(false);
      setName("");
      setIsKids(false);
      void queryClient.invalidateQueries({ queryKey: ["viewer-profiles"] });
      toast.success("Profile created");
    },
    onError: () => toast.error("Could not create profile"),
  });

  const remove = useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["viewer-profiles"] });
      toast.success("Profile removed");
    },
  });

  if (!loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="grid min-h-screen place-items-center px-4 text-center">
          <div>
            <h1 className="text-4xl">Sign in to manage profiles</h1>
            <Button asChild className="mt-6">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pt-28 pb-16 text-center md:px-8">
        <h1 className="text-4xl md:text-5xl">Who&apos;s watching?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Each profile keeps its own My List and playback position.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {profiles.map((p) => (
            <div key={p.id} className="group w-28">
              <button
                type="button"
                onClick={() => {
                  setActiveProfile(p.id);
                  void navigate({ to: "/" });
                }}
                className="block w-full"
              >
                <span
                  className={cn(
                    "grid aspect-square w-full place-items-center rounded-lg font-display text-4xl text-black transition-transform group-hover:scale-105",
                  )}
                  style={{ backgroundColor: p.avatar_color }}
                >
                  {p.is_kids ? <Baby className="size-10" /> : p.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="mt-2 block truncate text-sm text-muted-foreground">{p.name}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete ${p.name}`}
                onClick={() => remove.mutate(p.id)}
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-3" /> Delete
              </button>
            </div>
          ))}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button type="button" className="w-28">
                <span className="grid aspect-square w-full place-items-center rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary">
                  <Plus className="size-8" />
                </span>
                <span className="mt-2 block text-sm text-muted-foreground">Add profile</span>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pname">Name</Label>
                  <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Avatar colour</Label>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Colour ${c}`}
                        onClick={() => setColor(c)}
                        className={cn(
                          "size-8 rounded-full border-2",
                          color === c ? "border-foreground" : "border-transparent",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-md border border-border p-3">
                  <div className="text-left">
                    <p className="text-sm font-medium">Kids profile</p>
                    <p className="text-xs text-muted-foreground">Only family-friendly titles</p>
                  </div>
                  <Switch checked={isKids} onCheckedChange={setIsKids} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={!name.trim() || create.isPending}
                  onClick={() => create.mutate()}
                >
                  Create profile
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
}

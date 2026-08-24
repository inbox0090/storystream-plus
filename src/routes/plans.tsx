import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Navbar } from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useViewerContext } from "@/hooks/useCatalog";
import { formatPrice, plansQuery } from "@/lib/catalog";
import { selectPlan, subscriptionQuery } from "@/lib/user-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [
      { title: "Plans & pricing — Novaflix" },
      {
        name: "description",
        content: "Compare Novaflix Basic, Standard and Premium plans: HD, 4K HDR, downloads and multi-screen streaming.",
      },
      { property: "og:title", content: "Plans & pricing — Novaflix" },
      { property: "og:description", content: "Basic, Standard and Premium streaming plans." },
    ],
  }),
  component: PlansPage,
});

function PlansPage() {
  const { user, isAuthenticated } = useViewerContext();
  const queryClient = useQueryClient();
  const { data: plans = [] } = useQuery(plansQuery());
  const { data: subscription } = useQuery(subscriptionQuery(user?.id));

  const choose = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) throw new Error("Not signed in");
      await selectPlan({ userId: user.id, planId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plan activated");
    },
    onError: () => toast.error("Could not change plan"),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pt-28 pb-20 md:px-8">
        <h1 className="text-4xl md:text-5xl">Choose your plan</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cancel any time. Change plans whenever you like.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => {
            const current = subscription?.plan_id === plan.id;
            return (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-lg border p-6",
                  current ? "border-primary bg-card" : "border-border bg-card/60",
                )}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl">{plan.name}</h2>
                  {current && <Badge>Current</Badge>}
                </div>
                <p className="mt-3 text-3xl font-semibold">
                  {formatPrice(plan.price_cents, plan.currency)}
                  <span className="text-sm font-normal text-muted-foreground"> /month</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <Check className="size-4 text-primary" /> {plan.max_quality} video quality
                  </li>
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      variant={current ? "secondary" : "default"}
                      disabled={current || choose.isPending}
                      onClick={() => choose.mutate(plan.id)}
                    >
                      {current ? "Your plan" : `Choose ${plan.name}`}
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to="/auth">Sign in to subscribe</Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {subscription && (
          <p className="mt-8 text-sm text-muted-foreground">
            Status: {subscription.status} · renews{" "}
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </p>
        )}
      </main>
    </div>
  );
}

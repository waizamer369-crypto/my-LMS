import { useNavigate } from "react-router";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Signed out");
      navigate("/login");
    },
  });

  return (
    <div className="min-h-screen bg-voe-cream font-sans">
      <header className="bg-white border-b border-voe-navy/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-display font-semibold text-voe-navy">
            Voice of Eden Pakistan
          </span>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-1.5 text-sm text-voe-navy/60 hover:text-voe-navy transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-2xl font-semibold text-voe-navy mb-2">
          Welcome{user?.name ? `, ${user.name}` : ""} 👋
        </h1>
        <p className="text-voe-navy/60 mb-8">
          You're signed in as {user?.email}. Your courses and dashboard widgets go here next.
        </p>

        <div className="rounded-xl border border-voe-navy/10 bg-white p-6">
          <p className="text-sm text-voe-navy/50">
            This is a placeholder dashboard confirming login works end to end. Next up:
            course catalog, enrolled courses, and progress tracking.
          </p>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import logo from "@/lms-site/assets/logo.png";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const utils = trpc.useUtils();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Welcome back!");
      navigate("/dashboard");
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Login failed"),
  });

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Account created — welcome!");
      navigate("/dashboard");
    },
    onError: (err: { message?: string }) => toast.error(err.message || "Signup failed"),
  });

  const isSubmitting = loginMutation.isPending || signupMutation.isPending;

  return (
    <div className="min-h-screen flex bg-voe-cream font-sans">
      {/* Brand panel */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-gradient-to-br from-voe-navy-deep via-voe-navy to-[#24357f] flex-col justify-between p-14 text-white">
        <div
          className="absolute w-[520px] h-[520px] rounded-full left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(253,185,19,0.25), transparent 68%)",
          }}
        />
        <div className="relative z-10 flex items-center gap-2.5">
          <img src={logo} alt="Voice of Eden Pakistan" className="h-9" />
          <span className="font-display font-semibold tracking-wide">
            Voice of Eden Pakistan
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-6 flex-1 justify-center">
          <div className="relative w-56 h-56">
            <div
              className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, #FFE59A, #FDB913 55%, #F5871F 100%)",
                boxShadow: "0 0 40px 8px rgba(253,185,19,0.4)",
              }}
            />
          </div>
          <h2 className="font-display text-2xl font-semibold max-w-xs leading-snug">
            Community Development with Skills &amp; Education
          </h2>
          <p className="text-voe-sky max-w-xs text-sm">
            Sign in to keep learning, or join to start your first course today.
          </p>
        </div>

        <p className="relative z-10 text-xs text-voe-sky/70">
          © {new Date().getFullYear()} Voice of Eden Pakistan
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 justify-center mb-8">
            <img src={logo} alt="Voice of Eden Pakistan" className="h-8" />
            <span className="font-display font-semibold text-voe-navy">
              Voice of Eden Pakistan
            </span>
          </div>

          <div className="flex bg-voe-navy/5 rounded-xl p-1 mb-8">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === "login"
                  ? "bg-white text-voe-navy shadow-sm"
                  : "text-voe-navy/50"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                mode === "signup"
                  ? "bg-white text-voe-navy shadow-sm"
                  : "text-voe-navy/50"
              }`}
            >
              Join
            </button>
          </div>

          <h1 className="font-display text-2xl font-semibold text-voe-navy mb-1">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-voe-navy/60 mb-6">
            {mode === "login"
              ? "Sign in to continue your learning journey."
              : "Join to start learning new skills today."}
          </p>

          {mode === "login" ? (
            <form
              onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-voe-navy mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  {...loginForm.register("email")}
                  className="w-full rounded-lg border border-voe-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-voe-gold focus:ring-2 focus:ring-voe-gold/20 transition"
                  placeholder="you@example.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-voe-navy mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...loginForm.register("password")}
                    className="w-full rounded-lg border border-voe-navy/15 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-voe-gold focus:ring-2 focus:ring-voe-gold/20 transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-voe-navy/40 hover:text-voe-navy"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-voe-navy hover:bg-voe-navy-deep text-white font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>
          ) : (
            <form
              onSubmit={signupForm.handleSubmit((data) => signupMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-voe-navy mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  {...signupForm.register("name")}
                  className="w-full rounded-lg border border-voe-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-voe-gold focus:ring-2 focus:ring-voe-gold/20 transition"
                  placeholder="Your name"
                />
                {signupForm.formState.errors.name && (
                  <p className="text-xs text-red-500 mt-1">
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-voe-navy mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  {...signupForm.register("email")}
                  className="w-full rounded-lg border border-voe-navy/15 px-3.5 py-2.5 text-sm outline-none focus:border-voe-gold focus:ring-2 focus:ring-voe-gold/20 transition"
                  placeholder="you@example.com"
                />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-voe-navy mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...signupForm.register("password")}
                    className="w-full rounded-lg border border-voe-navy/15 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-voe-gold focus:ring-2 focus:ring-voe-gold/20 transition"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-voe-navy/40 hover:text-voe-navy"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-red-500 mt-1">
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-voe-gold hover:bg-voe-gold-deep text-voe-navy-deep font-semibold rounded-lg py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Create Account
              </button>
            </form>
          )}

          <p className="text-center text-xs text-voe-navy/50 mt-6">
            <Link to="/" className="hover:text-voe-navy underline underline-offset-2">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

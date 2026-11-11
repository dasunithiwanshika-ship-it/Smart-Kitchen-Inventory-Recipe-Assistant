import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, AlertCircle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OLLA_ASSETS } from '../../constants/ollaAssets';

export const AuthModal: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setIsLoading(false);
          return;
        }
        await register(email.trim(), password, fullName.trim());
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#e9e7df] text-[#16193a] flex flex-col justify-between">
      {/* Full-bleed Looping Kitchen HUD Video Background */}
      <video
        src="/login-bg.mp4"
        poster={OLLA_ASSETS.KITCHEN}
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0 scale-[1.01]"
      />

      {/* Soft atmospheric scrim so glass panels stay crisp and legible */}
      <div
        className="fixed inset-0 z-1 pointer-events-none"
        style={{
          background:
            'linear-gradient(115deg, rgba(20, 26, 74, 0.28) 0%, rgba(233, 231, 223, 0.14) 48%, rgba(20, 26, 74, 0.34) 100%)',
        }}
      />

      {/* Top Floating Frosted-Glass Bar */}
      <header className="relative z-10 w-[calc(100vw-24px)] md:w-[87vw] mx-auto mt-[1.9vh] h-[52px] rounded-[12px] bg-white/70 backdrop-blur-xl border border-white/75 px-4 sm:px-6 flex items-center justify-between shadow-[0_8px_30px_rgba(20,26,74,0.08)]">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-[#141a4a]">
            olla
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#f7d23a] text-[#141a4a] text-[10px] font-semibold tracking-wide">
            <Sparkles className="w-3 h-3" />
            SMART KITCHEN AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              isLogin
                ? 'bg-[#141a4a] text-white'
                : 'text-[#141a4a] hover:bg-white/70'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError(null);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              !isLogin
                ? 'bg-[#141a4a] text-white'
                : 'text-[#141a4a] hover:bg-white/70'
            }`}
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Content Stage */}
      <main className="relative z-10 w-[calc(100vw-24px)] md:w-[87vw] mx-auto my-auto py-8 flex flex-col lg:flex-row items-center lg:items-end justify-between gap-6">
        {/* Left Translucent Kitchen HUD Summary Card (inspired by the video HUD) */}
        <div className="hidden lg:block max-w-md relative rounded-[18px] bg-white/35 backdrop-blur-xl border border-white/65 p-6 text-[#141a4a] shadow-[0_18px_50px_rgba(20,26,74,0.14)]">
          {/* HUD Corner Brackets */}
          <span className="pointer-events-none absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white/90 rounded-tl-md" />
          <span className="pointer-events-none absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white/90 rounded-tr-md" />
          <span className="pointer-events-none absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white/90 rounded-bl-md" />
          <span className="pointer-events-none absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white/90 rounded-br-md" />

          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/50">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#141a4a]/80">
              KITCHEN HUD · LIVE
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/80 text-[#141a4a]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Zero-Waste Lock: Active
            </span>
          </div>

          <h2 className="mt-3.5 text-2xl font-semibold tracking-[-0.02em] leading-snug text-[#141a4a]">
            Know what’s in your kitchen, before it goes to waste.
          </h2>

          <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
            <div className="rounded-xl bg-white/55 border border-white/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#141a4a]/65 font-semibold">
                Smart Scan
              </p>
              <p className="font-semibold text-[#141a4a] mt-0.5">MFD &amp; EXP Reader</p>
            </div>
            <div className="rounded-xl bg-white/55 border border-white/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#141a4a]/65 font-semibold">
                AI Recipes
              </p>
              <p className="font-semibold text-[#141a4a] mt-0.5">Try-This Suggestions</p>
            </div>
            <div className="rounded-xl bg-white/55 border border-white/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#141a4a]/65 font-semibold">
                Freshness
              </p>
              <p className="font-semibold text-[#141a4a] mt-0.5">Live Expiry Alerts</p>
            </div>
            <div className="rounded-xl bg-white/55 border border-white/60 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-[#141a4a]/65 font-semibold">
                Leftovers
              </p>
              <p className="font-semibold text-[#141a4a] mt-0.5">Portion &amp; Use-By</p>
            </div>
          </div>
        </div>

        {/* Right Frosted-Glass Login / Register HUD Panel */}
        <section className="relative w-full max-w-[420px] rounded-[20px] bg-white/75 backdrop-blur-2xl border border-white/85 p-6 sm:p-8 shadow-[0_24px_60px_rgba(20,26,74,0.22)]">
          {/* HUD Corner Brackets */}
          <span className="pointer-events-none absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-[#141a4a]/25 rounded-tl-md" />
          <span className="pointer-events-none absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-[#141a4a]/25 rounded-tr-md" />
          <span className="pointer-events-none absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-[#141a4a]/25 rounded-bl-md" />
          <span className="pointer-events-none absolute bottom-3 right-3 w-3.5 h-3.5 border-b-2 border-r-2 border-[#141a4a]/25 rounded-br-md" />

          <div className="mb-5">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f7d23a] text-[#141a4a] text-[10px] font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isLogin ? 'Kitchen Access' : 'New Household'}
              </span>
              <span className="text-[11px] font-medium text-[#141a4a]/60">olla AI</span>
            </div>

            <h1 className="mt-3.5 text-2xl sm:text-[26px] font-semibold tracking-[-0.02em] text-[#141a4a] leading-tight">
              {isLogin ? 'Welcome back.' : 'Create your kitchen.'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#16193a]/70">
              {isLogin
                ? 'Sign in to view your inventory, alerts, and AI recipe ideas.'
                : 'Set up your smart pantry & expiry tracker in seconds.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50/95 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-[#141a4a] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#141a4a]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required={!isLogin}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Dasuni Thiwanshika"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/85 border border-[#141a4a]/15 text-[#141a4a] placeholder:text-[#141a4a]/40 text-xs focus:bg-white focus:outline-none focus:border-[#141a4a] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#141a4a] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#141a4a]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/85 border border-[#141a4a]/15 text-[#141a4a] placeholder:text-[#141a4a]/40 text-xs focus:bg-white focus:outline-none focus:border-[#141a4a] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#141a4a] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#141a4a]/45 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/85 border border-[#141a4a]/15 text-[#141a4a] placeholder:text-[#141a4a]/40 text-xs focus:bg-white focus:outline-none focus:border-[#141a4a] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full py-3 rounded-[40px] bg-[#141a4a] hover:bg-[#3a49c9] text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-[#141a4a]/20"
            >
              <span>
                {isLoading ? 'Signing in...' : isLogin ? 'Open Kitchen Dashboard' : 'Create Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#141a4a]/10 flex items-center justify-between text-xs">
            <span className="text-[#16193a]/65">
              {isLogin ? 'New to olla?' : 'Already have an account?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="font-semibold text-[#141a4a] hover:text-[#3a49c9] underline underline-offset-4 cursor-pointer"
            >
              {isLogin ? 'Create account' : 'Sign in instead'}
            </button>
          </div>
        </section>
      </main>

      {/* Subtle Bottom Footer Spacer */}
      <footer className="relative z-10 w-[calc(100vw-24px)] md:w-[87vw] mx-auto pb-4 flex items-center justify-between text-[11px] text-white/85 font-medium drop-shadow-xs">
        <span>olla Stack-smart Kitchen OS</span>
        <span className="hidden sm:inline">Real-time Pantry · Expiry Guard · AI Recipes</span>
      </footer>
    </div>
  );
};

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/hero_cyberpunk_bg_1788280645324.jpg" 
          alt="Cyberpunk Soldier" 
          className="w-full h-full object-cover object-right lg:object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 lg:px-12 py-6 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-magenta to-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white font-bold text-xl">
              G
            </div>
            <span className="font-display font-bold text-xl tracking-wide hidden sm:block text-white">
              GameSphere
            </span>
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/games" className="hover:text-white transition-colors">Games</Link>
            <Link href="/news" className="hover:text-white transition-colors">News</Link>
            <Link href="/groups" className="hover:text-white transition-colors">Communities</Link>
            <Link href="/tournaments" className="hover:text-white transition-colors">Tournaments</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors hidden sm:block">
            Login
          </Link>
          <Link href="/register">
            <Button variant="neonOutline" className="px-6 rounded-full border-accent-magenta text-accent-magenta shadow-[0_0_10px_rgba(217,38,169,0.3)]">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center px-6 lg:px-24 max-w-3xl">
        <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
          Connect. <span className="text-accent-magenta">Play.</span> Compete. <span className="text-accent-blue">Conquer.</span>
        </h1>
        <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
          The ultimate gaming social platform to connect with gamers, discover games, join communities, and compete in tournaments.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/register">
            <Button variant="default" className="w-full sm:w-auto px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(139,92,246,0.4)]">
              Get Started
            </Button>
          </Link>
          <Link href="/games">
            <Button variant="outline" className="w-full sm:w-auto px-8 py-6 rounded-full text-lg border-white/20 hover:bg-white/10 text-white">
              Explore Games
            </Button>
          </Link>
        </div>
      </main>

      {/* Stats Footer */}
      <footer className="relative z-10 px-6 lg:px-24 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 border-t border-white/5 bg-background/50 backdrop-blur-sm">
        {[
          { label: 'Gamers', value: '1.2M+' },
          { label: 'Communities', value: '25K+' },
          { label: 'Tournaments', value: '8K+' },
          { label: 'Daily Posts', value: '50K+' },
        ].map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl lg:text-4xl font-bold font-display text-white mb-1">{stat.value}</p>
            <p className="text-sm text-white/50">{stat.label}</p>
          </div>
        ))}
      </footer>
    </div>
  );
}

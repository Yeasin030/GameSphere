"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '../../../stores/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: ''
  });

  // Track if user manually detached username from name
  const [isUsernameCustom, setIsUsernameCustom] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      setFormData(prev => ({
        ...prev,
        name: value,
        username: isUsernameCustom ? prev.username : sanitized,
      }));
    } else if (name === 'username') {
      setIsUsernameCustom(true);
      setFormData(prev => ({
        ...prev,
        username: value.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const registeredUser = await register({
        ...formData,
        username: formData.username || formData.name.toLowerCase().replace(/[^a-z0-9_]/g, '')
      });
      // Connected directly to user profile page
      router.push('/profile');
    } catch {
      // error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Image & Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center">
        <img 
          src="/hero_cyberpunk_bg_1788280645324.jpg" 
          alt="Cyberpunk" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background" />
        
        <div className="relative z-10 p-12 text-center max-w-lg">
           <Link href="/welcome" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent-magenta to-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] text-white font-bold text-2xl">
              G
            </div>
            <span className="font-display font-bold text-3xl tracking-wide text-white">
              GameSphere
            </span>
          </Link>
          <h2 className="text-4xl font-display font-bold text-white mb-4 leading-tight">
            Connect. Play. Compete. Conquer.
          </h2>
          <p className="text-white/60 text-lg">
            Join the ultimate gaming social network.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-surface-light/30 backdrop-blur-3xl z-0" />
        
        <div className="w-full max-w-md relative z-10 space-y-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Create Your<br/>GameSphere Account</h1>
            <p className="text-foreground/60">Join millions of gamers today!</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Display Name" 
                className="bg-surface/50 border-surface-border h-12 rounded-xl text-white placeholder:text-foreground/40"
              />
              <Input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Username" 
                className="bg-surface/50 border-surface-border h-12 rounded-xl text-white placeholder:text-foreground/40"
              />
              {formData.username && (
                <p className="text-xs text-purple-400 pl-1">
                  Your profile will be: <span className="font-semibold text-white">@{formData.username}</span>
                </p>
              )}
              <Input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Email Address" 
                className="bg-surface/50 border-surface-border h-12 rounded-xl text-white placeholder:text-foreground/40"
              />
              <Input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password" 
                className="bg-surface/50 border-surface-border h-12 rounded-xl text-white placeholder:text-foreground/40"
              />
              <Input 
                type="password" 
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                placeholder="Confirm Password" 
                className="bg-surface/50 border-surface-border h-12 rounded-xl text-white placeholder:text-foreground/40"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="terms" required className="w-4 h-4 rounded border-surface-border bg-surface text-primary focus:ring-primary focus:ring-offset-0" />
              <label htmlFor="terms" className="text-sm text-foreground/60">
                I agree to the <a href="#" className="text-accent-magenta hover:underline">Terms of Service</a> and <a href="#" className="text-accent-magenta hover:underline">Privacy Policy</a>
              </label>
            </div>

            <Button type="submit" disabled={isLoading} variant="default" className="w-full h-12 text-lg font-bold rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-foreground/50">or continue with</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button type="button" className="flex-1 h-12 rounded-xl bg-surface border border-surface-border flex items-center justify-center hover:bg-surface-light transition-colors">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
            </button>
            <button type="button" className="flex-1 h-12 rounded-xl bg-surface border border-surface-border flex items-center justify-center hover:bg-surface-light transition-colors">
              <img src="https://www.svgrepo.com/show/354388/steam.svg" alt="Steam" className="w-5 h-5 filter invert" />
            </button>
            <button type="button" className="flex-1 h-12 rounded-xl bg-surface border border-surface-border flex items-center justify-center hover:bg-surface-light transition-colors">
              <img src="https://www.svgrepo.com/show/353655/discord-icon.svg" alt="Discord" className="w-6 h-6 text-[#5865F2]" />
            </button>
          </div>

          <p className="text-center text-sm text-foreground/60">
            Already have an account? <Link href="/login" className="text-accent-blue font-bold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

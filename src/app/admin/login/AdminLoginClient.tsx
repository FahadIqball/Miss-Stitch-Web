'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLoginClient: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!isSupabaseConfigured()) {
        // Local offline sandbox mode
        if (password === 'admin123' || password === 'missstitch2026') {
          router.push('/admin');
          return;
        }
        throw new Error('Invalid credentials. In local sandbox mode, use password: admin123');
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Authentication failed. No user found.');
      }

      // Check role in profiles
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileErr || (profile as any)?.role !== 'admin') {
        // Sign out immediately if not admin
        await supabase.auth.signOut();
        throw new Error('Access Denied: This account does not have Workshop Administrator privileges.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in as admin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F24] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#D4AF37]/50 p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-[#E61A6B] flex items-center justify-center mx-auto mb-4 text-white font-serif font-bold text-xl shadow-md">
            MS
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#0A5C36]/10 text-[#0A5C36] text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Atelier Workshop Portal</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1F1F24]">
            Karkhana Administration
          </h1>
          <p className="text-xs text-[#66666E] mt-1">
            Restricted access for Master Tailors and Workshop Operations
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleAdminSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F1F24] mb-1">
              Admin Email Address
            </label>
            <input
              type="email"
              required
              placeholder="admin@missstitch.pk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1F1F24] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-rani w-full py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-6 cursor-pointer disabled:opacity-70 shadow-sm"
          >
            <span>{isLoading ? 'Verifying Atelier Access...' : 'Sign In to Atelier'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-[#E5E2DC] text-center">
          <Link
            href="/"
            className="text-xs text-[#66666E] hover:text-[#1F1F24] hover:underline"
          >
            ← Back to Customer Website
          </Link>
        </div>
      </div>
    </div>
  );
};

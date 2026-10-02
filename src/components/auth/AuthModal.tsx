'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import {
  registerWithEmailAction,
  loginWithPhoneOtpAction,
} from '@/app/actions/authActions';
import {
  X,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Mail,
  Lock,
  AlertCircle,
  User,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal } = useUIStore();
  const { setUser } = useAuthStore();

  const [authMode, setAuthMode] = useState<'email' | 'phone'>('email');
  const [emailTab, setEmailTab] = useState<'signin' | 'signup'>('signin');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Phone OTP Flow States
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [step, setStep] = useState<'input' | 'otp' | 'email_sent' | 'success'>('input');
  const [simulatedOtp] = useState('7861');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Email + Password Sign In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!isSupabaseConfigured()) {
        setUser({
          id: `demo-${Date.now()}`,
          name: email.split('@')[0],
          email,
          phone: '',
        });
        setStep('success');
        setTimeout(() => {
          closeAuthModal();
          setStep('input');
        }, 1000);
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser({
          id: data.user.id,
          name:
            data.user.user_metadata?.full_name ||
            data.user.user_metadata?.name ||
            data.user.email?.split('@')[0] ||
            'Valued Customer',
          email: data.user.email,
          phone: data.user.user_metadata?.phone || data.user.phone || '',
        });
      }

      setStep('success');
      setTimeout(() => {
        closeAuthModal();
        setStep('input');
        setPassword('');
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Email + Password Account Creation (Signup)
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await registerWithEmailAction({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneNumber.trim(),
        password,
      });

      if (!res.success) {
        throw new Error(res.error || 'Failed to create account.');
      }

      // Automatically sign in with the created credentials to establish the browser session
      if (isSupabaseConfigured() && res.credentials) {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: res.credentials.email,
          password: res.credentials.password,
        });
      }

      if (res.user) {
        setUser(res.user);
      }

      setStep('success');
      setTimeout(() => {
        closeAuthModal();
        setStep('input');
        setName('');
        setPassword('');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Magic Link Email Fallback
  const handleSendMagicLink = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/account`,
        },
      });

      if (error) throw error;
      setStep('email_sent');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send magic link.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Mobile Phone OTP Send
  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.replace(/\D/g, '').length >= 10) {
      setStep('otp');
    } else {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
    }
  };

  // 5. Mobile Phone OTP Verification -> Provisions Real Supabase Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpCode.join('');

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithPhoneOtpAction({
        phone: phoneNumber,
        name: name.trim() || 'Valued Customer',
        otpCode: enteredCode,
      });

      if (!res.success) {
        throw new Error(res.error || 'Verification code failed.');
      }

      // Establish real Supabase Auth session in the browser
      if (isSupabaseConfigured() && res.credentials) {
        const supabase = createClient();
        await supabase.auth.signInWithPassword({
          email: res.credentials.email,
          password: res.credentials.password,
        });
      }

      if (res.user) {
        setUser(res.user);
      }

      setStep('success');
      setTimeout(() => {
        closeAuthModal();
        setStep('input');
        setPhoneNumber('');
        setOtpCode(['', '', '', '']);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to verify code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Google Social OAuth
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase is not configured yet. Please use email or phone login.');
      return;
    }

    try {
      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/account`,
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Google Sign In.');
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-md bg-[#FAF8F5] rounded-xl shadow-2xl border border-[#D4AF37]/40 p-6 sm:p-8 text-left relative z-10 animate-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#66666E] hover:text-[#1F1F24] hover:bg-white cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 'input' && (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#E61A6B]/10 text-[#E61A6B] text-[11px] font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Miss Stitch Membership</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1F24] mb-1">
                {authMode === 'email'
                  ? emailTab === 'signup'
                    ? 'Create Your Account'
                    : 'Sign In to Miss Stitch'
                  : 'Instant Mobile Login'}
              </h3>
              <p className="text-xs text-[#66666E] mb-5">
                Save your bespoke Sizing Vault, link past orders, and receive real-time workshop tailoring updates.
              </p>

              {/* Main Mode Switcher: Email vs Mobile OTP */}
              <div className="flex rounded-lg bg-[#E5E2DC]/50 p-1 mb-5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    authMode === 'email' ? 'bg-white text-[#1F1F24] shadow-xs' : 'text-[#66666E]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('phone')}
                  className={`flex-1 py-2 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    authMode === 'phone' ? 'bg-white text-[#1F1F24] shadow-xs' : 'text-[#66666E]'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile OTP Code</span>
                </button>
              </div>

              {authMode === 'email' ? (
                <div>
                  {/* Sub-tab: Sign In vs Create Account */}
                  <div className="flex border-b border-[#E5E2DC] mb-4 gap-4 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setEmailTab('signin')}
                      className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                        emailTab === 'signin'
                          ? 'border-[#E61A6B] text-[#E61A6B]'
                          : 'border-transparent text-[#66666E] hover:text-[#1F1F24]'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmailTab('signup')}
                      className={`pb-2 border-b-2 cursor-pointer transition-colors ${
                        emailTab === 'signup'
                          ? 'border-[#E61A6B] text-[#E61A6B]'
                          : 'border-transparent text-[#66666E] hover:text-[#1F1F24]'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  {emailTab === 'signin' ? (
                    <form onSubmit={handleEmailSignIn} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold text-[#1F1F24]">Password</label>
                          <button
                            type="button"
                            onClick={handleSendMagicLink}
                            className="text-[11px] text-[#E61A6B] hover:underline cursor-pointer"
                          >
                            Send Magic Link
                          </button>
                        </div>
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
                        className="btn-rani w-full py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70"
                      >
                        <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleEmailSignUp} className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Fatima Ali"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                          Mobile Number (for Silai updates)
                        </label>
                        <input
                          type="tel"
                          placeholder="0300 1234567"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                          Create Password (min 6 characters)
                        </label>
                        <input
                          type="password"
                          required
                          minLength={6}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-rani w-full py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70"
                      >
                        <span>{isLoading ? 'Creating Account...' : 'Create Miss Stitch Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatima Ali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1F1F24] mb-1">
                      Mobile Phone Number (Pakistan)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-xs font-bold text-[#66666E]">
                        🇵🇰 +92
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="300 1234567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-white border border-[#E5E2DC] rounded p-2.5 pl-18 text-sm text-[#1F1F24] focus:outline-none focus:border-[#D4AF37] font-mono font-medium"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn-rani w-full py-3 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    <span>Send 4-Digit Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Google Social Auth */}
              <div className="mt-6 pt-4 border-t border-[#E5E2DC] text-center">
                <p className="text-[11px] text-[#66666E] mb-3">Or 1-click passwordless login</p>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full py-2.5 bg-white border border-[#E5E2DC] rounded text-xs font-bold text-[#1F1F24] hover:bg-[#FAF8F5] flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            </div>
          )}

          {step === 'email_sent' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#0A5C36]/10 text-[#0A5C36] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1F24] mb-2">
                Check Your Email
              </h3>
              <p className="text-xs text-[#66666E] mb-6">
                We sent a passwordless sign-in link to <strong className="text-[#1F1F24]">{email}</strong>. Click the link in your email to sign in instantly.
              </p>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="btn-gold-outline px-6 py-2 rounded text-xs font-bold uppercase tracking-wider"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0A5C36]/10 text-[#0A5C36] text-[11px] font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verification Code Sent</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1F24] mb-1">
                Enter 4-Digit Code
              </h3>
              <p className="text-xs text-[#66666E] mb-2">
                We sent an SMS verification code to <strong className="text-[#1F1F24]">{phoneNumber}</strong>
              </p>
              <div className="bg-[#FAF5E6] border border-[#D4AF37]/40 p-2 rounded text-[11px] text-[#1F1F24] mb-6">
                Demo Verification Code: <strong className="font-mono text-[#E61A6B]">{simulatedOtp}</strong>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={otpCode[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-bold font-mono bg-white border-2 border-[#E5E2DC] rounded-lg focus:border-[#E61A6B] focus:outline-none"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-rani w-full py-3 rounded text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? 'Verifying & Creating Profile...' : 'Verify & Sign In'}
                </button>

                <div className="flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="text-[#66666E] hover:text-[#1F1F24] underline cursor-pointer"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    onClick={() => setOtpCode(['7', '8', '6', '1'])}
                    className="text-[#E61A6B] font-bold cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#0A5C36]/10 text-[#0A5C36] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1F1F24] mb-1">
                Khush Amdeed!
              </h3>
              <p className="text-xs text-[#66666E]">
                Signed into your Miss Stitch account. Loading your Atelier...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

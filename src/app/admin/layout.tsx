import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import {
  Scissors,
  Package,
  Layers,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Clock,
  Home,
  LogOut,
  Users,
  Sliders,
} from 'lucide-react';

export const metadata = {
  title: 'Miss Stitch Workshop Atelier & Operations Portal',
  description: 'Digital Bespoke Silai management, IBFT receipt verification, and tailor job cards.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce server-side administrator authorization
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        redirect('/admin-login');
      }

      const adminSupabase = createAdminClient() as any;
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      // Auto-bootstrap initial admin if configured in env
      const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
      if (initialAdminEmail && user.email?.toLowerCase() === initialAdminEmail && profile?.role !== 'admin') {
        await adminSupabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      } else if (profile?.role !== 'admin') {
        redirect('/admin-login?error=unauthorized');
      }
    } catch (err: any) {
      // In Next.js redirect() throws a NEXT_REDIRECT error, allow it to pass through
      if (err?.message === 'NEXT_REDIRECT') throw err;
      redirect('/admin-login');
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#1F1F24] text-[#FAF8F5] flex flex-col shrink-0 border-r border-[#33333A]">
        {/* Brand Header */}
        <div className="p-6 border-b border-[#2C2C34]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E61A6B] flex items-center justify-center text-white font-serif font-bold text-sm shadow-md">
              MS
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-white block leading-none">
                Miss Stitch
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] block mt-1">
                Karkhana & Atelier
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1 text-xs font-semibold">
          <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-[#8E8E98]">
            Workshop Operations
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF8F5] hover:bg-[#2C2C34] hover:text-[#D4AF37] transition-colors"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" />
            <span>Atelier Overview</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF8F5] hover:bg-[#2C2C34] hover:text-[#D4AF37] transition-colors"
          >
            <Scissors className="w-4 h-4 text-[#E61A6B]" />
            <span>Silai Pipeline & Orders</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF8F5] hover:bg-[#2C2C34] hover:text-[#D4AF37] transition-colors"
          >
            <Layers className="w-4 h-4 text-[#0A5C36]" />
            <span>Fabrics & Inventory</span>
          </Link>

          <Link
            href="/admin/team"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF8F5] hover:bg-[#2C2C34] hover:text-[#D4AF37] transition-colors"
          >
            <Users className="w-4 h-4 text-[#D4AF37]" />
            <span>Workshop Team & Roles</span>
          </Link>

          <Link
            href="/admin/content"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#FAF8F5] hover:bg-[#2C2C34] hover:text-[#D4AF37] transition-colors"
          >
            <Sliders className="w-4 h-4 text-[#F3A712]" />
            <span>Visual CMS & Banners</span>
          </Link>

          <div className="pt-6 px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-[#8E8E98]">
            Storefront
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[#FAF8F5]/80 hover:bg-[#2C2C34] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span>Customer Website</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#8E8E98]" />
          </Link>
        </nav>

        {/* Atelier Badge */}
        <div className="p-4 border-t border-[#2C2C34] text-[11px] text-[#8E8E98] space-y-1">
          <div className="flex items-center gap-1.5 text-[#0A5C36] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#0A5C36] animate-ping" />
            <span>Master Atelier Active</span>
          </div>
          <p className="text-[10px]">Lahore Stitching Unit #1</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top Operational Header */}
        <header className="h-16 bg-white border-b border-[#E5E2DC] px-6 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3 text-xs text-[#66666E]">
            <span className="font-semibold text-[#1F1F24]">Master Tailor Portal</span>
            <span>•</span>
            <span className="bg-[#FAF5E6] text-[#8F741C] border border-[#D4AF37]/40 px-2 py-0.5 rounded font-mono text-[11px]">
              Zero-Cost Architecture Mode
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#0A5C36] bg-[#0A5C36]/10 px-3 py-1 rounded">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Verified</span>
            </div>
          </div>
        </header>

        {/* Page Children */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AnnouncementTicker } from "@/components/layout/AnnouncementTicker";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthListener } from "@/components/auth/AuthListener";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { SizeChartModal } from "@/components/product/SizeChartModal";
import { SearchModal } from "@/components/search/SearchModal";
import { getSiteContentAction } from "@/app/actions/cmsActions";
import { DEFAULT_ANNOUNCEMENT_BAR } from "@/data/cmsDefaults";
import { AnnouncementBarSettings } from "@/types";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Miss Stitch — Pakistani Luxury Pret & Bespoke Digital Silai",
  description:
    "Shop luxury unstitched festive lawn, velvet formals, and ready-to-wear designer suits with custom made-to-measure tailoring and fast delivery across Pakistan and worldwide.",
  keywords: [
    "Pakistani designer suits",
    "Miss Stitch",
    "lawn 2026",
    "custom stitching online Pakistan",
    "bespoke silai",
    "velvet formals",
    "ready to wear pret",
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcementSettings = await getSiteContentAction<AnnouncementBarSettings>(
    'announcement_bar',
    DEFAULT_ANNOUNCEMENT_BAR
  );

  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F1F24]">
        {/* Global Announcement Marquee & Currency Switcher */}
        <AnnouncementTicker initialSettings={announcementSettings} />

        {/* Global Sticky Luxury Header */}
        <Header />

        {/* Main Page Content */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <Footer />

        {/* Floating VIP WhatsApp Concierge */}
        <WhatsAppFloat />

        {/* Global Modals & Drawers */}
        <AuthListener />
        <CartDrawer />
        <AuthModal />
        <QuickViewModal />
        <SizeChartModal />
        <SearchModal />
      </body>
    </html>
  );
}

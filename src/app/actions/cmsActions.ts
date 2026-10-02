'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { DEFAULT_HERO_SLIDES, DEFAULT_ANNOUNCEMENT_BAR, DEFAULT_CATEGORY_CARDS } from '@/data/cmsDefaults';

/**
 * Server guard: requires active admin session
 */
async function verifyAdminSession(): Promise<{ authorized: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { authorized: true };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { authorized: false, error: 'Authentication required. Please log in as an administrator.' };
    }

    const adminSupabase = createAdminClient() as any;
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    // Check bootstrap
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    if (initialAdminEmail && user.email?.toLowerCase() === initialAdminEmail && profile?.role !== 'admin') {
      await adminSupabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      return { authorized: true };
    }

    if (profile?.role !== 'admin') {
      return { authorized: false, error: 'Unauthorized: Workshop admin privileges required.' };
    }

    return { authorized: true };
  } catch (err) {
    console.error('Admin session verification error in cmsActions:', err);
    return { authorized: false, error: 'Failed to verify administrative credentials.' };
  }
}

/**
 * Fetch a CMS section by key from public.site_content with fallback
 */
export async function getSiteContentAction<T>(key: string, fallbackData: T): Promise<T> {
  if (!isSupabaseConfigured()) {
    return fallbackData;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await (supabase as any)
      .from('site_content')
      .select('data')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn(`getSiteContentAction for "${key}" returned error:`, error.message);
      return fallbackData;
    }

    if (!data || data.data === null || data.data === undefined) {
      return fallbackData;
    }

    return data.data as T;
  } catch (err) {
    console.warn(`getSiteContentAction failed for key "${key}", using fallback:`, err);
    return fallbackData;
  }
}

/**
 * Update a CMS section by key (Admin only)
 */
export async function updateSiteContentAction(
  key: string,
  data: any
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized.' };
  }

  if (!key || data === undefined) {
    return { success: false, error: 'Content key and payload are required.' };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      error: 'Supabase is not configured. Changes will persist only in mock session.',
    };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    const { error } = await adminSupabase.from('site_content').upsert(
      {
        key,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      throw error;
    }

    // Revalidate customer storefront and admin portal
    revalidatePath('/', 'layout');
    revalidatePath('/admin/content');

    return { success: true };
  } catch (err: any) {
    console.error(`updateSiteContentAction error for key "${key}":`, err);
    return {
      success: false,
      error: err.message || 'Failed to update site content in Supabase.',
    };
  }
}

/**
 * Reset a CMS section to default data (Admin only)
 */
export async function resetSiteContentAction(
  key: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized.' };
  }

  let defaultData: any = null;
  if (key === 'hero_slides') defaultData = DEFAULT_HERO_SLIDES;
  else if (key === 'announcement_bar') defaultData = DEFAULT_ANNOUNCEMENT_BAR;
  else if (key === 'category_cards') defaultData = DEFAULT_CATEGORY_CARDS;
  else {
    return { success: false, error: 'Unknown content section key.' };
  }

  return await updateSiteContentAction(key, defaultData);
}

/**
 * Upload banner image or category icon to Supabase Storage (product-media or designs bucket)
 */
export async function uploadCmsImageAction(
  base64DataUrl: string,
  fileName: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized.' };
  }

  if (!base64DataUrl || !base64DataUrl.startsWith('data:image/')) {
    return { success: false, error: 'Invalid image format provided.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, url: base64DataUrl };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    const mimeMatch = base64DataUrl.match(/^data:(image\/[a-zA-Z0-9+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const ext = mimeType.split('/')[1] || 'jpg';

    const base64Clean = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return { success: false, error: 'Banner image file size exceeds the 5 MB limit.' };
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const filePath = `cms/${Date.now()}_${cleanName}.${ext}`;

    // Try 'product-media' bucket first, fallback to 'designs'
    let bucketName = 'product-media';
    let uploadRes = await adminSupabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadRes.error) {
      bucketName = 'designs';
      uploadRes = await adminSupabase.storage
        .from(bucketName)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: true,
        });
    }

    if (uploadRes.error) {
      throw uploadRes.error;
    }

    const { data: publicUrlData } = adminSupabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrlData.publicUrl,
    };
  } catch (err: any) {
    console.error('uploadCmsImageAction error:', err);
    return {
      success: false,
      error: err.message || 'Failed to upload banner image to Supabase Storage.',
    };
  }
}

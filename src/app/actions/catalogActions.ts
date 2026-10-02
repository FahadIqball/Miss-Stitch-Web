'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';

export interface CreateProductInput {
  title: string;
  collection: string;
  category: 'festive' | 'unstitched' | 'ready-to-wear' | 'velvet' | 'co-ords';
  pieceCount: '1-Piece' | '2-Piece' | '3-Piece';
  fabric: 'Lawn' | 'Chiffon' | 'Raw Silk' | 'Organza' | 'Velvet' | 'Cotton' | 'Jacquard';
  fabricDescription: string;
  colorName: string;
  colorHex: string;
  basePricePKR: number;
  standardStitchingFeePKR: number;
  customStitchingFeePKR: number;
  images: {
    primary: string;
    secondary?: string;
    gallery?: string[];
    embroideryCloseUp?: string;
  };
  tags?: string[];
  occasion?: 'Daily Wear' | 'Semi-Formal' | 'Wedding / Festive' | 'Eid Edit';
  boxContents: {
    shirt: string;
    dupatta: string;
    trouser: string;
    embroideryPatches: string[];
  };
  isNew?: boolean;
  isBestSeller?: boolean;
}

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
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return { authorized: false, error: 'Unauthorized: Admin privileges required.' };
    }

    return { authorized: true };
  } catch (err) {
    console.error('Admin session verification error in catalogActions:', err);
    return { authorized: false, error: 'Failed to verify administrative credentials.' };
  }
}

/**
 * Upload product photo (base64) directly to Supabase Storage public CDN
 */
export async function uploadProductImageAction(
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
    // Simulated demo mode: return the data URL directly
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
      return { success: false, error: 'Image file size exceeds the 5 MB limit.' };
    }

    const cleanName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const filePath = `suits/${Date.now()}_${cleanName}.${ext}`;

    // Try 'product-media' bucket first, fallback to 'designs'
    let bucketName = 'product-media';
    let uploadRes = await adminSupabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadRes.error) {
      // Fallback to 'designs' bucket
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
    console.error('uploadProductImageAction error:', err);
    return { success: false, error: err.message || 'Failed to upload product photo.' };
  }
}

/**
 * Insert a brand new luxury suit into Supabase PostgreSQL catalog
 */
export async function createProductAction(
  input: CreateProductInput
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  if (!input.title || !input.basePricePKR || !input.fabric) {
    return { success: false, error: 'Suit title, fabric, and base price are required.' };
  }

  if (!input.images?.primary) {
    return { success: false, error: 'At least one primary suit image is required.' };
  }

  // Generate clean slug
  let slug = input.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!slug) slug = `suit-${Date.now()}`;

  // Generate SKU
  const catPrefix = input.category.slice(0, 2).toUpperCase();
  const sku = `MS-${catPrefix}26-${Math.floor(100 + Math.random() * 900)}`;

  if (!isSupabaseConfigured()) {
    const fallbackProduct: Product = {
      id: `prod-${Date.now()}`,
      slug,
      title: input.title,
      collection: input.collection || "Festive Luxury '26",
      sku,
      category: input.category,
      pieceCount: input.pieceCount,
      fabric: input.fabric,
      fabricDescription: input.fabricDescription,
      colorName: input.colorName || 'Royal Classic',
      colorHex: input.colorHex || '#E61A6B',
      basePricePKR: input.basePricePKR,
      standardStitchingFeePKR: input.standardStitchingFeePKR || 3500,
      customStitchingFeePKR: input.customStitchingFeePKR || 4500,
      images: {
        primary: input.images.primary,
        secondary: input.images.secondary || '',
        gallery: input.images.gallery || [],
        embroideryCloseUp: input.images.embroideryCloseUp,
      },
      tags: input.tags || ['New Drop', 'Selling Fast'],
      occasion: input.occasion || 'Wedding / Festive',
      boxContents: input.boxContents,
      rating: 5.0,
      reviewCount: 1,
      isNew: input.isNew ?? true,
      isBestSeller: input.isBestSeller ?? false,
      inStock: true,
    };

    return { success: true, product: fallbackProduct };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    // Check slug collision
    const { data: existing } = await adminSupabase
      .from('products')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const payload = {
      slug,
      title: input.title,
      collection: input.collection || "Festive Luxury '26",
      sku,
      category: input.category,
      piece_count: input.pieceCount,
      fabric: input.fabric,
      fabric_description: input.fabricDescription || '',
      color_name: input.colorName || 'Classic Tone',
      color_hex: input.colorHex || '#E61A6B',
      base_price_pkr: input.basePricePKR,
      standard_stitching_fee_pkr: input.standardStitchingFeePKR || 3500,
      custom_stitching_fee_pkr: input.customStitchingFeePKR || 4500,
      images: {
        primary: input.images.primary,
        secondary: input.images.secondary || '',
        gallery: input.images.gallery || [],
        embroideryCloseUp: input.images.embroideryCloseUp || '',
      },
      tags: input.tags || ['New Drop', 'Hand Embroidered'],
      occasion: input.occasion || 'Wedding / Festive',
      box_contents: input.boxContents,
      rating: 5.0,
      review_count: 0,
      is_new: input.isNew ?? true,
      is_best_seller: input.isBestSeller ?? false,
      in_stock: true,
    };

    const { data: inserted, error: insertError } = await adminSupabase
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (insertError) throw insertError;

    const createdProduct: Product = {
      id: inserted.id,
      slug: inserted.slug,
      title: inserted.title,
      collection: inserted.collection,
      sku: inserted.sku,
      category: inserted.category,
      pieceCount: inserted.piece_count,
      fabric: inserted.fabric,
      fabricDescription: inserted.fabric_description,
      colorName: inserted.color_name,
      colorHex: inserted.color_hex,
      basePricePKR: inserted.base_price_pkr,
      standardStitchingFeePKR: inserted.standard_stitching_fee_pkr,
      customStitchingFeePKR: inserted.custom_stitching_fee_pkr,
      images: inserted.images,
      tags: inserted.tags || [],
      occasion: inserted.occasion,
      boxContents: inserted.box_contents,
      rating: Number(inserted.rating),
      reviewCount: inserted.review_count,
      isNew: inserted.is_new,
      isBestSeller: inserted.is_best_seller,
      inStock: inserted.in_stock,
    };

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin/products');

    return { success: true, product: createdProduct };
  } catch (err: any) {
    console.error('createProductAction error:', err);
    return { success: false, error: err.message || 'Failed to save product in database.' };
  }
}

/**
 * Update an existing suit's pricing, details, or box contents
 */
export async function updateProductAction(
  productId: string,
  input: Partial<CreateProductInput>
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    const payload: any = {};
    if (input.title) payload.title = input.title;
    if (input.collection) payload.collection = input.collection;
    if (input.category) payload.category = input.category;
    if (input.pieceCount) payload.piece_count = input.pieceCount;
    if (input.fabric) payload.fabric = input.fabric;
    if (input.fabricDescription !== undefined) payload.fabric_description = input.fabricDescription;
    if (input.colorName) payload.color_name = input.colorName;
    if (input.colorHex) payload.color_hex = input.colorHex;
    if (input.basePricePKR !== undefined) payload.base_price_pkr = input.basePricePKR;
    if (input.standardStitchingFeePKR !== undefined) payload.standard_stitching_fee_pkr = input.standardStitchingFeePKR;
    if (input.customStitchingFeePKR !== undefined) payload.custom_stitching_fee_pkr = input.customStitchingFeePKR;
    if (input.images) payload.images = input.images;
    if (input.tags) payload.tags = input.tags;
    if (input.occasion) payload.occasion = input.occasion;
    if (input.boxContents) payload.box_contents = input.boxContents;
    if (input.isNew !== undefined) payload.is_new = input.isNew;
    if (input.isBestSeller !== undefined) payload.is_best_seller = input.isBestSeller;

    const { error } = await adminSupabase
      .from('products')
      .update(payload)
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin/products');
    revalidatePath('/product/[slug]', 'page');

    return { success: true };
  } catch (err: any) {
    console.error('updateProductAction error:', err);
    return { success: false, error: err.message || 'Failed to update product.' };
  }
}

/**
 * Delete / remove a suit from the catalog
 */
export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const { error } = await adminSupabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;

    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (err: any) {
    console.error('deleteProductAction error:', err);
    return { success: false, error: err.message || 'Failed to delete product.' };
  }
}

/**
 * Internal mapper from Supabase row to frontend Product type
 */
function mapDbRowToProduct(row: any): Product {
  const images = typeof row.images === 'string'
    ? JSON.parse(row.images)
    : (row.images || { primary: '' });

  const boxContents = typeof row.box_contents === 'string'
    ? JSON.parse(row.box_contents)
    : (row.box_contents || { shirt: '', dupatta: '', trouser: '', embroideryPatches: [] });

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    collection: row.collection || "Festive Luxury '26",
    sku: row.sku || `MS-${row.slug?.slice(0, 4)?.toUpperCase() || 'SUIT'}`,
    category: row.category || 'unstitched',
    pieceCount: row.piece_count || '3-Piece',
    fabric: row.fabric || 'Lawn',
    fabricDescription: row.fabric_description || '',
    colorName: row.color_name || 'Classic Tone',
    colorHex: row.color_hex || '#E61A6B',
    basePricePKR: Number(row.base_price_pkr || 0),
    standardStitchingFeePKR: Number(row.standard_stitching_fee_pkr || 3500),
    customStitchingFeePKR: Number(row.custom_stitching_fee_pkr || 4500),
    images,
    tags: Array.isArray(row.tags) ? row.tags : [],
    occasion: row.occasion || 'Wedding / Festive',
    boxContents,
    rating: Number(row.rating || 5.0),
    reviewCount: Number(row.review_count || 1),
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    inStock: row.in_stock !== false,
  };
}

/**
 * Fetch all suits from database-first catalog with graceful fallback to PRODUCTS
 */
export async function getLiveCatalogAction(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return PRODUCTS;
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return PRODUCTS;
    }

    const dbProducts = data.map(mapDbRowToProduct);
    const dbSlugs = new Set(dbProducts.map((p) => p.slug));

    // Combine newly created DB products with static products that aren't overwritten
    const nonDuplicatedStatic = PRODUCTS.filter((p) => !dbSlugs.has(p.slug));
    return [...dbProducts, ...nonDuplicatedStatic];
  } catch (err) {
    console.warn('getLiveCatalogAction failed, using static fallback:', err);
    return PRODUCTS;
  }
}

/**
 * Fetch a single suit by slug with fallback
 */
export async function getLiveProductBySlugAction(slug: string): Promise<Product | null> {
  if (!slug) return null;

  if (isSupabaseConfigured()) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!error && data) {
        return mapDbRowToProduct(data);
      }
    } catch (err) {
      console.warn(`getLiveProductBySlugAction failed for slug "${slug}":`, err);
    }
  }

  // Fallback to static catalog
  const staticFound = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  return staticFound || null;
}

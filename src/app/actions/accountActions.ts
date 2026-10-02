'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { CustomMeasurements, Order, SizingProfile } from '@/types';

export interface SaveProfileInput {
  id?: string;
  name: string;
  measurements: CustomMeasurements;
  trouserStyle?: string;
  isDefault?: boolean;
}

/**
 * Fetch saved sizing profiles for authenticated user from Supabase sizing_profiles table
 */
export async function getSizingProfilesAction(): Promise<SizingProfile[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = (await createServerSupabaseClient()) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: profiles, error } = await supabase
      .from('sizing_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !profiles) return [];

    return profiles.map((p: any) => ({
      id: p.id,
      name: p.name,
      measurements: p.measurements as CustomMeasurements,
      isDefault: p.is_default,
      createdAt: p.created_at.split('T')[0],
    }));
  } catch (err) {
    console.error('getSizingProfilesAction error:', err);
    return [];
  }
}

/**
 * Save or update a bespoke sizing profile in Supabase
 */
export async function saveSizingProfileAction(
  input: SaveProfileInput
): Promise<{ success: boolean; profile?: SizingProfile; error?: string }> {
  if (!isSupabaseConfigured()) {
    const fallbackProfile: SizingProfile = {
      id: input.id || `prof-${Date.now()}`,
      name: input.name,
      measurements: input.measurements,
      isDefault: input.isDefault || false,
      createdAt: new Date().toISOString().split('T')[0],
    };
    return { success: true, profile: fallbackProfile };
  }

  try {
    const supabase = (await createServerSupabaseClient()) as any;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User must be signed in to save sizing profiles.' };
    }

    if (input.isDefault) {
      // Clear other defaults
      await supabase
        .from('sizing_profiles')
        .update({ is_default: false })
        .eq('user_id', user.id);
    }

    const payload: any = {
      user_id: user.id,
      name: input.name,
      measurements: input.measurements,
      trouser_style: input.measurements.trouserStyle || input.trouserStyle || 'Straight Trouser',
      is_default: input.isDefault || false,
      updated_at: new Date().toISOString(),
    };

    let resultData;
    if (input.id && !input.id.startsWith('prof-demo')) {
      const { data, error } = await supabase
        .from('sizing_profiles')
        .update(payload)
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    } else {
      const { data, error } = await supabase
        .from('sizing_profiles')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      resultData = data;
    }

    return {
      success: true,
      profile: {
        id: resultData.id,
        name: resultData.name,
        measurements: resultData.measurements as CustomMeasurements,
        isDefault: resultData.is_default,
        createdAt: resultData.created_at.split('T')[0],
      },
    };
  } catch (err: any) {
    console.error('saveSizingProfileAction error:', err);
    return { success: false, error: err.message || 'Failed to save sizing profile.' };
  }
}

/**
 * Delete a sizing profile from Supabase
 */
export async function deleteSizingProfileAction(
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const supabase = (await createServerSupabaseClient()) as any;
    const { error } = await supabase
      .from('sizing_profiles')
      .delete()
      .eq('id', profileId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch orders for authenticated customer or matching guest phone/email
 */
export async function getUserOrdersAction(userPhone?: string, userEmail?: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = (await createServerSupabaseClient()) as any;
    const adminSupabase = createAdminClient() as any;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Strictly require authenticated Supabase user session
    if (!user?.id) {
      return [];
    }

    const effectivePhone = user.phone || userPhone;
    const effectiveEmail = user.email || userEmail;

    // Auto-link any past unassigned guest orders matching customer's verified phone or email
    if (effectivePhone || effectiveEmail) {
      const cleanPhone = effectivePhone ? effectivePhone.replace(/\D/g, '').slice(-10) : null;
      let updateQuery = adminSupabase
        .from('orders')
        .update({ user_id: user.id })
        .is('user_id', null);

      if (cleanPhone && effectiveEmail) {
        updateQuery = updateQuery.or(`guest_phone.ilike.%${cleanPhone}%,guest_email.eq.${effectiveEmail}`);
      } else if (cleanPhone) {
        updateQuery = updateQuery.ilike('guest_phone', `%${cleanPhone}%`);
      } else if (effectiveEmail) {
        updateQuery = updateQuery.eq('guest_email', effectiveEmail);
      }

      await updateQuery;
    }

    // Strictly query only orders owned by this user
    const { data: orders, error } = await adminSupabase
      .from('orders')
      .select('*, order_items(*, tailoring_specs(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error || !orders) return [];
    return mapDbOrders(orders);
  } catch (err) {
    console.error('getUserOrdersAction error:', err);
    return [];
  }
}

function mapDbOrders(orders: any[]): Order[] {
  return orders.map((o: any) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at.split('T')[0],
    items: (o.order_items || []).map((oi: any) => ({
      id: oi.id,
      productId: oi.product_id,
      title: oi.product_title,
      collection: 'Luxury Edition',
      thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
      basePricePKR: oi.unit_price_pkr,
      stitchingMode: oi.stitching_type as any,
      standardSize: oi.size as any,
      addons: {
        attachedLining: oi.tailoring_specs?.[0]?.has_shameez || false,
        edgeFinishingTassels: oi.tailoring_specs?.[0]?.has_latkan || false,
        sleevesLining: false,
      },
      stitchingFeePKR: oi.add_ons_price_pkr,
      addonsFeePKR: 0,
      unitTotalPKR: oi.unit_price_pkr + oi.add_ons_price_pkr,
      quantity: oi.quantity,
    })),
    shippingAddress: {
      id: o.id,
      fullName: o.shipping_address?.fullName || '',
      phone: o.shipping_address?.phone || '',
      email: o.guest_email || '',
      address: o.shipping_address?.address || '',
      province: o.shipping_address?.province || 'Punjab',
      city: o.shipping_address?.city || 'Lahore',
      postalCode: o.shipping_address?.postalCode || '',
    },
    paymentMethod: o.payment_method as any,
    paymentStatus: o.payment_status as any,
    subtotalPKR: o.subtotal_pkr,
    stitchingTotalPKR: 0,
    addonsTotalPKR: 0,
    shippingFeePKR: o.shipping_fee_pkr,
    discountPKR: o.discount_amount_pkr,
    totalPKR: o.total_amount_pkr,
    status: (o.silai_status === 'fabric_cut'
      ? 'fabric_cut'
      : o.silai_status === 'tailor_stitching'
      ? 'master_tailor'
      : o.silai_status === 'quality_check'
      ? 'quality_check'
      : o.silai_status === 'dispatched'
      ? 'dispatched'
      : o.silai_status === 'delivered'
      ? 'delivered'
      : 'confirmed') as any,
    courierPartner: (o.courier_name || 'TCS Express') as any,
    trackingNumber: o.tracking_number || undefined,
  }));
}

/**
 * Track order by Order Number, Phone, or Courier Tracking Number
 */
export async function trackOrderAction(query: string): Promise<Order | null> {
  if (!query) return null;
  const clean = query.trim().toUpperCase();

  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const adminSupabase = createAdminClient() as any;

    let { data: order } = await adminSupabase
      .from('orders')
      .select('*, order_items(*, tailoring_specs(*))')
      .eq('order_number', clean)
      .maybeSingle();

    if (!order) {
      // Try tracking number
      const { data: byTrack } = await adminSupabase
        .from('orders')
        .select('*, order_items(*, tailoring_specs(*))')
        .eq('tracking_number', clean)
        .maybeSingle();
      order = byTrack;
    }

    if (!order) return null;

    return {
      id: order.id,
      orderNumber: order.order_number,
      createdAt: order.created_at.split('T')[0],
      items: (order.order_items || []).map((oi: any) => ({
        id: oi.id,
        productId: oi.product_id,
        title: oi.product_title,
        collection: 'Luxury Edition',
        thumbnail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=80',
        basePricePKR: oi.unit_price_pkr,
        stitchingMode: oi.stitching_type as any,
        standardSize: oi.size as any,
        addons: {
          attachedLining: oi.tailoring_specs?.[0]?.has_shameez || false,
          edgeFinishingTassels: oi.tailoring_specs?.[0]?.has_latkan || false,
          sleevesLining: false,
        },
        stitchingFeePKR: oi.add_ons_price_pkr,
        addonsFeePKR: 0,
        unitTotalPKR: oi.unit_price_pkr + oi.add_ons_price_pkr,
        quantity: oi.quantity,
      })),
      shippingAddress: {
        id: order.id,
        fullName: order.shipping_address?.fullName || '',
        phone: order.shipping_address?.phone || '',
        email: order.guest_email || '',
        address: order.shipping_address?.address || '',
        province: order.shipping_address?.province || 'Punjab',
        city: order.shipping_address?.city || 'Lahore',
        postalCode: order.shipping_address?.postalCode || '',
      },
      paymentMethod: order.payment_method as any,
      paymentStatus: order.payment_status as any,
      subtotalPKR: order.subtotal_pkr,
      stitchingTotalPKR: 0,
      addonsTotalPKR: 0,
      shippingFeePKR: order.shipping_fee_pkr,
      discountPKR: order.discount_amount_pkr,
      totalPKR: order.total_amount_pkr,
      status: (order.silai_status === 'fabric_cut'
        ? 'fabric_cut'
        : order.silai_status === 'tailor_stitching'
        ? 'master_tailor'
        : order.silai_status === 'quality_check'
        ? 'quality_check'
        : order.silai_status === 'dispatched'
        ? 'dispatched'
        : order.silai_status === 'delivered'
        ? 'delivered'
        : 'confirmed') as any,
      courierPartner: (order.courier_name || 'TCS Express') as any,
      trackingNumber: order.tracking_number || undefined,
    };
  } catch (err) {
    console.error('trackOrderAction error:', err);
    return null;
  }
}

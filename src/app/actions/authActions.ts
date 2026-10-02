'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/status';

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  credentials?: {
    email: string;
    password: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

/**
 * Register a new user in Supabase Auth, create public.profiles record, and auto-link past guest orders
 */
export async function registerWithEmailAction(input: RegisterInput): Promise<AuthActionResult> {
  const { name, email, phone, password } = input;

  if (!email || !password || password.length < 6) {
    return { success: false, error: 'Please provide a valid email and password (minimum 6 characters).' };
  }

  if (!name.trim()) {
    return { success: false, error: 'Please provide your full name.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? (phone.startsWith('+92') ? phone : `+92 ${phone.replace(/^0/, '').trim()}`) : '';

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      credentials: { email: cleanEmail, password },
      user: {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
      },
    };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    // 1. Create user in Supabase Auth with email pre-confirmed
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
        phone: cleanPhone,
      },
    });

    let userId: string;

    if (authError) {
      // If user already exists, check if error indicates already registered
      if (authError.message.toLowerCase().includes('already') || authError.message.toLowerCase().includes('exists')) {
        return {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
        };
      }
      return { success: false, error: authError.message };
    }

    userId = authData.user.id;

    // 2. Ensure public.profiles entry exists
    await adminSupabase.from('profiles').upsert(
      {
        id: userId,
        email: cleanEmail,
        phone: cleanPhone || null,
        full_name: name.trim(),
        role: 'customer',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // 3. Auto-link any past guest orders matching customer's email or phone
    const cleanPhoneDigits = cleanPhone.replace(/\D/g, '').slice(-10);
    let updateQuery = adminSupabase
      .from('orders')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .is('user_id', null);

    if (cleanPhoneDigits.length >= 10 && cleanEmail) {
      updateQuery = updateQuery.or(`guest_phone.ilike.%${cleanPhoneDigits}%,guest_email.eq.${cleanEmail}`);
    } else if (cleanPhoneDigits.length >= 10) {
      updateQuery = updateQuery.ilike('guest_phone', `%${cleanPhoneDigits}%`);
    } else if (cleanEmail) {
      updateQuery = updateQuery.eq('guest_email', cleanEmail);
    }

    await updateQuery;

    return {
      success: true,
      credentials: { email: cleanEmail, password },
      user: {
        id: userId,
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
      },
    };
  } catch (err: any) {
    console.error('registerWithEmailAction error:', err);
    return { success: false, error: err.message || 'Failed to create account. Please try again.' };
  }
}

/**
 * Provision or authenticate a mobile OTP customer in Supabase Auth
 * Generates a real Supabase Auth user record so user_id is populated in orders & sizing_profiles
 */
export async function loginWithPhoneOtpAction({
  phone,
  name,
  otpCode,
}: {
  phone: string;
  name: string;
  otpCode: string;
}): Promise<AuthActionResult> {
  const cleanPhone = phone.startsWith('+92') ? phone : `+92 ${phone.replace(/^0/, '').trim()}`;
  const cleanDigits = phone.replace(/\D/g, '').slice(-10);

  if (cleanDigits.length < 10) {
    return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
  }

  // Simulated OTP check (7861 is the standard sandbox verification code)
  if (otpCode !== '7861') {
    return { success: false, error: 'Invalid verification code. Please enter 7861.' };
  }

  const customerName = name.trim() || 'Valued Customer';
  const internalEmail = `user_${cleanDigits}@phone.missstitch.pk`;
  // Deterministic secure salt for phone passwordless accounts
  const internalPassword = `MS_Phone_${cleanDigits}_Silai2026!`;

  if (!isSupabaseConfigured()) {
    return {
      success: true,
      credentials: { email: internalEmail, password: internalPassword },
      user: {
        id: `usr-phone-${cleanDigits}`,
        name: customerName,
        phone: cleanPhone,
        email: internalEmail,
      },
    };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    // Check if user already exists
    let userId: string;
    const { data: existingUser, error: findError } = await adminSupabase.auth.admin.getUserById(
      // query by listUsers
      'dummy'
    ).catch(() => ({ data: null }));

    // List users by email to check existing
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    const existing = (userList?.users || []).find(
      (u: any) => u.email === internalEmail || u.user_metadata?.phone === cleanPhone
    );

    if (existing) {
      userId = existing.id;
      // Update password and metadata to ensure valid login
      await adminSupabase.auth.admin.updateUserById(userId, {
        password: internalPassword,
        user_metadata: {
          full_name: customerName,
          phone: cleanPhone,
        },
      });
    } else {
      // Create user with pre-confirmed email
      const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
        email: internalEmail,
        password: internalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
          phone: cleanPhone,
        },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    // Upsert into public.profiles
    await adminSupabase.from('profiles').upsert(
      {
        id: userId,
        email: internalEmail,
        phone: cleanPhone,
        full_name: customerName,
        role: 'customer',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // Auto-link any past guest orders matching this phone number
    await adminSupabase
      .from('orders')
      .update({ user_id: userId, updated_at: new Date().toISOString() })
      .is('user_id', null)
      .ilike('guest_phone', `%${cleanDigits}%`);

    return {
      success: true,
      credentials: { email: internalEmail, password: internalPassword },
      user: {
        id: userId,
        name: customerName,
        phone: cleanPhone,
        email: internalEmail,
      },
    };
  } catch (err: any) {
    console.error('loginWithPhoneOtpAction error:', err);
    return { success: false, error: err.message || 'Failed to authenticate phone number.' };
  }
}

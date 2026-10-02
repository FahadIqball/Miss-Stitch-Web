'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/supabase/status';
import { TeamMember, UserRole } from '@/types';

/**
 * Server-side guard: verify caller's active session has role === 'admin'
 */
async function verifyAdminSession(): Promise<{
  authorized: boolean;
  currentUserId?: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { authorized: true, currentUserId: 'demo-admin-id' };
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

    // Check environment variable bootstrap for initial super-admin
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    if (initialAdminEmail && user.email?.toLowerCase() === initialAdminEmail && profile?.role !== 'admin') {
      await adminSupabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      return { authorized: true, currentUserId: user.id };
    }

    if (profile?.role !== 'admin') {
      return { authorized: false, error: 'Unauthorized: Admin privileges required.' };
    }

    return { authorized: true, currentUserId: user.id };
  } catch (err) {
    console.error('Admin session verification error in teamActions:', err);
    return { authorized: false, error: 'Failed to verify administrative credentials.' };
  }
}

/**
 * Fetch all registered users and workshop staff with roles
 */
export async function getTeamMembersAction(
  searchQuery?: string,
  roleFilter?: string
): Promise<TeamMember[]> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return [];
  }

  if (!isSupabaseConfigured()) {
    // Fallback simulated team for demo mode
    return [
      {
        id: 'demo-admin-id',
        email: 'admin@miss-stitch.pk',
        fullName: 'Master Atelier Admin',
        phone: '+92 300 1234567',
        role: 'admin',
        createdAt: '2026-01-15',
        isCurrentUser: true,
      },
      {
        id: 'demo-tailor-id',
        email: 'tailor1@miss-stitch.pk',
        fullName: 'Ustad Tariq (Master Cutter)',
        phone: '+92 321 9876543',
        role: 'tailor',
        createdAt: '2026-02-01',
        isCurrentUser: false,
      },
      {
        id: 'demo-customer-id',
        email: 'ayesha.khan@example.pk',
        fullName: 'Ayesha Khan',
        phone: '+92 333 4567890',
        role: 'customer',
        createdAt: '2026-03-10',
        isCurrentUser: false,
      },
    ];
  }

  try {
    const adminSupabase = createAdminClient() as any;
    let query = adminSupabase
      .from('profiles')
      .select('id, email, full_name, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (roleFilter && roleFilter !== 'all') {
      query = query.eq('role', roleFilter);
    }

    const { data: profiles, error } = await query;

    if (error || !profiles) {
      console.error('Error fetching team profiles:', error);
      return [];
    }

    let members: TeamMember[] = profiles.map((p: any) => ({
      id: p.id,
      email: p.email || 'No email registered',
      fullName: p.full_name || 'Workshop Member',
      phone: p.phone || '',
      role: (p.role as UserRole) || 'customer',
      createdAt: p.created_at ? p.created_at.split('T')[0] : '2026-01-01',
      isCurrentUser: p.id === auth.currentUserId,
    }));

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      members = members.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phone && m.phone.includes(q))
      );
    }

    return members;
  } catch (err) {
    console.error('getTeamMembersAction error:', err);
    return [];
  }
}

/**
 * Promote, assign, or modify a user's role in the workshop
 */
export async function updateUserRoleAction(
  targetUserId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized: Admin privileges required.' };
  }

  // Safety safeguard: An administrator cannot remove their own admin role
  if (targetUserId === auth.currentUserId && newRole !== 'admin') {
    return {
      success: false,
      error: 'Self-demotion prevented: You cannot remove your own administrator role. Please have another admin adjust your privileges.',
    };
  }

  if (!isSupabaseConfigured()) {
    return { success: true };
  }

  try {
    const adminSupabase = createAdminClient() as any;
    const { error } = await adminSupabase
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error('updateUserRoleAction error:', err);
    return { success: false, error: err.message || 'Failed to update user role.' };
  }
}

/**
 * Assign or elevate a user by email address
 */
export async function assignStaffByEmailAction(
  email: string,
  role: UserRole
): Promise<{ success: boolean; message?: string; error?: string }> {
  const auth = await verifyAdminSession();
  if (!auth.authorized) {
    return { success: false, error: auth.error || 'Unauthorized.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (!isSupabaseConfigured()) {
    return { success: true, message: `Role ${role} assigned to ${cleanEmail} (Simulated mode).` };
  }

  try {
    const adminSupabase = createAdminClient() as any;

    // Check if profile exists
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, email, full_name')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (profile) {
      const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      return {
        success: true,
        message: `Successfully updated ${profile.full_name || cleanEmail} to ${role === 'admin' ? 'Administrator' : 'Master Tailor'}.`,
      };
    }

    // If profile not found, check Supabase auth.users
    const { data: userList } = await adminSupabase.auth.admin.listUsers();
    const authUser = userList?.users?.find(
      (u: any) => u.email?.toLowerCase() === cleanEmail
    );

    if (authUser) {
      // Upsert profile
      await adminSupabase.from('profiles').upsert({
        id: authUser.id,
        email: cleanEmail,
        full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || '',
        role,
      });

      return {
        success: true,
        message: `Linked existing auth account ${cleanEmail} and granted ${role} privileges.`,
      };
    }

    return {
      success: false,
      error: `No registered account found with email "${cleanEmail}". Please have the staff member register or sign up first, then elevate their role here.`,
    };
  } catch (err: any) {
    console.error('assignStaffByEmailAction error:', err);
    return { success: false, error: err.message || 'Failed to assign staff member.' };
  }
}

/**
 * Validates admin status upon login and auto-promotes INITIAL_ADMIN_EMAIL if configured
 */
export async function verifyOrBootstrapAdminAction(): Promise<{
  success: boolean;
  role?: UserRole;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return { success: true, role: 'admin' };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'No authenticated user session.' };
    }

    const adminSupabase = createAdminClient() as any;
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    if (
      initialAdminEmail &&
      user.email?.toLowerCase() === initialAdminEmail
    ) {
      if (profile?.role !== 'admin') {
        await adminSupabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
      }
      return { success: true, role: 'admin' };
    }

    if (profile?.role === 'admin') {
      return { success: true, role: 'admin' };
    }

    return {
      success: false,
      role: profile?.role as UserRole,
      error: 'Access Denied: This account does not have Workshop Administrator privileges.',
    };
  } catch (err: any) {
    console.error('verifyOrBootstrapAdminAction error:', err);
    return { success: false, error: err.message || 'Failed to verify admin status.' };
  }
}


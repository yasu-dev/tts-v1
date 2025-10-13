import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Profile, UserRole } from '@/types/database';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/auth/login');
  }
  return user;
}

export async function getUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile;
}

export async function requireBuyerProfile() {
  const profile = await getUserProfile();

  if (!profile || profile.role !== 'buyer') {
    redirect('/');
  }

  return profile;
}

export async function checkRole(allowedRoles: UserRole[]) {
  const profile = await getUserProfile();

  if (!profile || !allowedRoles.includes(profile.role)) {
    return false;
  }

  return true;
}

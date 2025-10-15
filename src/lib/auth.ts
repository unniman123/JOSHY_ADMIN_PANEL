import { supabase } from '@/integrations/supabase/client';
import type { AppRole } from '@/types/database';

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getUserRole(userId: string): Promise<AppRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error || !data) return null;
  return data.role as AppRole;
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Check if user is admin
  if (data.user) {
    const adminStatus = await isAdmin(data.user.id);
    if (!adminStatus) {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin privileges required.');
    }
  }
  
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function checkAdminAccess(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return await isAdmin(user.id);
}

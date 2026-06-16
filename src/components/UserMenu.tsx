'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

export default function UserMenu() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-red-600 hover:bg-red-50"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}
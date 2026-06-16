'use client';

import { createClient } from '@/lib/supabase';

export default function GoogleSignInButton() {
  const supabase = createClient();

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:
          window.location.origin +
          '/dashboard',
      },
    });
  }

  return (
    <button
      onClick={signIn}
      className="w-full bg-white border border-gray-300 rounded-xl py-3 font-medium hover:bg-gray-50"
    >
      Continue with Google
    </button>
  );
}
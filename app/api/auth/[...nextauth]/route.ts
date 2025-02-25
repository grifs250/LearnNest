import NextAuth, { NextAuthOptions } from 'next-auth';
import { SupabaseAdapter } from '@next-auth/supabase-adapter';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types/supabase';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'supabase',
      name: 'Supabase',
      type: 'oauth',
      version: '2.0',
      authorization: `${process.env.SUPABASE_URL}/auth/v1/authorize`,
      accessTokenUrl: `${process.env.SUPABASE_URL}/auth/v1/token`,
      requestTokenUrl: `${process.env.SUPABASE_URL}/auth/v1/token`,
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.user_metadata.full_name,
          email: profile.email,
        };
      },
    },
  ],
  adapter: SupabaseAdapter({
    url: process.env.SUPABASE_URL || '',
    secret: process.env.SUPABASE_SECRET || '',
  }),
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      session.user.id = user.id;
      return session;
    },
  },
};

export default NextAuth(authOptions); 
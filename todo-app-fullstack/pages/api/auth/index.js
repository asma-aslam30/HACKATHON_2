/**
 * Enhanced authentication API using Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  }
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name, action } = req.body;

    try {
      if (action === 'signup') {
        // Sign up with email and password
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            name: name || email.split('@')[0]
          },
          email_confirm: true // Auto-confirm for development
        });

        if (error) throw error;

        // Create user profile in our database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([{
            id: data.user.id,
            email,
            name: name || email.split('@')[0]
          }])
          .select()
          .single();

        if (profileError) throw profileError;

        return res.status(200).json({ user: profile });
      } else if (action === 'login') {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Get user profile from our database
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        return res.status(200).json({ user: profile });
      } else if (action === 'forgot-password') {
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
        });

        if (error) throw error;

        return res.status(200).json({ message: 'Password reset email sent' });
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: error.message || 'Authentication failed' });
    }
  }

  // Handle email verification callback
  if (req.method === 'GET') {
    const { type, token_hash, next } = req.query;

    if (type === 'email' && token_hash) {
      // Verify email token
      const { error } = await supabase.auth.verifyOtp({
        type: 'email',
        token_hash,
      });

      if (error) {
        return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth?error=${error.message}`);
      }

      return res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth?success=true`);
    }

    return res.status(400).json({ error: 'Invalid request' });
  }

  res.setHeader('Allow', ['POST', 'GET']);
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
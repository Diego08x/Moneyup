import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigValid = typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');

if (!isConfigValid) {
  console.warn('Supabase URL is missing or invalid. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your project settings. Using your provided credentials as fallback.');
}

// Credenciales proporcionadas por el usuario:
const DEFAULT_URL = 'https://oaOSIgTS6R55dS1AExJ1IA.supabase.co';
const DEFAULT_KEY = 'sb_publishable_oaOSIgTS6R55dS1AExJ1IA_nDXkpe8e';

export const supabase = createClient(
  isConfigValid ? supabaseUrl : DEFAULT_URL,
  supabaseAnonKey || DEFAULT_KEY
);

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

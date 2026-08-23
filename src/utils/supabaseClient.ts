import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hlljsgowuvojxmrymhex.supabase.co';
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbGpzZ293dXZvanhtcnltaGV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTI4ODgsImV4cCI6MjEwMzA4ODg4OH0.xWxyCVqENJyVe2g4xTDekHLzkPwUYrdkVyjWlCoMoMw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

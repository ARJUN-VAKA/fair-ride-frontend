import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cxmlerkxwxfqenexvtim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bWxlcmt4d3hmcWVuZXh2dGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjcyOTIsImV4cCI6MjA5NDMwMzI5Mn0.q1oU7d2fCp7Kb0ZwyJ7858wXhfRvbinChyXPbTHDC_8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

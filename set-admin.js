const SUPABASE_URL = 'https://cxmlerkxwxfqenexvtim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bWxlcmt4d3hmcWVuZXh2dGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjcyOTIsImV4cCI6MjA5NDMwMzI5Mn0.q1oU7d2fCp7Kb0ZwyJ7858wXhfRvbinChyXPbTHDC_8';
async function updateAdmin() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.admin@fairride.in`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'admin' })
  });
  console.log('STATUS:', res.status);
  const body = await res.text();
  console.log('BODY:', body);
}
updateAdmin();

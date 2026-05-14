fetch('https://fair-ride-frontend.vercel.app/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'tom@gmail.com', password: '123' })
}).then(async res => {
  console.log(res.status, res.headers.get('content-type'));
  const text = await res.text();
  console.log(text.substring(0, 100));
}).catch(console.error);

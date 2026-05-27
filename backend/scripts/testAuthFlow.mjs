const BASE = 'http://localhost:3000';

async function run(){
  console.log('Login...');
  const loginRes = await fetch(`${BASE}/auth/login`,{
    method:'POST',
    headers:{'content-type':'application/json'},
    body: JSON.stringify({email:'admin@loja.com', password:'Admin123'}),
    // node-fetch won't store cookies automatically; capture Set-Cookie
  });
  const loginBody = await loginRes.json();
  const setCookie = loginRes.headers.get('set-cookie');
  console.log('login body:', loginBody);
  console.log('set-cookie:', setCookie);
  const accessToken = loginBody.accessToken;

  console.log('\nCall /auth/me with access token');
  const meRes = await fetch(`${BASE}/auth/me`,{
    headers:{'Authorization': 'Bearer '+accessToken}
  });
  console.log('me:', await meRes.json());

  console.log('\nCall /auth/refresh with cookie');
  const refreshRes = await fetch(`${BASE}/auth/refresh`,{
    method:'POST',
    headers: setCookie ? { 'Cookie': setCookie } : undefined,
  });
  const refreshBody = await refreshRes.json();
  const newSetCookie = refreshRes.headers.get('set-cookie');
  console.log('refresh body:', refreshBody);
  console.log('new set-cookie:', newSetCookie);

  console.log('\nCall /auth/logout with cookie');
  const logoutRes = await fetch(`${BASE}/auth/logout`,{
    method:'POST',
    headers: newSetCookie ? { 'Cookie': newSetCookie } : (setCookie ? { 'Cookie': setCookie } : undefined),
  });
  console.log('logout:', await logoutRes.json());
}

run().catch(e=>{console.error(e); process.exit(1);});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function reply(body, status) {
  return new Response(JSON.stringify(body), { status: status || 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch (e) { return reply({ ok: false, error: 'bad request' }, 400); }
  if (data.company) return reply({ ok: true });
  const email = String(data.email || '').trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return reply({ ok: false, error: 'invalid email' }, 400);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = 'rl:' + ip;
  const seen = parseInt((await env.ADAM_SIGNUPS.get(key)) || '0', 10);
  if (seen >= 8) return reply({ ok: false, error: 'too many tries' }, 429);
  await env.ADAM_SIGNUPS.put(key, String(seen + 1), { expirationTtl: 3600 });
  const existing = await env.ADAM_SIGNUPS.get('e:' + email);
  if (!existing) await env.ADAM_SIGNUPS.put('e:' + email, JSON.stringify({ at: new Date().toISOString(), from: request.headers.get('Referer') || '' }));
  return reply({ ok: true });
}

export function onRequest() {
  return reply({ ok: false, error: 'method not allowed' }, 405);
}

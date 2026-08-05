import type { APIRoute } from 'astro';

// On-demand (server) route: the rest of the site is prerendered to static HTML.
export const prerender = false;

const TOKEN = import.meta.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const clip = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown> = {};
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await request.json();
    } else {
      body = Object.fromEntries((await request.formData()).entries());
    }
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success, send nothing.
  if (clip(body.website, 100)) return json({ ok: true });

  const name = clip(body.name, 200);
  const company = clip(body.company, 200);
  const phone = clip(body.phone, 60);
  const email = clip(body.email, 200);
  const task = clip(body.task, 4000);

  if (!name || (!phone && !email)) {
    return json({ ok: false, error: 'validation' }, 422);
  }

  if (!TOKEN || !CHAT_ID) {
    // Misconfiguration — do not leak details to the client.
    console.error('[contact] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set');
    return json({ ok: false, error: 'server_config' }, 500);
  }

  const lines = [
    '<b>Заявка с сайта otktrans.ru</b>',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    company && `<b>Компания:</b> ${escapeHtml(company)}`,
    phone && `<b>Телефон:</b> ${escapeHtml(phone)}`,
    email && `<b>Почта:</b> ${escapeHtml(email)}`,
    task && `<b>Задача:</b> ${escapeHtml(task)}`,
  ].filter(Boolean);

  try {
    const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: lines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!tg.ok) {
      const detail = await tg.text();
      console.error('[contact] Telegram API error:', tg.status, detail);
      return json({ ok: false, error: 'delivery' }, 502);
    }
  } catch (e) {
    console.error('[contact] Telegram request failed:', e);
    return json({ ok: false, error: 'delivery' }, 502);
  }

  return json({ ok: true });
};

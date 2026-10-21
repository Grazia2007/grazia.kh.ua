import { NextResponse } from 'next/server';

// Ініціалізуємо серверні змінні для доступу до бази даних
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const escapeHtml = (v: unknown) =>
  String(v ?? '').slice(0, 300).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// заявка "Хочу так само" зі сторінки проєкту: фото роботи + телефон
async function handleProjectLead(body: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'Сервер не налаштовано для відправки в Telegram' }, { status: 500 });
  }
  const digits = String(body?.phone || '').replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 13) {
    return NextResponse.json({ error: 'Некоректний телефон' }, { status: 400 });
  }

  const title = escapeHtml(body.projectTitle || 'Без назви');
  const location = escapeHtml(body.projectLocation || '');
  const phone = escapeHtml(body.phone);
  const caption = `🛋 <b>ХОЧУ ТАК САМО</b>\n\n<b>Проєкт:</b> ${title}${location ? `\n<b>Район:</b> ${location}` : ''}\n\n📞 <b>Телефон:</b> <code>${phone}</code>`;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: 'furniture',
        customer_name: 'Лід «Хочу так само»',
        total_amount: 0,
        status: 'draft',
        ttn_number: `Хочу так само: ${String(body.projectTitle || '').slice(0, 200)} | ${digits}`
      })
    });
  } catch (dbError) {
    console.error('Помилка автозбереження ліда в Supabase:', dbError);
  }

  // фото беремо лише з нашого сховища, щоб форму не можна було використати для чужих посилань
  const cover = String(body.coverUrl || '');
  const isOwnPhoto = !!SUPABASE_URL && cover.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`);
  const tg = (method: string, payload: object) =>
    fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, parse_mode: 'HTML', ...payload })
    });

  let res = isOwnPhoto ? await tg('sendPhoto', { photo: cover, caption }) : null;
  if (!res || !res.ok) res = await tg('sendMessage', { text: caption });
  if (!res.ok) {
    console.error('Telegram API error:', await res.json().catch(() => ({})));
    return NextResponse.json({ error: 'Не вдалося надіслати' }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body?.source === 'project') return handleProjectLead(body);
    
    // 1. ✅ ЗАПИС В ТАБЛИЦЮ ORDERS НА СЕРВЕРНОМУ РІВНІ
    // База пропустить цей запит, навіть якщо анонімний доступ (Anon can insert) буде вимкнено!
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          store_id: 'furniture',
          customer_name: 'Лід з 3D Конфігуратора',
          total_amount: 0,
          status: 'draft',
          ttn_number: body.message || 'Порожній лід з конфігуратора'
        })
      });
    } catch (dbError) {
      // Обгортаємо в окремий try/catch, щоб якщо база затупить, адмін все одно отримав лід в ТГ
      console.error('Помилка автозбереження ліда в Supabase:', dbError);
    }

    // 2. 📱 ЛОГІКА ТЕЛЕГРАМ-БОТА (Дістаємо розширену структуру даних для Марини)
    const { 
      type, 
      furnitureClass, 
      layout, 
      leftModule, 
      rightModule, 
      upperTier, 
      colors, 
      dimensions, 
      gift, 
      phone, 
      time 
    } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials are not configured');
      return NextResponse.json(
        { error: 'Сервер не налаштовано для відправки в Telegram' },
        { status: 500 }
      );
    }

    // Допоміжна функція для красивого виводу пеналів
    const getModuleText = (val: string) => {
      if (!val || val === 'none') return 'Відсутній';
      if (val === 'fridge_built') return 'Вбудований Холодильник';
      if (val === 'fridge_open') return 'Ніша під Холодильник';
      if (val === 'oven') return 'Духовка + Мікрохвильовка/Кавоварка';
      if (val === 'storage') return 'Пенал для зберігання';
      return val;
    };

    // Формуємо красиве повідомлення для Марини з новими даними
    const message = `
🌟 <b>НОВИЙ ЛІД З 3D КОНФІГУРАТОРА!</b> 🌟

📦 <b>Виріб:</b> ${type || 'Не обрано'}
💎 <b>Клас виконання:</b> ${furnitureClass || 'Стандарт'}
${type === 'Кухня' ? `📐 <b>Планування:</b> ${layout || 'Не обрано'}

🏢 <b>ПЕНАЛИ ТА ЯРУСИ:</b>
• Лівий пенал: ${getModuleText(leftModule)}
• Правий пенал: ${getModuleText(rightModule)}
• Верхні секції: ${upperTier || 'Одноярусні'}` : ''}

🎨 <b>КОЛЬОРИ ТА МАТЕРІАЛИ:</b>
• Нижні фасади (Основа): ${colors?.base || body.color || 'Не обрано'}
${type === 'Кухня' ? `• Upper фасади: ${colors?.upper || 'Не обрано'}
• Антресолі: ${colors?.topTier || 'Не обрано'}` : ''}
• Корпус: ${colors?.carcass || 'Не обрано'}
${type === 'Кухня' ? `• Стільниця: ${colors?.countertop || 'Не обрано'}` : ''}

📏 <b>РОЗМІРИ (Важливо):</b>
• Довжина (L): ${dimensions?.length || body.length ? `${dimensions?.length || body.length} мм` : '?'}
• Глибина (W): ${dimensions?.width || body.width ? `${dimensions?.width || body.width} мм` : '?'}
• Висота (H): ${dimensions?.height || body.height ? `${dimensions?.height || body.height} мм` : '?'}

🎁 <b>Обраний подарунок:</b> ${gift || 'Не обрано'}

📞 <b>КОНТАКТИ КЛІЄНТА:</b>
• Telephone: <code>${phone || 'Не вказано'}</code>
• Зручний час дзвінка: <b>${time || 'Найближчим часом'}</b>

<i>* Цей лід пройшов розширену воронку нового конфігуратора на сайті й успішно захищений сервером.</i>
    `.trim();

    // Відправляємо запит до Telegram API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Telegram API error:', errorData);
      throw new Error('Failed to send message to Telegram');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
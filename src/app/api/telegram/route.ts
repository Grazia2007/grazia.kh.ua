import { NextResponse } from 'next/server';

// Ініціалізуємо серверні змінні для доступу до бази даних
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
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
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Оновлена структура даних з 3D Конфігуратора
    const { type, layout, style, color, dimensions, gift, phone, time, notes } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials are not configured');
      return NextResponse.json(
        { error: 'Сервер не налаштовано для відправки в Telegram' },
        { status: 500 }
      );
    }

    // Формуємо красиве повідомлення для Марини з новими даними
    const message = `
🌟 <b>НОВИЙ ЛІД З 3D КОНФІГУРАТОРА!</b> 🌟

📦 <b>Виріб:</b> ${type || 'Не обрано'}
📐 <b>Форм-фактор:</b> ${layout || 'Не обрано'}
🎨 <b>Дизайн/Колір:</b> ${color || 'Не обрано'}

📏 <b>РОЗМІРИ (Важливо):</b>
• Довжина (L): ${dimensions?.length ? `${dimensions.length} мм` : '?'}
• Глибина (W): ${dimensions?.width ? `${dimensions.width} мм` : '?'}
• Висота (H): ${dimensions?.height ? `${dimensions.height} мм` : '?'}

🎁 <b>Обраний подарунок:</b> ${gift || 'Не обрано'}

📞 <b>КОНТАКТИ КЛІЄНТА:</b>
• Телефон: <code>${phone || 'Не вказано'}</code>
• Зручний час дзвінка: <b>${time || 'Найближчим часом'}</b>

<i>* Цей лід пройшов повну воронку нового конфігуратора на сайті.</i>
    `;

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
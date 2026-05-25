import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { spaceType, room, style, material, notes } = body;

    // ВИПРАВЛЕНО: тепер назва змінної збігається з .env.local на 100%
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials are not configured');
      return NextResponse.json(
        { error: 'Сервер не налаштовано для відправки в Telegram' },
        { status: 500 }
      );
    }

    // Словники для красивого форматування значень з англійської на українську
    const spaceTypes: Record<string, string> = {
      'flat': 'Квартира (Новобудова)',
      'flat_old': 'Квартира (Вторинний ринок)',
      'house': 'Приватний будинок',
      'commercial': 'Комерційне приміщення'
    };
    
    const rooms: Record<string, string> = {
      'kitchen': 'Кухня',
      'wardrobe': 'Шафа-купе / Гардеробна',
      'living': 'Меблі у вітальню',
      'bathroom': 'Меблі для ванної',
      'complex': 'Комплексне меблювання'
    };

    const styles: Record<string, string> = {
      'minimalism': 'Мінімалізм',
      'classic': 'Неокласика',
      'loft': 'Лофт'
    };

    const materials: Record<string, string> = {
      'mdf_paint': 'МДФ Фарбований',
      'mdf_film': 'МДФ Плівка / Пластик',
      'wood': 'Шпон / Масив дерева',
      'dsp': 'ДСП (Бюджетний варіант)'
    };

    // Формуємо красиве повідомлення з емодзі
    const message = `
🎯 <b>НОВА ЗАЯВКА З КАЛЬКУЛЯТОРА</b>

🏢 <b>Тип приміщення:</b> ${spaceTypes[spaceType] || spaceType || 'Не вказано'}
🛋 <b>Кімната:</b> ${rooms[room] || room || 'Не вказано'}
🎨 <b>Стиль:</b> ${styles[style] || style || 'Не вказано'}
🪵 <b>Матеріали:</b> ${materials[material] || material || 'Не вказано'}

📝 <b>Коментар / Побажання:</b>
<i>${notes || 'Без додаткових побажань'}</i>
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
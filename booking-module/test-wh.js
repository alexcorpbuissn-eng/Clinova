import 'dotenv/config';

async function main() {
  const res = await fetch('https://habbullo-hilola-booking.vercel.app/api/telegram/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-secret-token': 'hh-wh-s3cr3t-k3y-2025-uz'
    },
    body: JSON.stringify({
      message: {
        chat: { id: -5257710818 }, // A dummy chat ID
        text: '/start'
      }
    })
  });
  console.log(res.status, await res.text());
}
main();

const APP = "LUMA";

function shell(title: string, body: string, ctaUrl: string, ctaText: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#0a0a0b;font-family:'Courier New',monospace;color:#f0ede6;">
  <div style="max-width:460px;margin:0 auto;padding:40px 24px;">
    <div style="font-size:22px;font-weight:700;letter-spacing:-1px;color:#e6b566;">${APP}</div>
    <div style="margin-top:28px;background:#17171a;border:1px solid rgba(255,255,255,0.06);border-radius:22px;padding:28px;">
      <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#f0ede6;">${title}</h1>
      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#cfcbc2;">${body}</p>
      <a href="${ctaUrl}" style="display:inline-block;background:#e6b566;color:#17130a;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;font-size:15px;">${ctaText}</a>
    </div>
    <p style="margin:22px 4px 0;font-size:12px;line-height:1.6;color:#66635c;">${footer}</p>
  </div></body></html>`;
}

const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function dailyReminder(name: string | null) {
  const hi = name ? `Hey ${name},` : "Hey,";
  return {
    subject: "Your day's worth a line ✦",
    html: shell(
      "How was today?",
      `${hi} you haven't opened your diary today. Even one line — a photo, a moment, a number — keeps the thread going.`,
      `${siteUrl()}/app`,
      "Open today →",
      `You're getting daily nudges from ${APP}. Manage reminders in Settings.`,
    ),
  };
}

export function weeklyReminder(name: string | null) {
  const hi = name ? `Hey ${name},` : "Hey,";
  return {
    subject: "A quiet week in your diary?",
    html: shell(
      "Your week, in one place",
      `${hi} it's been a little quiet in ${APP} this week. Take two minutes to capture what mattered — your future self will thank you.`,
      `${siteUrl()}/app/week`,
      "See my week →",
      `You're getting weekly nudges from ${APP}. Manage reminders in Settings.`,
    ),
  };
}

import { escapeHtml } from '../scripts/newsletter/template.mjs';

const copy = {
  pt: {
    label: 'NEWSLETTER / COMMAND LINUX', title: 'Falta só confirmar.',
    description: 'Confirme sua inscrição para receber novos artigos sobre Linux, DevOps e Cloud na sua caixa de entrada.',
    button: 'Confirmar minha inscrição', expiry: 'Este link é válido por 24 horas. Se você não pediu a inscrição, pode ignorar este e-mail.',
    home: 'Voltar para o blog', footer: 'Aprenda. Construa. Compartilhe. Evolua.',
    success: ['Inscrição confirmada!', 'Tudo pronto. Os próximos artigos chegarão por e-mail. Você pode cancelar a inscrição a qualquer momento.'],
    expired: ['Este link expirou.', 'O link expirou ou já foi utilizado. Se ainda não confirmou sua inscrição, solicite um novo link pelo formulário do blog.'],
    invalid: ['Link inválido.', 'Solicite um novo link de confirmação pelo formulário do blog.'],
    error: ['Não foi possível confirmar agora.', 'Sua confirmação não foi concluída. Aguarde um momento e tente novamente usando o botão abaixo.'],
    optedOut: ['Seu cancelamento foi respeitado.', 'Sua inscrição continua cancelada. Nenhuma alteração foi feita nas suas preferências.'],
    retry: 'Tentar novamente',
  },
  en: {
    label: 'NEWSLETTER / COMMAND LINUX', title: 'One more step.',
    description: 'Confirm your subscription to receive new articles about Linux, DevOps and Cloud in your inbox.',
    button: 'Confirm my subscription', expiry: 'This link expires in 24 hours. If you did not request this subscription, you can ignore this email.',
    home: 'Back to the blog', footer: 'Learn. Build. Share. Evolve.',
    success: ['Subscription confirmed!', 'You are all set. New articles will arrive by email. You can unsubscribe at any time.'],
    expired: ['This link has expired.', 'This link has expired or was already used. If you have not confirmed yet, request a new link using the blog form.'],
    invalid: ['Invalid link.', 'Request a new confirmation link using the blog form.'],
    error: ['We could not confirm right now.', 'Your confirmation was not completed. Wait a moment and try again using the button below.'],
    optedOut: ['Your unsubscribe was respected.', 'Your subscription remains cancelled. Your preferences have not been changed.'],
    retry: 'Try again',
  },
};

export function renderConfirmationEmail(url, language = 'pt') {
  const t = copy[language] || copy.pt;
  return `<!doctype html><html lang="${language === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${t.title}</title></head>
<body style="margin:0;background:#080808;font-family:Arial,Helvetica,sans-serif;color:#f5f5f5;">
<div style="display:none;max-height:0;overflow:hidden;">${t.description}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080808;"><tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#111;border:1px solid #282828;border-radius:16px;">
<tr><td style="padding:32px;border-bottom:1px solid #282828;font:700 24px monospace;color:#f5f5f5;"><span style="color:#39ff6a;">&gt;_</span> CommandLinux</td></tr>
<tr><td style="padding:40px 32px;"><p style="color:#39ff6a;font:12px monospace;letter-spacing:2px;">${t.label}</p>
<h1 style="font-size:34px;line-height:1.2;margin:20px 0;">${t.title}</h1><p style="color:#b5b5b5;font-size:16px;line-height:1.8;">${t.description}</p>
<table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;"><tr><td bgcolor="#39ff6a" style="border-radius:8px;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:18px 24px;color:#080808;font-size:16px;font-weight:bold;text-decoration:none;">${t.button} &rarr;</a></td></tr></table>
<p style="color:#a3a3a3;font-size:13px;line-height:1.7;">${t.expiry}</p>
<p style="color:#a3a3a3;font-size:12px;line-height:1.7;word-break:break-all;">${language === 'en' ? 'Or copy this link into your browser:' : 'Ou copie este link no navegador:'}<br><a href="${escapeHtml(url)}" style="color:#b5b5b5;">${escapeHtml(url)}</a></p></td></tr>
<tr><td style="padding:24px 32px;border-top:1px solid #282828;color:#a3a3a3;font-size:12px;line-height:1.7;">${t.footer}<br>CommandLinux · commandlinux.dev</td></tr></table>
</td></tr></table></body></html>`;
}

export function confirmationText(url, language = 'pt') {
  const t = copy[language] || copy.pt;
  return `${t.title}\n\n${t.description}\n\n${t.button}: ${url}\n\n${t.expiry}`;
}

export function renderConfirmationPage(state = 'confirm', language = 'pt') {
  const t = copy[language] || copy.pt;
  const [title, description] = state === 'confirm' ? [t.title, t.description] : t[state];
  const action = ['confirm', 'error'].includes(state)
    ? `<form method="post"><button type="submit">${state === 'error' ? t.retry : t.button} <span aria-hidden="true">→</span></button></form>` : '';
  return `<!doctype html><html lang="${language === 'en' ? 'en' : 'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — CommandLinux</title>
<style>
*{box-sizing:border-box}body{margin:0;min-height:100svh;background:#080808;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;display:grid;place-items:center;padding:24px;background-image:radial-gradient(ellipse at top,#123021 0,transparent 65%)}main{width:100%;max-width:560px;background:#111;border:1px solid #282828;border-radius:20px;overflow:hidden;box-shadow:0 24px 90px #0006}header{padding:26px 32px;border-bottom:1px solid #282828;font:700 22px monospace}header span,.label{color:#39ff6a}.content{padding:40px 32px}.label{font:11px monospace;letter-spacing:2px}h1{font-size:clamp(28px,6vw,38px);line-height:1.15;margin:24px 0 16px}p{color:#b5b5b5;font-size:16px;line-height:1.8}button{width:100%;display:flex;justify-content:space-between;gap:12px;background:#39ff6a;color:#080808;border:0;border-radius:8px;padding:18px 22px;font:700 16px Arial;cursor:pointer;margin:28px 0}button:hover{background:#78ff9a}a{color:#b5b5b5;text-underline-offset:4px}button:focus-visible,a:focus-visible{outline:3px solid #00d4ff;outline-offset:5px}.back{font-size:14px}footer{padding:22px 32px;border-top:1px solid #282828;color:#a3a3a3;font:12px/1.8 monospace}@media(max-width:400px){.content,header,footer{padding:24px}}
</style></head><body><main><header><span>&gt;_</span> CommandLinux</header><section class="content"><div class="label">${t.label}</div><h1>${title}</h1><p>${description}</p>${action}<a class="back" href="${language === 'en' ? '/en/' : '/'}">${t.home} ↗</a></section><footer>${t.footer}</footer></main></body></html>`;
}

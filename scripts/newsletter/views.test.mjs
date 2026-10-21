import test from 'node:test';
import assert from 'node:assert/strict';
import { renderConfirmationEmail, confirmationText, renderConfirmationPage } from '../../lib/newsletter-views.mjs';

test('confirmation emails use the selected language, escaped URLs and a plain text alternative', () => {
  for (const language of ['pt', 'en']) {
    const url = 'https://www.commandlinux.dev/api/newsletter-confirm?token=abc&lang=' + language;
    const html = renderConfirmationEmail(url, language);
    assert.match(html, /role="presentation"/);
    assert.ok(html.includes('&amp;lang=' + language));
    assert.ok(confirmationText(url, language).includes(url));
    assert.ok(html.includes(language === 'pt' ? 'Confirmar minha inscrição' : 'Confirm my subscription'));
  }
});
test('confirmation page offers a POST retry only before confirmation or after transient failure', () => {
  for (const language of ['pt', 'en']) {
    for (const state of ['confirm', 'error', 'success', 'expired', 'invalid', 'optedOut']) {
      const html = renderConfirmationPage(state, language);
      assert.equal(html.includes('<form method="post">'), ['confirm', 'error'].includes(state));
      assert.doesNotMatch(html, /<script|undefined/);
      assert.match(html, /name="viewport"/);
    }
  }
});

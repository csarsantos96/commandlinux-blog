const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto('http://localhost:4322/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/claude-1000/-home-ghostnode-Desktop-commandlinux/5f1df1ed-a3a6-4625-a6f3-f2e2c89e3cbb/scratchpad/dark-home.png' });

  await page.click('[data-theme-toggle]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/claude-1000/-home-ghostnode-Desktop-commandlinux/5f1df1ed-a3a6-4625-a6f3-f2e2c89e3cbb/scratchpad/light-home.png' });

  // navigate to a post to check code blocks + category tags in light mode
  await page.goto('http://localhost:4322/posts/fundamentos-de-iac-com-terraform/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/tmp/claude-1000/-home-ghostnode-Desktop-commandlinux/5f1df1ed-a3a6-4625-a6f3-f2e2c89e3cbb/scratchpad/light-post.png', fullPage: true });

  // reload to confirm persistence (localStorage) picks light theme without FOUC
  await page.reload({ waitUntil: 'networkidle' });
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  console.log('theme after reload:', theme);
  await page.screenshot({ path: '/tmp/claude-1000/-home-ghostnode-Desktop-commandlinux/5f1df1ed-a3a6-4625-a6f3-f2e2c89e3cbb/scratchpad/light-post-reload.png' });

  await browser.close();
})();

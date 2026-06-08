const ws = require('ws');
const fs = require('fs');

const HOME_PAGE_ID = '9FC676F03B0D7750DAF087A09739B73A';

function cdp(pageId, method, params) {
  return new Promise((resolve, reject) => {
    const sock = new ws(`ws://127.0.0.1:9223/devtools/page/${pageId}`);
    const id = Date.now() + Math.floor(Math.random() * 1000);
    sock.on('open', () => sock.send(JSON.stringify({ id, method, params: params || {} })));
    sock.on('message', d => {
      const m = JSON.parse(d);
      if (m.id === id) { sock.close(); resolve(m.result); }
    });
    sock.on('error', reject);
    setTimeout(() => { sock.close(); reject('timeout ' + method); }, 15000);
  });
}

(async () => {
  // Navigate to landing, reload
  await cdp(HOME_PAGE_ID, 'Page.navigate', { url: 'http://localhost:3002/' });
  await new Promise(r => setTimeout(r, 3000));

  // Create a room via Quick-Create JS
  const result = await cdp(HOME_PAGE_ID, 'Runtime.evaluate', {
    expression: `(async () => {
      // simulate click on "Raum erstellen →" button in quick-create
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.trim() === 'Raum erstellen →');
      if (btn) { btn.click(); return 'clicked'; }
      return 'not found: ' + btns.map(b => b.textContent.trim()).join(' | ');
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  console.log('button click result:', result?.result?.value);

  await new Promise(r => setTimeout(r, 4000));

  // Get current URL (should be /room/...)
  const urlResult = await cdp(HOME_PAGE_ID, 'Runtime.evaluate', {
    expression: 'window.location.href',
    returnByValue: true,
  });
  const url = urlResult?.result?.value;
  console.log('URL after create:', url);

  // Screenshot
  await new Promise(r => setTimeout(r, 2000));
  const s = await cdp(HOME_PAGE_ID, 'Page.captureScreenshot', { format: 'jpeg', quality: 70 });
  fs.writeFileSync('/tmp/r-room-created.jpg', Buffer.from(s.data, 'base64'));
  console.log('screenshot saved');
})().catch(e => console.error('error:', e));

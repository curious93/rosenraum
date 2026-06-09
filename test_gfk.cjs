const ws = require('ws');
const fs = require('fs');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function cdp(pageId, method, params = {}) {
  return new Promise((resolve, reject) => {
    const sock = new ws(`ws://127.0.0.1:9223/devtools/page/${pageId}`);
    const id = Date.now();
    sock.on('open', () => sock.send(JSON.stringify({ id, method, params })));
    sock.on('message', d => { const m = JSON.parse(d); if (m.id === id) { sock.close(); resolve(m.result); } });
    sock.on('error', reject);
    setTimeout(() => { sock.close(); reject('timeout:' + method); }, 15000);
  });
}

const shot = async (pageId, path) => {
  const r = await cdp(pageId, 'Page.captureScreenshot', { format: 'jpeg', quality: 80 });
  fs.writeFileSync(path, Buffer.from(r.data, 'base64'));
  console.log('📸', path);
};

const run = async (pageId, expr) => {
  const r = await cdp(pageId, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r?.result?.value;
};

(async () => {
  const tabs = JSON.parse(require('child_process').execSync('curl -s http://127.0.0.1:9223/json').toString());
  const tab = tabs.find(t => t.url.includes('localhost:3000'));
  const pageId = tab.id;
  console.log('Tab:', tab.url);

  // Inspect all buttons in the DOM
  const btns = await run(pageId, `
    JSON.stringify([...document.querySelectorAll('button')].map(b => ({
      text: b.textContent.trim().slice(0,30),
      class: b.className.slice(0,40),
      type: b.type
    })))
  `);
  console.log('Buttons:', btns);

  // Find the send/submit button by its position (bottom right of input area)
  const inputInfo = await run(pageId, `
    const ta = document.querySelector('textarea');
    const btn = ta?.closest('form')?.querySelector('button') || ta?.parentElement?.querySelector('button') || ta?.nextElementSibling;
    JSON.stringify({
      taFound: !!ta,
      btnFound: !!btn,
      btnText: btn?.textContent?.trim(),
      btnClass: btn?.className?.slice(0,60)
    })
  `);
  console.log('Input info:', inputInfo);
})().catch(console.error);

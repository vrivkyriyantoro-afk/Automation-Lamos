import { Locator, Page } from '@playwright/test';

/**
 * Penanda visual untuk eviden bug: kotak merah + label di atas elemen bermasalah.
 * Overlay di-inject sebagai elemen absolut ber-`data-eviden`, jadi bisa dibersihkan
 * tanpa menyentuh DOM aplikasi.
 */
export async function tandaiKotakMerah(page: Page, target: Locator, label: string) {
  const box = await target.boundingBox();
  if (!box) throw new Error(`Elemen untuk label "${label}" tidak punya bounding box`);

  await page.evaluate(
    ({ box, label }) => {
      const pad = 6;
      const kotak = document.createElement('div');
      kotak.setAttribute('data-eviden', '1');
      Object.assign(kotak.style, {
        position: 'absolute',
        left: `${box.x + window.scrollX - pad}px`,
        top: `${box.y + window.scrollY - pad}px`,
        width: `${box.width + pad * 2}px`,
        height: `${box.height + pad * 2}px`,
        border: '3px solid #e03131',
        borderRadius: '4px',
        boxShadow: '0 0 0 2px rgba(224,49,49,0.25)',
        pointerEvents: 'none',
        zIndex: '2147483647',
      });

      const teks = document.createElement('div');
      teks.setAttribute('data-eviden', '1');
      teks.textContent = label;
      Object.assign(teks.style, {
        position: 'absolute',
        left: `${box.x + window.scrollX - pad}px`,
        top: `${Math.max(0, box.y + window.scrollY - pad - 26)}px`,
        background: '#e03131',
        color: '#fff',
        font: '600 13px/20px system-ui, sans-serif',
        padding: '2px 8px',
        borderRadius: '4px',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        zIndex: '2147483647',
      });

      document.body.append(kotak, teks);
    },
    { box, label }
  );
}

/** Hapus seluruh overlay eviden agar tidak terbawa ke screenshot berikutnya. */
export async function bersihkanTanda(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('[data-eviden]').forEach((el) => el.remove());
  });
}

/**
 * Gulirkan container modal agar elemen target terlihat.
 * Modal memakai scroll container sendiri, jadi `scrollIntoView` biasa tidak cukup.
 */
export async function scrollKeElemen(page: Page, target: Locator) {
  await target.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior }));
  await page.waitForTimeout(600);
}

/**
 * Menyematkan simulated Browser Address Bar di paling atas halaman
 * agar URL aktif (page.url()) terlihat jelas pada hasil tangkapan layar.
 */
export async function sematkanUrlBar(page: Page) {
  const currentUrl = page.url();
  await page.evaluate((url) => {
    let bar = document.getElementById('qa-simulated-browser-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'qa-simulated-browser-bar';
      Object.assign(bar.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '36px',
        backgroundColor: '#eef2f6',
        borderBottom: '1px solid #d0d7de',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        zIndex: '2147483647',
        boxSizing: 'border-box',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
      });
      document.body.prepend(bar);
      document.body.style.paddingTop = '36px';
    }
    bar.innerHTML = `
      <div style="display: flex; gap: 8px; margin-right: 12px; color: #5f6368; font-size: 14px; user-select: none;">
        <span>←</span><span>→</span><span>↻</span>
      </div>
      <div style="flex: 1; display: flex; align-items: center; background: #ffffff; border: 1px solid #dadce0; border-radius: 18px; padding: 3px 12px; height: 26px; box-sizing: border-box; max-width: 950px;">
        <span style="font-size: 11px; margin-right: 6px; color: #1e8e3e;">🔒</span>
        <span style="font-size: 12px; color: #202124; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-family: Consolas, monospace;">${url}</span>
      </div>
    `;
  }, currentUrl);
}

/**
 * Hapus simulated Browser Address Bar setelah screenshot diambil.
 */
export async function hapusUrlBar(page: Page) {
  await page.evaluate(() => {
    const bar = document.getElementById('qa-simulated-browser-bar');
    if (bar) bar.remove();
    document.body.style.paddingTop = '';
  });
}

/**
 * Ambil screenshot bersih & natural:
 * 1. Tanpa kotakan merah (border outline) dan tanpa teks label.
 * 2. Natural dari browser tanpa menyuntikkan simulated bar tiruan yang menimpa header.
 */
export async function ambilScreenshotBersih(page: Page, outputPath: string, options?: { fullPage?: boolean }) {
  await bersihkanTanda(page).catch(() => {});
  await hapusUrlBar(page).catch(() => {});
  await page.waitForTimeout(200);

  // Tangani kemungkinan file locked di Windows
  try {
    const fs = await import('fs');
    if (fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch {
        /* abaikan jika file sedang di-lock oleh previewer */
      }
    }
  } catch {}

  try {
    await page.screenshot({ path: outputPath, fullPage: options?.fullPage ?? false });
  } catch (err) {
    // Retry sekali jika terjadi transient file lock error di Windows
    await page.waitForTimeout(600);
    await page.screenshot({ path: outputPath, fullPage: options?.fullPage ?? false });
  }
}

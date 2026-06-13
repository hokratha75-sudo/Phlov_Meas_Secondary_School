import html2canvas from 'html2canvas';

export const SCALE_300DPI = 3.14;   // 96dpi × 3.14 ≈ 301dpi

/**
 * Capture a DOM element to a canvas at high resolution.
 */
export async function captureElement(
  elementId: string,
  scale = SCALE_300DPI
): Promise<HTMLCanvasElement> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error(`Element #${elementId} not found`);
  return html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });
}

/**
 * Export a single card side as a PNG download.
 * @param elementId  DOM id of the card element to capture
 * @param filename   Download filename (without extension)
 */
export async function exportToPNG(
  elementId: string,
  filename = 'id-card'
): Promise<void> {
  const canvas = await captureElement(elementId, SCALE_300DPI);
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.png`;
  a.click();
}

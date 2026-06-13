import jsPDF from 'jspdf';
import { captureElement, SCALE_300DPI } from './image';

const CARD_W_MM = 54;
const CARD_H_MM = 86;

/**
 * Export front and back as a print-ready PDF.
 * Layout: A4 portrait, cards centered with 10mm margin.
 * Each page contains front (left) + back (right) of the same card,
 * sized at 85.6mm × 54mm (landscape card orientation for ID printers).
 */
export async function exportToPDF(
  frontId: string,
  backId: string,
  filename = 'id-cards'
): Promise<void> {
  const [frontCanvas, backCanvas] = await Promise.all([
    captureElement(frontId, SCALE_300DPI),
    captureElement(backId, SCALE_300DPI),
  ]);

  // A4 in mm
  const pageW = 210;
  const pageH = 297;

  // Card placed vertically (54 × 86mm) with 10mm margin from sides
  const gap = 10;
  const cardW = CARD_W_MM;
  const cardH = CARD_H_MM;

  // Center both cards horizontally side by side
  const totalW = cardW * 2 + gap;
  const startX = (pageW - totalW) / 2;
  const startY = (pageH - cardH) / 2;

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'portrait',
  });

  // Page 1: Front + Back side by side
  pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', startX, startY, cardW, cardH);
  pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', startX + cardW + gap, startY, cardW, cardH);

  // Draw crop marks
  drawCropMarks(pdf, startX, startY, cardW, cardH);
  drawCropMarks(pdf, startX + cardW + gap, startY, cardW, cardH);

  // Metadata
  pdf.setProperties({
    title: 'Student ID Card',
    subject: 'Print-ready ID Card',
    creator: 'Phlov Meas School System',
  });

  pdf.save(`${filename}.pdf`);
}

/**
 * Batch export: multiple students, 10 cards per A4 page (5 rows × 2 cols).
 */
export async function exportBatchToPDF(
  cardIds: { frontId: string; backId: string }[],
  filename = 'id-cards-batch'
): Promise<void> {
  if (cardIds.length === 0) return;

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = 210;
  const pageH = 297;
  const margin = 10;
  const colGap = 5;
  const rowGap = 5;
  const cardW = CARD_W_MM;
  const cardH = CARD_H_MM;
  const cols = 2;
  const rows = Math.floor((pageH - margin * 2 + rowGap) / (cardH + rowGap));
  const perPage = cols * rows;

  let pageIndex = 0;

  for (let i = 0; i < cardIds.length; i += perPage) {
    if (i > 0) pdf.addPage();
    const batch = cardIds.slice(i, i + perPage);

    for (let j = 0; j < batch.length; j++) {
      const { frontId, backId } = batch[j];
      const col = j % cols;
      const row = Math.floor(j / cols);
      const x = margin + col * (cardW + colGap);
      const y = margin + row * (cardH + rowGap);

      try {
        const [front, back] = await Promise.all([
          captureElement(frontId, SCALE_300DPI),
          captureElement(backId, SCALE_300DPI),
        ]);
        // Use front for odd pages, back for even pages
        pdf.addImage(front.toDataURL('image/png'), 'PNG', x, y, cardW, cardH);
      } catch (e) {
        console.error(`Failed to capture card ${j}`, e);
      }
    }
    pageIndex++;
  }

  pdf.save(`${filename}.pdf`);
}

// ─── Helper: 4mm crop marks at each corner ───────────────────
function drawCropMarks(
  pdf: jsPDF,
  x: number, y: number,
  w: number, h: number,
  len = 3,
  gap = 1.5
) {
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.1);

  // Top-left
  pdf.line(x - gap - len, y, x - gap, y);
  pdf.line(x, y - gap - len, x, y - gap);
  // Top-right
  pdf.line(x + w + gap, y, x + w + gap + len, y);
  pdf.line(x + w, y - gap - len, x + w, y - gap);
  // Bottom-left
  pdf.line(x - gap - len, y + h, x - gap, y + h);
  pdf.line(x, y + h + gap, x, y + h + gap + len);
  // Bottom-right
  pdf.line(x + w + gap, y + h, x + w + gap + len, y + h);
  pdf.line(x + w, y + h + gap, x + w, y + h + gap + len);
}

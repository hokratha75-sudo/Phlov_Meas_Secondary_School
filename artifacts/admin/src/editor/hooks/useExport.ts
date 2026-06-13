import { useState, useCallback } from 'react';
import { exportToPNG } from '@/export/image';
import { exportToPDF } from '@/export/pdf';

export type ExportFormat = 'png-front' | 'png-back' | 'pdf' | 'pdf-batch';
export type ExportStatus = 'idle' | 'capturing' | 'generating' | 'done' | 'error';

interface UseExportOptions {
  /** DOM id of the front card element */
  frontElementId: string;
  /** DOM id of the back card element */
  backElementId: string;
  /** Base filename (without extension) */
  filename?: string;
}

interface UseExportReturn {
  status: ExportStatus;
  error: string | null;
  exportAs: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
}

/**
 * Convenience hook for exporting ID card to PNG / PDF.
 *
 * Usage:
 *   const { exportAs, isExporting, status } = useExport({
 *     frontElementId: 'card-front',
 *     backElementId: 'card-back',
 *     filename: 'ST-2024-001',
 *   });
 *
 *   <button onClick={() => exportAs('pdf')} disabled={isExporting}>
 *     {isExporting ? 'Generating…' : 'Export PDF'}
 *   </button>
 */
export function useExport({ frontElementId, backElementId, filename = 'id-card' }: UseExportOptions): UseExportReturn {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const exportAs = useCallback(async (format: ExportFormat) => {
    setStatus('capturing');
    setError(null);

    try {
      switch (format) {
        case 'png-front':
          setStatus('generating');
          await exportToPNG(frontElementId, `${filename}_front`);
          break;

        case 'png-back':
          setStatus('generating');
          await exportToPNG(backElementId, `${filename}_back`);
          break;

        case 'pdf':
          setStatus('generating');
          await exportToPDF(frontElementId, backElementId, filename);
          break;

        case 'pdf-batch':
          // Batch mode: caller must render all cards and pass their IDs
          // This is a placeholder — batch export is triggered externally
          console.warn('pdf-batch: use exportBatchToPDF from export-engine directly');
          break;
      }

      setStatus('done');
      // Reset to idle after 2s
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Export failed';
      setError(msg);
      setStatus('error');
      console.error('[useExport]', err);
    }
  }, [frontElementId, backElementId, filename]);

  return {
    status,
    error,
    exportAs,
    isExporting: status === 'capturing' || status === 'generating',
  };
}

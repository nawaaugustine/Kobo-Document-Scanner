import { ScanResult } from '../services/blink-id-scanning.service';

export type TranslateFn = (key: string) => string;

/**
 * Formats an array of ScanResult into a human-readable string using the provided translate function.
 */
export function formatScanResults(results: ScanResult[], translate: TranslateFn): string {
  if (!results || results.length === 0) return '';

  const formatted = results.map((result) => {
    const { frontData, backData } = result;
    const lines: string[] = [];

    lines.push(`${translate('results.fullName')}: ${frontData.fullName || ''}`);
    lines.push(`${translate('results.dateOfBirth')}: ${frontData.dateOfBirth || ''}`);
    lines.push(`${translate('results.documentNumber')}: ${frontData.documentNumber || ''}`);
    lines.push(`${translate('results.fathersName')}: ${frontData.fathersName || ''}`);
    lines.push(`${translate('results.address')}: ${frontData.address || ''}`);
    lines.push(`${translate('results.sex')}: ${frontData.sex || ''}`);
    lines.push(`${translate('results.dateOfIssue')}: ${backData?.dateOfIssue || ''}`);
    lines.push(`${translate('results.documentAdditionalNumber')}: ${backData?.documentAdditionalNumber || ''}`);
    lines.push(`${translate('results.dateOfExpiry')}: ${backData?.dateOfExpiry || ''}`);

    return lines.join('\n');
  });

  return formatted.join('\n\n');
}

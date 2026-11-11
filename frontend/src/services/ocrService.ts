import Tesseract from 'tesseract.js';

export interface OcrDetectionResult {
  productName: string | null;
  mfdDate: string | null; // YYYY-MM-DD format
  expiryDate: string | null; // YYYY-MM-DD format
  rawText: string;
  detectedLines: string[];
  confidence: 'high' | 'medium' | 'low' | 'none';
  mfdConfidence: boolean;
  expConfidence: boolean;
  notes?: string;
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Normalize 2-digit year to 4-digit year.
 */
function normalizeYear(yearStr: string): number {
  const y = parseInt(yearStr, 10);
  if (isNaN(y)) return new Date().getFullYear();
  if (y < 100) {
    // 2000-2070 or 1970-1999
    return y < 70 ? 2000 + y : 1900 + y;
  }
  return y;
}

/**
 * Format a Date object to YYYY-MM-DD string.
 */
function formatDateToIso(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1990 || year > 2060) {
    return null;
  }
  const yStr = year.toString().padStart(4, '0');
  const mStr = month.toString().padStart(2, '0');
  const dStr = day.toString().padStart(2, '0');
  return `${yStr}-${mStr}-${dStr}`;
}

/**
 * Parse date strings in various formats:
 * - DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY
 * - YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
 * - DD/MM/YY, DD.MM.YY, DD-MM-YY
 * - DD MMM YYYY, DD MMM YY (e.g. 15 OCT 2026, 01-JAN-26)
 * - MMM YYYY, MM/YYYY, MM/YY (end of month)
 */
export function extractDateFromString(text: string): { iso: string; raw: string } | null {
  if (!text) return null;

  // Clean OCR noise: replace common misreads in date contexts (e.g. 'O'/'o' for '0', 'I'/'l' for '1')
  const cleaned = text
    .replace(/\bO(?=\d)/gi, '0')
    .replace(/(?<=\d)O\b/gi, '0')
    .replace(/(?<=\d)[I|l](?=\d)/gi, '1')
    .trim();

  // Pattern 1: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = cleaned.match(/\b([0-3]?\d)[\/\.\-\:]([0-1]?\d)[\/\.\-\:](20\d\d|\d\d)\b/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10);
    const year = normalizeYear(dmyMatch[3]);
    const iso = formatDateToIso(year, month, day);
    if (iso) return { iso, raw: dmyMatch[0] };
  }

  // Pattern 2: YYYY/MM/DD or YYYY-MM-DD or YYYY.MM.DD
  const ymdMatch = cleaned.match(/\b(20\d\d)[\/\.\-\:]([0-1]?\d)[\/\.\-\:]([0-3]?\d)\b/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    const iso = formatDateToIso(year, month, day);
    if (iso) return { iso, raw: ymdMatch[0] };
  }

  // Pattern 3: DD MMM YYYY or DD-MMM-YYYY or DD MMM YY (e.g., "15 OCT 2026", "1-OCT-26", "15OCT2026")
  const namedMonthMatch = cleaned.match(
    /\b([0-3]?\d)[\s\.\-]*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s\.\-]*(20\d\d|\d\d)\b/i
  );
  if (namedMonthMatch) {
    const day = parseInt(namedMonthMatch[1], 10);
    const monthName = namedMonthMatch[2].toLowerCase();
    const month = MONTH_MAP[monthName];
    const year = normalizeYear(namedMonthMatch[3]);
    if (month) {
      const iso = formatDateToIso(year, month, day);
      if (iso) return { iso, raw: namedMonthMatch[0] };
    }
  }

  // Pattern 4: MMM DD, YYYY or MMM YYYY (e.g., "OCT 15 2026" or "OCT 2026")
  const mmmDyMatch = cleaned.match(
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s\.\-]+([0-3]?\d)?[\s\.\,]+(20\d\d|\d\d)\b/i
  );
  if (mmmDyMatch) {
    const monthName = mmmDyMatch[1].toLowerCase();
    const month = MONTH_MAP[monthName];
    const day = mmmDyMatch[2] ? parseInt(mmmDyMatch[2], 10) : 28;
    const year = normalizeYear(mmmDyMatch[3]);
    if (month) {
      const iso = formatDateToIso(year, month, day);
      if (iso) return { iso, raw: mmmDyMatch[0] };
    }
  }

  // Pattern 5: MM/YYYY or MM/YY (e.g., "10/2026", "10/26", "10-2026")
  const myMatch = cleaned.match(/\b([0-1]?\d)[\/\.\-](20\d\d|\d\d)\b/);
  if (myMatch) {
    const month = parseInt(myMatch[1], 10);
    const year = normalizeYear(myMatch[2]);
    if (month >= 1 && month <= 12) {
      // Use last day of the month as default expiry for MM/YY format
      const lastDay = new Date(year, month, 0).getDate();
      const iso = formatDateToIso(year, month, lastDay);
      if (iso) return { iso, raw: myMatch[0] };
    }
  }

  return null;
}

/**
 * Filter out generic packaging text to extract a clean candidate food name.
 */
function extractCandidateProductName(lines: string[]): string | null {
  const ignorePatterns = [
    /\b(mfd|mfg|prod|packed|pkd|exp|expiry|use by|best before|bb|bbd|date)\b/i,
    /\b(batch|lot|b\.no|bno|mrp|rs|inr|usd|\$|net wt|weight|gross|contents)\b/i,
    /\b(ingredients|nutrition|facts|calories|serving|allergen|contains|keep|store)\b/i,
    /\b(refrigerated|freeze|cool|dry|place|vegetarian|non-veg|fssai|lic|iso)\b/i,
    /^\d+[\s\w\.\,\-\/]*$/, // mostly numbers
    /^[^\w\s]+$/, // only symbols
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 3 || trimmed.length > 50) continue;

    const shouldIgnore = ignorePatterns.some((p) => p.test(trimmed));
    if (!shouldIgnore) {
      // Clean up common OCR artifacts
      const cleanName = trimmed
        .replace(/[^a-zA-Z0-9\s\-\&]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanName.length >= 3) {
        return cleanName;
      }
    }
  }

  return null;
}

/**
 * Main parser that parses full OCR text and line segments into structured MFD / EXP / Name.
 */
export function parseOcrText(fullText: string): OcrDetectionResult {
  const lines = fullText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let mfdDate: string | null = null;
  let expiryDate: string | null = null;
  let mfdConfidence = false;
  let expConfidence = false;

  const mfdRegex = /\b(mfd|mfg|mfg\.|mfgd|mfg\s*date|mfd\s*date|date\s*of\s*mfg|pkd|packed|prod|prod\s*date|dom|m[\s\:\.\-])/i;
  const expRegex = /\b(exp|expiry|exp\.|expd|exp\s*date|use\s*by|use\s*before|best\s*before|best\s*by|bb|bbd|valid\s*till|ed|e[\s\:\.\-])/i;

  // 1. Line by line analysis looking for labeled markers
  for (const line of lines) {
    // Check EXP first
    if (expRegex.test(line)) {
      const parsed = extractDateFromString(line);
      if (parsed && !expiryDate) {
        expiryDate = parsed.iso;
        expConfidence = true;
      }
    }

    // Check MFD
    if (mfdRegex.test(line)) {
      const parsed = extractDateFromString(line);
      if (parsed && !mfdDate) {
        mfdDate = parsed.iso;
        mfdConfidence = true;
      }
    }
  }

  // 2. If one or both dates not found by labeled lines, scan all lines for dates
  if (!expiryDate || !mfdDate) {
    const allDetectedDates: { iso: string; lineIndex: number; line: string }[] = [];
    for (let i = 0; i < lines.length; i++) {
      const parsed = extractDateFromString(lines[i]);
      if (parsed) {
        allDetectedDates.push({ iso: parsed.iso, lineIndex: i, line: lines[i] });
      }
    }

    if (allDetectedDates.length >= 2) {
      // If we have at least 2 dates, sort them chronologically
      const sorted = [...allDetectedDates].sort((a, b) => a.iso.localeCompare(b.iso));
      if (!mfdDate) {
        mfdDate = sorted[0].iso;
      }
      if (!expiryDate) {
        expiryDate = sorted[sorted.length - 1].iso;
      }
    } else if (allDetectedDates.length === 1) {
      // Single date found: if not labeled as MFD, assign to expiryDate
      const single = allDetectedDates[0];
      if (!expiryDate && !mfdRegex.test(single.line)) {
        expiryDate = single.iso;
      } else if (!mfdDate && mfdRegex.test(single.line)) {
        mfdDate = single.iso;
      }
    }
  }

  // 3. Extract candidate product name
  const candidateName = extractCandidateProductName(lines);

  // 4. Calculate overall confidence
  let confidence: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (expConfidence && mfdConfidence) {
    confidence = 'high';
  } else if (expConfidence || expiryDate) {
    confidence = 'medium';
  } else if (mfdDate || candidateName) {
    confidence = 'low';
  }

  return {
    productName: candidateName,
    mfdDate,
    expiryDate,
    rawText: fullText,
    detectedLines: lines,
    confidence,
    mfdConfidence,
    expConfidence,
    notes: undefined,
  };
}

/**
 * Preprocess image on an offscreen canvas to optimize OCR contrast and readability.
 */
export function preprocessCanvasForOcr(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const targetCanvas = document.createElement('canvas');
  targetCanvas.width = width;
  targetCanvas.height = height;
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0, width, height);

  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Grayscale and dynamic contrast stretch
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Luminance formula
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;

      // High contrast thresholding / sigmoid curve for inkjet printed numbers
      const contrast = 1.3;
      const factor = (259 * (contrast * 100 + 255)) / (255 * (259 - contrast * 100));
      const adjusted = Math.min(255, Math.max(0, factor * (gray - 128) + 128));

      data[i] = adjusted;
      data[i + 1] = adjusted;
      data[i + 2] = adjusted;
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (e) {
    console.warn('Canvas pixel processing skipped (CORS/taint)', e);
  }

  return targetCanvas;
}

/**
 * Run OCR recognition on an image source (canvas, image element, or Blob/File) using Tesseract.js.
 */
export async function scanImageWithOcr(
  imageSource: HTMLCanvasElement | HTMLImageElement | File | Blob | string,
  onProgress?: (progress: number, status: string) => void
): Promise<OcrDetectionResult> {
  let sourceToProcess = imageSource;

  // If canvas, apply contrast preprocessing
  if (imageSource instanceof HTMLCanvasElement) {
    sourceToProcess = preprocessCanvasForOcr(imageSource);
  }

  if (onProgress) {
    onProgress(0.2, 'Initializing OCR date engine...');
  }

  const result = await Tesseract.recognize(sourceToProcess, 'eng', {
    logger: (m) => {
      if (onProgress && m.status === 'recognizing text') {
        onProgress(m.progress, 'Scanning product packaging for MFD / EXP dates...');
      }
    },
  });

  if (onProgress) {
    onProgress(1.0, 'Analyzing detected text...');
  }

  const text = result.data.text || '';
  return parseOcrText(text);
}

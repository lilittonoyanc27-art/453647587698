import { Difficulty } from './types';

const UNITS = [
  '',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
];

const SPECIAL_10_29: Record<number, string> = {
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve',
};

const TENS: Record<number, string> = {
  3: 'treinta',
  4: 'cuarenta',
  5: 'cincuenta',
  6: 'sesenta',
  7: 'setenta',
  8: 'ochenta',
  9: 'noventa',
};

const HUNDREDS: Record<number, string> = {
  1: 'ciento',
  2: 'doscientos',
  3: 'trescientos',
  4: 'cuatrocientos',
  5: 'quinientos',
  6: 'seiscientos',
  7: 'setecientos',
  8: 'ochocientos',
  9: 'novecientos',
};

function convertUnderThousand(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cien';

  const parts: string[] = [];
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;

  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds]);
  }

  if (rem > 0) {
    if (rem < 10) {
      parts.push(UNITS[rem]);
    } else if (rem >= 10 && rem <= 29) {
      parts.push(SPECIAL_10_29[rem]);
    } else {
      const tens = Math.floor(rem / 10);
      const unit = rem % 10;
      if (unit === 0) {
        parts.push(TENS[tens]);
      } else {
        parts.push(`${TENS[tens]} y ${UNITS[unit]}`);
      }
    }
  }

  return parts.join(' ');
}

/**
 * Converts an integer in [1, 10000] into natural Spanish words (capitalized first letter).
 */
export function numberToSpanish(raw: number): string {
  const n = Math.max(1, Math.min(10000, Math.floor(raw)));
  if (n === 10000) return 'Diez mil';

  const thousands = Math.floor(n / 1000);
  const rem = n % 1000;

  let result = '';
  if (thousands === 0) {
    result = convertUnderThousand(rem);
  } else if (thousands === 1) {
    result = rem > 0 ? `mil ${convertUnderThousand(rem)}` : 'mil';
  } else {
    const thousandsText = UNITS[thousands];
    result = rem > 0 ? `${thousandsText} mil ${convertUnderThousand(rem)}` : `${thousandsText} mil`;
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Formats an integer with Spanish dot thousands separator (e.g. 1450 -> 1.450, 10000 -> 10.000).
 */
export function formatSpanishNumber(n: number): string {
  const clamped = Math.max(1, Math.min(10000, Math.floor(n)));
  return clamped.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function getNumberRangeForDifficulty(difficulty: Difficulty): { min: number; max: number } {
  switch (difficulty) {
    case Difficulty.Facil:
      return { min: 1, max: 100 };
    case Difficulty.Medio:
      return { min: 101, max: 1000 };
    case Difficulty.Dificil:
      return { min: 1001, max: 10000 };
  }
}

/**
 * Generates `count` unique random numbers strictly within [1, 10000] for the chosen difficulty.
 */
export function generateUniqueNumbers(
  difficulty: Difficulty,
  count: number,
  exclude: number[] = []
): number[] {
  const { min, max } = getNumberRangeForDifficulty(difficulty);
  const used = new Set<number>(exclude);
  const result: number[] = [];

  // Guard against exhausting tiny ranges (though all ranges >= 100 values)
  let attempts = 0;
  while (result.length < count && attempts < 2000) {
    attempts++;
    const candidate = Math.floor(Math.random() * (max - min + 1)) + min;
    if (candidate >= 1 && candidate <= 10000 && !used.has(candidate)) {
      used.add(candidate);
      result.push(candidate);
    }
  }

  return result;
}

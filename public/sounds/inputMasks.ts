// ARQUIVO: src/utils/inputMasks.ts

/**
 * Formata um número (ex: 5.24) para uma string com VÍRGULA para exibição (ex: "5,24")
 * Usado para placeholders.
 */
export function formatKmForDisplay(value: string | number | null): string {
  if (value === null || value === undefined || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
  if (isNaN(numValue)) return '';

  return numValue.toFixed(2).replace('.', ',');
}

/**
 * Formata segundos totais para uma string no formato MM:SS (ex: 90 -> "01:30")
 */
export function formatMinutesSecondsInput(totalSeconds: number | null | undefined): string {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds)) return '';

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Converte um valor de tempo mascarado (ex: "32:32") para segundos totais.
 */
export function getMinutesSecondsUnmaskedValue(maskedValue: string): number | null {
  if (!maskedValue || !maskedValue.includes(':')) return null;
  const parts = maskedValue.split(':');
  if (parts.length !== 2) return null;

  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);

  if (isNaN(minutes) || isNaN(seconds) || seconds < 0 || seconds >= 60 || minutes < 0) return null;

  return (minutes * 60) + seconds;
}

/**
 * Converte um valor de distância mascarado (ex: "22,22") para um número (22.22).
 */
export function getKmUnmaskedValue(maskedValue: string): number | null {
    if (!maskedValue) return null;
    // Remove o separador de milhar (.) e troca a vírgula do decimal por ponto
    const unmasked = maskedValue.replace(/\./g, '').replace(',', '.');
    const value = parseFloat(unmasked);
    return isNaN(value) ? null : value;
}
// ARQUIVO: src/utils/inputMasks.ts

// Formata um número para string com PONTO, para ser usado como `value` em IMask.Number
// Ex: 3.32 -> "3.32"
export const formatKmToIMaskNumber = (value: string | number | null): string => {
    if (value === null || value === undefined || value === '') return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(numValue)) return '';
  
    return numValue.toFixed(2); // Retorna com PONTO, o IMask vai usar o 'radix' para exibir vírgula
  };
  
  // Formata um número para string com VÍRGULA, para EXIBIÇÃO (placeholders, textos fora do input)
  // Ex: 3.32 -> "3,32"
  export const formatKmForDisplay = (value: string | number | null): string => {
    if (value === null || value === undefined || value === '') return '';
    const numValue = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;
    if (isNaN(numValue)) return '';
  
    const stringValue = numValue.toFixed(2).replace('.', ',');
    const parts = stringValue.split(',');
    if (parts[0] && parts[0].length > 1 && parts[0].startsWith('0') && parts[0] !== '0') {
      parts[0] = parseInt(parts[0], 10).toString(); // Remove zero à esquerda se não for só "0"
    }
    return `${parts[0]},${parts[1]}`;
  };
  
  // Formata segundos totais para string MM:SS
  export const formatMinutesSecondsInput = (value: string | number | null): string => {
    if (value === null || value === undefined || value === '') return '';
    const totalSeconds = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(totalSeconds)) return '';
  
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Retorna o valor numérico (com PONTO) da máscara de KM
  export const getKmUnmaskedValue = (maskedValue: string): number | null => {
    if (!maskedValue) return null;
    const unmasked = maskedValue.replace(',', '.'); // Garante que é ponto para parseFloat
    return parseFloat(unmasked);
  };
  
  // Retorna os segundos totais da máscara de tempo MM:SS
  export const getMinutesSecondsUnmaskedValue = (maskedValue: string): number | null => {
    if (!maskedValue) return null;
    const parts = maskedValue.split(':');
    if (parts.length !== 2) return null;
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (isNaN(minutes) || isNaN(seconds) || seconds < 0 || seconds >= 60 || minutes < 0) return null;
    return (minutes * 60) + seconds;
  };
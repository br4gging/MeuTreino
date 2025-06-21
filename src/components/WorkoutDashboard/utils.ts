export function formatTime(s: number, h = false): string {
  return h
    ? `${Math.floor(s / 3600).toString().padStart(2, '0')}:${Math.floor((s % 3600) / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
    : `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}

export function formatDateHeader(d: Date): string {
  return d.toDateString() === new Date().toDateString()
    ? 'HOJE'
    : d.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
}

export function formatDateSubheader(d: Date): string {
  const m = d.toLocaleDateString('pt-BR', { month: 'long' });
  return `${d.getDate()} de ${m.charAt(0).toUpperCase() + m.slice(1)}`;
} 
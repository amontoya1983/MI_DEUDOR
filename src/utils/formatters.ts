export function formatCurrency(amount: number, currency: string = 'BS'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (currency === 'BS' || currency === 'BOB') {
    return `Bs. ${new Intl.NumberFormat('es-BO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  }
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function maskDocumentNumber(doc: string): string {
  if (!doc || doc.length < 5) return doc;
  const visibleStart = doc.slice(0, 3);
  const visibleEnd = doc.slice(-2);
  const masked = '*'.repeat(Math.max(doc.length - 5, 3));
  return `${visibleStart}${masked}${visibleEnd}`;
}

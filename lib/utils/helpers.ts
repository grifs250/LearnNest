// Pārbaudām, vai eksistē "formatClerkId" funkcija, un ja nē, pievienojam to
export function formatClerkId(clerkId: string): string {
  // Attīrām no nevajadzīgajiem simboliem un pārliecināmies, ka garums ir tieši 32 simboli
  const cleanId = clerkId.replace(/[^a-zA-Z0-9]/g, '');
  // Papildinām vai saīsinām līdz tieši 32 simboliem
  return cleanId.padEnd(32, '0').slice(0, 32);
}

// Pievienojam formatēšanas funkcijas datumiem ar Latvijas lokalizāciju
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('lv-LV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Cenas formatēšana
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return 'Cena nav norādīta';
  return `${amount.toFixed(2)} €`;
} 
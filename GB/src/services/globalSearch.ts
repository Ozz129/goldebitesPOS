export interface GlobalSearchResult {
  id: string;
  title: string;
  subtitle: string;
  group: string;
  path: string;
}

type SearchProvider = () => GlobalSearchResult[];

const providers: SearchProvider[] = [];

/** Permite que cada feature registre sus propios registros buscables (pedidos, productos, clientes, etc.). */
export function registerSearchProvider(provider: SearchProvider): void {
  providers.push(provider);
}

export function searchGlobal(query: string): GlobalSearchResult[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const all = providers.flatMap((provider) => provider());
  return all
    .filter(
      (item) =>
        item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q),
    )
    .slice(0, 8);
}

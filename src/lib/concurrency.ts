/** Jumlah request yang boleh jalan bersamaan saat operasi massal. */
export const REQUEST_CONCURRENCY = 5;

/**
 * Jalankan sekumpulan request dengan batas konkurensi.
 *
 * Menggantikan pola `for (const x of items) { await fetch(...) }` yang
 * membuat N request berantai — impor 50 baris CSV berarti 50 round-trip
 * berurutan. Sekarang maksimal `limit` request jalan bersamaan.
 *
 * Limitnya sengaja tidak tak-terbatas: connection pool MySQL di server hanya
 * 5–10 koneksi, jadi membanjirinya justru memperlambat.
 *
 * Urutan hasil mengikuti urutan `items`.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await task(items[index]);
    }
  });

  await Promise.all(workers);
  return results;
}

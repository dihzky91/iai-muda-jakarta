import type { Generation, Member } from '@/src/types';
import { DEFAULT_DIVISIONS } from '@/src/constants/defaults';

/**
 * Parsing CSV pendaftaran pengurus.
 *
 * Dipisah dari MembersManager karena bagian ini murni transformasi teks →
 * data: tidak menyentuh state React maupun jaringan, jadi bisa dibaca dan
 * diuji sendiri. Sebelumnya tercampur di dalam `handleCsvImport` bersama
 * pemanggilan API dan pembaruan state.
 */

const TEMPLATE_HEADERS = 'Nama,Jabatan,Divisi,Universitas,Email,Foto,LinkedIn,Generasi';
const TEMPLATE_EXAMPLE_ROW =
  'Budi Santoso,Kepala Bidang Humas,Bidang Hubungan Masyarakat,Universitas Indonesia,budi@iai-dki.or.id,https://images.unsplash.com/photo-1535713875002-d1d0cf377fde,https://linkedin.com/in/budi,Generasi ke-2';

export const CSV_TEMPLATE = `${TEMPLATE_HEADERS}\n${TEMPLATE_EXAMPLE_ROW}\n`;

/** Anggota hasil parsing, belum punya id karena belum tersimpan. */
export type ImportedMember = Omit<Member, 'id'>;

export interface ParseResult {
  members: ImportedMember[];
  /** Pesan siap tampil; null kalau parsing berhasil. */
  error: string | null;
}

/**
 * Pecah satu baris CSV jadi kolom.
 *
 * Tanda kutip tunggal maupun ganda dianggap pembungkus, karena data sering
 * ditempel langsung dari Excel yang memakai keduanya.
 */
export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/** Kolom yang dikenali, dicocokkan longgar terhadap nama header. */
type FieldKey = 'name' | 'position' | 'division' | 'university' | 'email' | 'imageUrl' | 'linkedinUrl' | 'generation';

const HEADER_MATCHERS: Array<[FieldKey, (header: string) => boolean]> = [
  ['name', h => h.includes('nama')],
  ['position', h => h.includes('jabatan')],
  ['division', h => h.includes('divisi')],
  ['university', h => h.includes('universitas') || h.includes('kampus')],
  ['email', h => h.includes('email')],
  ['imageUrl', h => h.includes('foto') || h.includes('image')],
  ['linkedinUrl', h => h.includes('linkedin')],
  ['generation', h => h.includes('generasi')],
];

/** Urutan kolom yang diasumsikan kalau header tidak cocok apa pun. */
const POSITIONAL_FIELDS: FieldKey[] = [
  'name', 'position', 'division', 'university', 'email', 'imageUrl', 'linkedinUrl', 'generation',
];

function readRow(headers: string[], values: string[]): Partial<Record<FieldKey, string>> {
  const row: Partial<Record<FieldKey, string>> = {};

  headers.forEach((header, idx) => {
    const value = values[idx] || '';
    const matched = HEADER_MATCHERS.find(([, test]) => test(header));
    const key = matched ? matched[0] : POSITIONAL_FIELDS[idx];
    if (key) row[key] = value;
  });

  return row;
}

/** Cocokkan divisi secara longgar; jatuh ke divisi pertama kalau tidak ketemu. */
function matchDivision(raw: string | undefined, allowed: string[]): string {
  const needle = (raw || '').toLowerCase();
  const found = allowed.find(
    d => d.toLowerCase().includes(needle) || needle.includes(d.toLowerCase())
  );
  return found || allowed[0] || DEFAULT_DIVISIONS[0];
}

/** Cocokkan nama generasi secara longgar; jatuh ke generasi aktif. */
function matchGenerationId(
  raw: string | undefined,
  generations: Generation[],
  activeGen?: Generation
): number | '' {
  if (raw) {
    const needle = raw.toLowerCase();
    const matched = generations.find(
      g => g.name.toLowerCase().includes(needle) || needle.includes(g.name.toLowerCase())
    );
    if (matched) return matched.id;
  }
  return activeGen?.id || generations[0]?.id || '';
}

export interface ParseOptions {
  divisionList: string[];
  generations: Generation[];
  activeGen?: Generation;
}

/**
 * Ubah teks CSV jadi daftar anggota siap kirim.
 *
 * Baris tanpa nama atau tanpa jabatan dilewati diam-diam — itu memang niatnya,
 * karena tempelan dari Excel kerap membawa baris kosong di bagian bawah.
 */
export function parseMembersCsv(text: string, options: ParseOptions): ParseResult {
  if (!text.trim()) {
    return { members: [], error: 'Data teks CSV masih kosong.' };
  }

  const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) {
    return {
      members: [],
      error: 'CSV harus berisi minimal satu baris tajuk (headers) dan satu baris data.',
    };
  }

  const allowedDivisions = options.divisionList.length > 0 ? options.divisionList : DEFAULT_DIVISIONS;
  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
  const members: ImportedMember[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length < 2) continue;

    const row = readRow(headers, values);
    if (!row.name || !row.position) continue;

    members.push({
      name: row.name,
      position: row.position,
      division: matchDivision(row.division, allowedDivisions),
      university: row.university || '',
      generationId: matchGenerationId(row.generation, options.generations, options.activeGen) as number,
      email: row.email || '',
      imageUrl: row.imageUrl || '',
      linkedinUrl: row.linkedinUrl || '',
    });
  }

  if (members.length === 0) {
    return {
      members: [],
      error: 'Gagal mengimpor. Pastikan header kolom sesuai dan data valid.',
    };
  }

  return { members, error: null };
}

/** Picu unduhan template CSV di browser. */
export function downloadCsvTemplate(): void {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'template_pendaftaran_pengurus.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

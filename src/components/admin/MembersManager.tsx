'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, Sparkles, History, Plus, Trash2, FileSpreadsheet, Download, Upload,
  AlertCircle, Check, ChevronRight, ChevronLeft, UserPlus,
} from 'lucide-react';
import { Member, Generation } from '@/src/types';
import { useToast } from '@/src/hooks/useToast';
import { useConfirm } from '@/src/hooks/useConfirm';
import { useDebounce } from '@/src/hooks/useDebounce';
import { useAuth } from '@/src/context/AuthContext';
import { useFormDraft } from '@/src/hooks/useFormDraft';
import PageHeader from './PageHeader';
import ListContainer from './ListContainer';
import SearchFilterBar from './SearchFilterBar';
import EmptyState from './EmptyState';
import Drawer from './Drawer';
import ImageUploader from '../ImageUploader';
import Toast from './Toast';
import ConfirmDialog from './ConfirmDialog';
import SkeletonCard from './SkeletonCard';
import MemberCard from './MemberCard';
import Stepper from './Stepper';
import CreateAccountDialog from './CreateAccountDialog';

interface MembersManagerProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  generations: Generation[];
  divisionList: string[];
  activeGen?: Generation;
}

interface MemberAccountInfo {
  memberId: number;
  accountId: number | null;
  isActive: boolean;
}

interface HistoryEntry {
  generationId: number | '';
  position: string;
  division: string;
}

interface MemberForm {
  name: string;
  position: string;
  division: string;
  university: string;
  generationId: number | '';
  email: string;
  imageUrl: string;
  linkedinUrl: string;
}

const STEPS = [
  { key: 'basic', label: 'Informasi Dasar', description: 'Nama & Jabatan' },
  { key: 'contact', label: 'Kontak & Foto', description: 'Email & Foto' },
  { key: 'history', label: 'Riwayat Generasi', description: 'Periode Sebelumnya' },
];

const emptyForm: MemberForm = {
  name: '',
  position: '',
  division: '',
  university: '',
  generationId: '' as number | '',
  email: '',
  imageUrl: '',
  linkedinUrl: '',
};

const DRAFT_KEY = 'member-form-draft';

function validateEmail(value: string): string | null {
  if (!value) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Format email tidak valid.';
}

function validateUrl(value: string): string | null {
  if (!value) return null;
  try {
    new URL(value);
    return null;
  } catch {
    return 'Format tautan tidak valid (contoh: https://linkedin.com/in/...).';
  }
}

/** Jumlah request yang boleh jalan bersamaan saat operasi massal. */
const REQUEST_CONCURRENCY = 5;

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
async function runWithConcurrency<T, R>(
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

export default function MembersManager({ members, setMembers, generations, divisionList, activeGen }: MembersManagerProps) {
  const { toasts, triggerToast, removeToast } = useToast();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);
  const [selectedGenFilter, setSelectedGenFilter] = useState<number | 'all'>('all');

  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);
  const [previousHistory, setPreviousHistory] = useState<HistoryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [step, setStep] = useState(0);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const [showImportCsv, setShowImportCsv] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);

  // Member Accounts state
  const [memberAccounts, setMemberAccounts] = useState<Map<number, MemberAccountInfo>>(new Map());
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [selectedMemberForAccount, setSelectedMemberForAccount] = useState<Member | null>(null);

  // Load member accounts
  useEffect(() => {
    const loadAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await fetch('/api/admin/member-accounts', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const accountsMap = new Map<number, MemberAccountInfo>();
            data.data.forEach((item: any) => {
              accountsMap.set(item.id, {
                memberId: item.id,
                accountId: item.accountId,
                isActive: item.accountIsActive || false,
              });
            });
            setMemberAccounts(accountsMap);
          }
        }
      } catch (err) {
        console.error('Failed to load member accounts:', err);
      } finally {
        setLoadingAccounts(false);
      }
    };
    loadAccounts();
  }, []);

  // Simulate initial loading state for skeleton demo
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (selectedGenFilter !== 'all' && m.generationId !== selectedGenFilter) return false;
      if (!debouncedSearch.trim()) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        m.name.toLowerCase().includes(term) ||
        m.position.toLowerCase().includes(term) ||
        (m.division || '').toLowerCase().includes(term) ||
        (m.email && m.email.toLowerCase().includes(term))
      );
    });
  }, [members, debouncedSearch, selectedGenFilter]);

  const allFilteredSelected = filteredMembers.length > 0 && filteredMembers.every(m => selectedIds.has(m.id));

  const validateField = (key: keyof MemberForm, value: string | number): string | null => {
    if (key === 'name') {
      if (!value || String(value).trim().length === 0) return 'Nama lengkap wajib diisi.';
      if (String(value).trim().length < 3) return 'Nama minimal 3 karakter.';
    }
    if (key === 'position') {
      if (!value || String(value).trim().length === 0) return 'Jabatan wajib diisi.';
    }
    if (key === 'division') {
      if (!value || String(value).trim().length === 0) return 'Divisi wajib diisi.';
    }
    if (key === 'email') return validateEmail(String(value));
    if (key === 'linkedinUrl') return validateUrl(String(value));
    if (key === 'generationId') {
      if (value === '' || value === 0) return 'Pilih periode generasi.';
    }
    return null;
  };

  const validateStep = (targetStep = step): boolean => {
    const stepFields: Record<number, (keyof MemberForm)[]> = {
      0: ['name', 'position', 'division'],
      1: ['email', 'linkedinUrl', 'generationId'],
      2: [],
    };
    const fields = stepFields[targetStep] || [];
    const nextErrors: Record<string, string | null> = {};
    const nextTouched: Record<string, boolean> = {};
    let valid = true;
    for (const key of fields) {
      const err = validateField(key, form[key]);
      nextErrors[key] = err;
      nextTouched[key] = true;
      if (err) valid = false;
    }
    setErrors(prev => ({ ...prev, ...nextErrors }));
    setTouched(prev => ({ ...prev, ...nextTouched }));
    return valid;
  };

  const setFormValue = (key: keyof MemberForm, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (touched[key]) {
      setErrors(prev => ({ ...prev, [key]: validateField(key, value) }));
    }
  };

  const handleBlur = (key: keyof MemberForm) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: validateField(key, form[key]) }));
  };

  const { clearDraft } = useFormDraft<MemberForm & { previousHistory: HistoryEntry[] }>({
    key: DRAFT_KEY,
    form: { ...form, previousHistory },
    isOpen: isDrawerOpen,
    isSubmitting: submitting,
    enabled: !editingMember,
    onRestore: (draft) => {
      setForm({
        name: draft.name || '',
        position: draft.position || '',
        division: draft.division || '',
        university: draft.university || '',
        generationId: draft.generationId || '',
        email: draft.email || '',
        imageUrl: draft.imageUrl || '',
        linkedinUrl: draft.linkedinUrl || '',
      });
      if (draft.previousHistory) setPreviousHistory(draft.previousHistory);
      triggerToast('Draft terakhir berhasil dimuat.', 'info');
    },
  });

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGenFilter('all');
  };

  const resetFormState = () => {
    setForm({ ...emptyForm, division: divisionList[0] || '' });
    setPreviousHistory([]);
    setStep(0);
    setIsStepTransitioning(false);
    setTouched({});
    setErrors({});
    setSubmitting(false);
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    resetFormState();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingMember(m);
    setForm({
      name: m.name,
      position: m.position,
      division: m.division || divisionList[0] || '',
      university: m.university || '',
      generationId: m.generationId,
      email: m.email || '',
      imageUrl: m.imageUrl || '',
      linkedinUrl: m.linkedinUrl || '',
    });
    const normalizedName = (m.name ?? '').trim().toLowerCase();
    const historyRecords = members.filter(
      rec => rec.id !== m.id && (rec.name ?? '').trim().toLowerCase() === normalizedName
    );
    setPreviousHistory(historyRecords.map(rec => ({
      generationId: rec.generationId,
      position: rec.position || '',
      division: rec.division || divisionList[0] || '',
    })));
    setStep(0);
    setTouched({});
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingMember(null);
    resetFormState();
  };

  const getDivisionListString = () => JSON.stringify(divisionList.length > 0 ? divisionList : ['Badan Pengurus Harian (BPH)','Bidang Edukasi & Sertifikasi','Bidang Hubungan Masyarakat','Bidang Kewirausahaan & Kemitraan','Bidang Media & Desain Kreatif']);

  const downloadCsvTemplate = () => {
    const headers = "Nama,Jabatan,Divisi,Universitas,Email,Foto,LinkedIn,Generasi\n";
    const rows = "Budi Santoso,Kepala Bidang Humas,Bidang Hubungan Masyarakat,Universitas Indonesia,budi@iai-dki.or.id,https://images.unsplash.com/photo-1535713875002-d1d0cf377fde,https://linkedin.com/in/budi,Generasi ke-2\n";
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_pendaftaran_pengurus.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvLine = (line: string) => {
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
  };

  const handleCsvImport = async (textToParse: string) => {
    setCsvError(null);
    if (!textToParse.trim()) {
      setCsvError("Data teks CSV masih kosong.");
      return;
    }

    const lines = textToParse.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
      setCsvError("CSV harus berisi minimal satu baris tajuk (headers) dan satu baris data.");
      return;
    }

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
    const importedMembers: Array<Omit<Member, 'id'>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCsvLine(lines[i]);
      if (values.length < 2) continue;

      const rowData: any = {};
      headers.forEach((header, idx) => {
        const val = values[idx] || '';
        if (header.includes('nama')) rowData.name = val;
        else if (header.includes('jabatan')) rowData.position = val;
        else if (header.includes('divisi')) rowData.division = val;
        else if (header.includes('universitas') || header.includes('kampus')) rowData.university = val;
        else if (header.includes('email')) rowData.email = val;
        else if (header.includes('foto') || header.includes('image')) rowData.imageUrl = val;
        else if (header.includes('linkedin')) rowData.linkedinUrl = val;
        else if (header.includes('generasi')) rowData.generation = val;
        else if (idx === 0) rowData.name = val;
        else if (idx === 1) rowData.position = val;
        else if (idx === 2) rowData.division = val;
        else if (idx === 3) rowData.university = val;
        else if (idx === 4) rowData.email = val;
        else if (idx === 5) rowData.imageUrl = val;
        else if (idx === 6) rowData.linkedinUrl = val;
        else if (idx === 7) rowData.generation = val;
      });

      if (!rowData.name || !rowData.position) continue;

      const allowedDivisions = divisionList.length > 0 ? divisionList : JSON.parse(getDivisionListString());
      let divisionMatched = allowedDivisions.find((d: string) =>
        d.toLowerCase().includes((rowData.division || '').toLowerCase()) ||
        (rowData.division || '').toLowerCase().includes(d.toLowerCase())
      );
      if (!divisionMatched) divisionMatched = allowedDivisions[0] || 'Badan Pengurus Harian (BPH)';

      let matchedGenId: number | '' = '';
      if (rowData.generation) {
        const matchedGen = generations.find(g =>
          g.name.toLowerCase().includes(rowData.generation.toLowerCase()) ||
          rowData.generation.toLowerCase().includes(g.name.toLowerCase())
        );
        if (matchedGen) matchedGenId = matchedGen.id;
      }
      if (matchedGenId === '') matchedGenId = activeGen?.id || generations[0]?.id || '';

      importedMembers.push({
        name: rowData.name,
        position: rowData.position,
        division: divisionMatched,
        university: rowData.university || '',
        generationId: matchedGenId as number,
        email: rowData.email || '',
        imageUrl: rowData.imageUrl || '',
        linkedinUrl: rowData.linkedinUrl || '',
      });
    }

    if (importedMembers.length === 0) {
      setCsvError("Gagal mengimpor. Pastikan header kolom sesuai dan data valid.");
      return;
    }

    setIsLoading(true);
    const importResults = await runWithConcurrency(importedMembers, REQUEST_CONCURRENCY, async (m) => {
      try {
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: m.name,
            division: m.division,
            university: m.university || null,
            generationId: m.generationId || undefined,
            email: m.email || null,
            imageUrl: m.imageUrl || null,
            linkedinUrl: m.linkedinUrl || null,
          }),
        });
        const result = await res.json();
        return result.success === true;
      } catch {
        return false;
      }
    });
    const successCount = importResults.filter(Boolean).length;

    const listRes = await fetch('/api/members');
    const listResult = await listRes.json();
    if (listResult.success) {
      setMembers(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
    }
    setIsLoading(false);

    triggerToast(`Berhasil mengimpor ${successCount} pengurus baru!`);
    setCsvText('');
    setCsvError(null);
    setShowImportCsv(false);
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleCsvImport(text);
    };
    reader.onerror = () => setCsvError("Gagal membaca file.");
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard: hanya boleh submit di step terakhir
    if (step !== STEPS.length - 1) {
      nextStep();
      return;
    }
    if (!validateStep(step)) return;

    setSubmitting(true);

    const genId = form.generationId || activeGen?.id || generations[0]?.id;
    if (!genId) {
      triggerToast('Tidak ada generasi aktif yang dipilih.', 'error');
      setSubmitting(false);
      return;
    }

    try {
      if (editingMember) {
        const res = await fetch(`/api/members/${editingMember.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, generationId: genId }),
        });
        const result = await res.json();
        if (result.success) {
          const normalizedName = form.name.trim().toLowerCase();
          const existingHistoryRecords = members.filter(
            m => m.id !== editingMember.id && (m.name ?? '').trim().toLowerCase() === normalizedName
          );
          // Hapus dulu semua record riwayat lama, baru buat yang baru.
          // Dua fase ini harus tetap berurutan satu sama lain, tapi di dalam
          // tiap fase request boleh jalan paralel.
          await runWithConcurrency(existingHistoryRecords, REQUEST_CONCURRENCY, (oldRec) =>
            fetch(`/api/members/${oldRec.id}`, { method: 'DELETE' })
          );

          const historyToCreate = previousHistory.filter(h => h.generationId && h.position);
          await runWithConcurrency(historyToCreate, REQUEST_CONCURRENCY, (hist) =>
            fetch('/api/members', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: form.name,
                position: hist.position,
                division: hist.division || divisionList[0] || '',
                generationId: hist.generationId,
                university: form.university || null,
                email: form.email || null,
                imageUrl: form.imageUrl || null,
                linkedinUrl: form.linkedinUrl || null,
              }),
            })
          );

          const listRes = await fetch('/api/members');
          const listResult = await listRes.json();
          if (listResult.success) {
            setMembers(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
          }
          clearDraft();
          triggerToast('Data pengurus berhasil diperbarui!');
          handleCloseDrawer();
        } else {
          triggerToast(`Gagal memperbarui: ${result.message}`, 'error');
        }
      } else {
        const res = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, generationId: genId }),
        });
        const result = await res.json();
        if (!result.success) {
          triggerToast(`Gagal mendaftarkan: ${result.message}`, 'error');
          setSubmitting(false);
          return;
        }

        const historyToCreate = previousHistory.filter(h => h.generationId && h.position);
        const histResults = await runWithConcurrency(historyToCreate, REQUEST_CONCURRENCY, async (hist) => {
          const histRes = await fetch('/api/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: form.name,
              position: hist.position,
              division: hist.division || divisionList[0] || '',
              generationId: hist.generationId,
              university: form.university || null,
              email: form.email || null,
              imageUrl: form.imageUrl || null,
              linkedinUrl: form.linkedinUrl || null,
            }),
          });
          const histResult = await histRes.json();
          return histResult.success === true;
        });
        const histCount = histResults.filter(Boolean).length;

        const listRes = await fetch('/api/members');
        const listResult = await listRes.json();
        if (listResult.success) {
          setMembers(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
        }
        clearDraft();
        const histMsg = histCount > 0 ? ` + ${histCount} riwayat historis` : '';
        triggerToast(`Pengurus baru berhasil didaftarkan${histMsg}!`);
        handleCloseDrawer();
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan saat menyimpan pengurus.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (m: Member) => {
    const confirmed = await confirm({
      title: 'Hapus Pengurus',
      message: `Apakah Anda yakin ingin menghapus pengurus "${m.name}" dari komite? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus',
      variant: 'danger',
      preview: (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
          {m.imageUrl ? (
            <img src={m.imageUrl} alt={m.name} className="h-14 w-14 rounded-xl object-cover bg-slate-100" referrerPolicy="no-referrer" />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
              <Users className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{m.name}</p>
            <p className="text-xs text-slate-500">{m.position}</p>
            {m.division && <p className="text-[10px] text-slate-400 truncate">{m.division}</p>}
          </div>
        </div>
      ),
    });
    if (!confirmed) return;

    const res = await fetch(`/api/members/${m.id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      setMembers(prev => prev.filter(item => item.id !== m.id));
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(m.id);
        return next;
      });
      triggerToast('Anggota komite berhasil dihapus.');
    } else {
      triggerToast(`Gagal menghapus: ${result.message}`, 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const names = members
      .filter(m => selectedIds.has(m.id))
      .slice(0, 3)
      .map(m => m.name)
      .join(', ');

    const confirmed = await confirm({
      title: 'Hapus Massal Pengurus',
      message: `Anda akan menghapus ${selectedIds.size} pengurus terpilih (${names}${selectedIds.size > 3 ? ', ...' : ''}). Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Terpilih',
      variant: 'danger',
    });
    if (!confirmed) return;

    setIsLoading(true);
    const deleteResults = await runWithConcurrency([...selectedIds], REQUEST_CONCURRENCY, async (id) => {
      try {
        const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
        const result = await res.json();
        return result.success === true;
      } catch {
        return false;
      }
    });
    const successCount = deleteResults.filter(Boolean).length;

    const listRes = await fetch('/api/members');
    const listResult = await listRes.json();
    if (listResult.success) {
      setMembers(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
    }
    setSelectedIds(new Set());
    setIsLoading(false);
    triggerToast(`${successCount} pengurus terpilih berhasil dihapus.`);
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredMembers.forEach(m => next.delete(m.id));
        return next;
      });
    } else {
      setSelectedIds(prev => {
        const next = new Set(prev);
        filteredMembers.forEach(m => next.add(m.id));
        return next;
      });
    }
  };

  const toggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Handler untuk toggle visibility member
  const handleToggleVisibility = async (memberId: number, showPublic: boolean) => {
    try {
      const response = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ showPublic }),
      });

      const result = await response.json();
      if (result.success) {
        setMembers(prev => prev.map(m => m.id === memberId ? { ...m, showPublic } : m));
        triggerToast(showPublic ? 'Member ditampilkan di publik' : 'Member disembunyikan dari publik');
      } else {
        triggerToast(`Gagal: ${result.message}`, 'error');
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan', 'error');
    }
  };

  // Handler untuk create account
  const handleCreateAccount = (memberId: number) => {
    const member = members.find(m => m.id === memberId);
    if (member) {
      setSelectedMemberForAccount(member);
      setShowCreateAccount(true);
    }
  };

  // Handler untuk confirm create account
  const handleConfirmCreateAccount = async (password: string) => {
    if (!selectedMemberForAccount) return;

    const response = await fetch('/api/admin/member-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        memberId: selectedMemberForAccount.id,
        password,
      }),
    });

    const result = await response.json();
    if (result.success) {
      // Reload accounts
      const accountsRes = await fetch('/api/admin/member-accounts', {
        credentials: 'include',
      });
      if (accountsRes.ok) {
        const data = await accountsRes.json();
        if (data.success && data.data) {
          const accountsMap = new Map<number, MemberAccountInfo>();
          data.data.forEach((item: any) => {
            accountsMap.set(item.id, {
              memberId: item.id,
              accountId: item.accountId,
              isActive: item.accountIsActive || false,
            });
          });
          setMemberAccounts(accountsMap);
        }
      }
      triggerToast('Akun portal berhasil dibuat!');
    } else {
      throw new Error(result.message || 'Gagal membuat akun');
    }
  };

  // Handler untuk toggle account status
  const handleToggleAccountStatus = async (accountId: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/member-accounts/${accountId}`, {
        method: 'PUT',
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        setMemberAccounts(prev => {
          const next = new Map(prev);
          prev.forEach((info, memberId) => {
            if (info.accountId === accountId) {
              next.set(memberId, { ...info, isActive: result.isActive });
            }
          });
          return next;
        });
        triggerToast(result.message);
      } else {
        triggerToast(`Gagal: ${result.message}`, 'error');
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan', 'error');
    }
  };

  // Handler untuk delete account
  const handleDeleteAccount = async (accountId: number) => {
    try {
      const response = await fetch(`/api/admin/member-accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();
      if (result.success) {
        setMemberAccounts(prev => {
          const next = new Map(prev);
          prev.forEach((info, memberId) => {
            if (info.accountId === accountId) {
              next.set(memberId, { ...info, accountId: null, isActive: false });
            }
          });
          return next;
        });
        triggerToast('Akun portal berhasil dihapus');
      } else {
        triggerToast(`Gagal: ${result.message}`, 'error');
      }
    } catch (err) {
      triggerToast('Terjadi kesalahan', 'error');
    }
  };

  const nextStep = () => {
    if (isStepTransitioning) return;
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      setIsStepTransitioning(true);
      setStep(s => s + 1);
      // Beri jeda 300ms agar pointer event tidak tembus ke tombol submit
      setTimeout(() => setIsStepTransitioning(false), 300);
    }
  };

  const prevStep = () => {
    if (isStepTransitioning) return;
    if (step > 0) {
      setIsStepTransitioning(true);
      setStep(s => s - 1);
      setTimeout(() => setIsStepTransitioning(false), 300);
    }
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar</label>
            <input
              type="text"
              placeholder="Contoh: Budi Santoso, S.Ak., CA"
              value={form.name}
              onChange={(e) => setFormValue('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                touched.name && errors.name ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {touched.name && errors.name && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Jabatan Komite</label>
            <input
              type="text"
              placeholder="Contoh: Kepala Bidang Hubungan Masyarakat"
              value={form.position}
              onChange={(e) => setFormValue('position', e.target.value)}
              onBlur={() => handleBlur('position')}
              className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                touched.position && errors.position ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            {touched.position && errors.position && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.position}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Asal Universitas</label>
            <input
              type="text"
              placeholder="Contoh: Universitas Indonesia"
              value={form.university}
              onChange={(e) => setFormValue('university', e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Bidang / Divisi Kerja</label>
            <input
              type="text"
              list="member-division-list"
              placeholder="Ketik atau pilih nama bidang..."
              value={form.division}
              onChange={(e) => setFormValue('division', e.target.value)}
              onBlur={() => handleBlur('division')}
              className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                touched.division && errors.division ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            />
            <datalist id="member-division-list">
              {divisionList.map(div => <option key={div} value={div} />)}
            </datalist>
            {touched.division && errors.division && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.division}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (step === 1) {
      return (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Resmi</label>
              <input
                type="email"
                placeholder="nama@iai-dki.or.id"
                value={form.email}
                onChange={(e) => setFormValue('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                  touched.email && errors.email ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {touched.email && errors.email && (
                <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Tautan LinkedIn</label>
              <input
                type="text"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedinUrl}
                onChange={(e) => setFormValue('linkedinUrl', e.target.value)}
                onBlur={() => handleBlur('linkedinUrl')}
                className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                  touched.linkedinUrl && errors.linkedinUrl ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
                }`}
              />
              {touched.linkedinUrl && errors.linkedinUrl && (
                <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.linkedinUrl}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Periode Generasi</label>
            <select
              value={form.generationId}
              onChange={(e) => setFormValue('generationId', e.target.value ? parseInt(e.target.value) : '')}
              onBlur={() => handleBlur('generationId')}
              className={`w-full rounded-xl bg-slate-50 border px-4 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${
                touched.generationId && errors.generationId ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
              }`}
            >
              <option value="">-- Pilih Generasi --</option>
              {generations.map(g => (
                <option key={g.id} value={g.id}>{g.name} ({g.years}) {g.isActive ? '- Aktif' : ''}</option>
              ))}
            </select>
            {touched.generationId && errors.generationId && (
              <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> {errors.generationId}
              </p>
            )}
          </div>

          <ImageUploader
            label="Foto Profil"
            value={form.imageUrl || ''}
            onChange={(url) => setFormValue('imageUrl', url)}
            placeholder="https://images.unsplash.com/photo-..."
            helperText="Unggah pasfoto resmi pengurus atau tempel link gambar."
          />

          {/* Large preview */}
          {form.imageUrl && (
            <div className="rounded-2xl border border-slate-100 p-3 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pratinjau Foto Profil</span>
              <div className="flex justify-center">
                <img
                  src={form.imageUrl}
                  alt="Pratinjau profil"
                  className="h-40 w-40 rounded-2xl object-cover bg-slate-100 border border-slate-200 shadow-sm"
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-bold text-slate-700">Riwayat Generasi Sebelumnya</span>
            {previousHistory.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">{previousHistory.length} periode</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPreviousHistory(prev => [...prev, { generationId: '', position: '', division: divisionList[0] || '' }])}
            className="flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 px-2.5 py-1.5 text-[11px] font-bold transition-all cursor-pointer"
          >
            <Plus className="h-3 w-3" /> Tambah Riwayat
          </button>
        </div>

        {previousHistory.length === 0 && (
          <p className="text-[11px] text-slate-400 italic bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-2.5">
            Jika pengurus ini pernah menjabat di generasi sebelumnya, tambahkan riwayatnya di sini.
          </p>
        )}

        {previousHistory.map((hist, idx) => (
          <div key={idx} className="relative bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                <History className="h-3 w-3" /> Periode #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => setPreviousHistory(prev => prev.filter((_, i) => i !== idx))}
                className="p-1 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-amber-700">Generasi</label>
              <select
                value={String(hist.generationId)}
                onChange={e => setPreviousHistory(prev => prev.map((h, i) => i === idx ? { ...h, generationId: e.target.value === '' ? '' : Number(e.target.value) } : h))}
                className="w-full rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="">-- Pilih Generasi --</option>
                {generations.filter(g => g.id !== (form.generationId || activeGen?.id)).map(g => (
                  <option key={g.id} value={g.id}>{g.name} ({g.years})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-amber-700">Jabatan di Periode Tersebut</label>
              <input
                type="text"
                placeholder="Contoh: Staf Bidang Edukasi"
                value={hist.position}
                onChange={e => setPreviousHistory(prev => prev.map((h, i) => i === idx ? { ...h, position: e.target.value } : h))}
                className="w-full rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-amber-700">Bidang / Divisi</label>
              <select
                value={hist.division}
                onChange={e => setPreviousHistory(prev => prev.map((h, i) => i === idx ? { ...h, division: e.target.value } : h))}
                className="w-full rounded-lg bg-white border border-amber-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300/40 focus:border-amber-400 transition-all"
              >
                <option value="">-- Pilih Bidang / Divisi --</option>
                {divisionList.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Kepengurusan"
        description="Kelola keanggotaan aktif divisi kerja, pendaftaran struktur baru, dan tautan sosial media."
        breadcrumbs={[
          { label: 'Dashboard', href: '#' },
          { label: 'Kepengurusan' },
        ]}
        role={user?.role}
        username={user?.username}
      />

      <ListContainer
        title="Daftar Pengurus"
        subtitle={`Menampilkan ${filteredMembers.length} dari ${members.length} total pengurus`}
        addLabel="Tambah Pengurus"
        onAdd={handleOpenAdd}
        filter={
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  Registrasi Massal (CSV/Excel)
                </span>
                <button
                  type="button"
                  onClick={() => setShowImportCsv(!showImportCsv)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  {showImportCsv ? "Tutup" : "Buka Panel"}
                </button>
              </div>

              {showImportCsv && (
                <div className="space-y-3 pt-2 border-t border-slate-200 animate-fade-in">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={downloadCsvTemplate}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-[11px] py-2 font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh Template CSV
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[11px] py-2 font-bold transition-all cursor-pointer shadow-sm text-center">
                      <Upload className="h-3.5 w-3.5" />
                      Unggah File CSV
                      <input type="file" accept=".csv" onChange={handleCsvFileChange} className="hidden" />
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Atau tempel teks CSV / salinan baris Excel:</label>
                    <textarea
                      rows={3}
                      placeholder="Nama,Jabatan,Divisi,Universitas,Email,Foto,LinkedIn,Generasi&#10;Budi Santoso,Kepala Humas,Bidang Hubungan Masyarakat,budi@iai-dki.or.id,,,"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-[10px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>
                  {csvError && (
                    <p className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 leading-relaxed">{csvError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCsvImport(csvText)}
                    className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 font-bold transition-all cursor-pointer shadow-md"
                  >
                    Proses Impor Teks
                  </button>
                </div>
              )}
            </div>

            <SearchFilterBar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Cari nama pengurus, jabatan, atau divisi kerja..."
              filters={[
                {
                  key: 'generation',
                  label: 'Generasi',
                  value: String(selectedGenFilter),
                  onChange: (val) => setSelectedGenFilter(val === 'all' ? 'all' : Number(val)),
                  options: [
                    { value: 'all', label: 'Semua Generasi' },
                    ...generations.map(g => ({ value: String(g.id), label: `${g.name} ${g.isActive ? '(Aktif)' : ''}` })),
                  ],
                },
              ]}
              onReset={handleResetFilters}
            />
          </div>
        }
        toolbar={
          selectedIds.size > 0 ? (
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                <Check className="h-4 w-4" />
                {selectedIds.size} pengurus terpilih
              </div>
              <button
                type="button"
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Terpilih
              </button>
            </div>
          ) : null
        }
      >
        {isLoading ? (
          <SkeletonCard count={6} />
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Tidak ada pengurus ditemukan"
            description={members.length === 0 ? "Belum ada pengurus terdaftar. Tambahkan pengurus pertama sekarang." : "Coba sesuaikan kata kunci pencarian atau ubah filter generasi."}
            action={
              members.length === 0 ? (
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" />
                  Tambah Pengurus Pertama
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                />
                Pilih semua yang ditampilkan
              </label>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Batal pilih
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(m => {
                const gen = generations.find(g => g.id === m.generationId);
                const accountInfo = memberAccounts.get(m.id);
                return (
                  <MemberCard
                    key={m.id}
                    member={m}
                    generation={gen}
                    keyword={debouncedSearch}
                    selected={selectedIds.has(m.id)}
                    onSelect={(checked) => toggleSelectOne(m.id, checked)}
                    onEdit={() => handleOpenEdit(m)}
                    onDelete={() => handleDelete(m)}
                    onToggleVisibility={handleToggleVisibility}
                    onCreateAccount={handleCreateAccount}
                    onToggleAccountStatus={handleToggleAccountStatus}
                    onDeleteAccount={handleDeleteAccount}
                    hasAccount={!!accountInfo?.accountId}
                    accountIsActive={accountInfo?.isActive || false}
                    accountId={accountInfo?.accountId || undefined}
                  />
                );
              })}
            </div>
          </>
        )}
      </ListContainer>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={
          <>
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>{editingMember ? 'Ubah Profil Pengurus' : 'Daftarkan Pengurus Baru'}</span>
          </>
        }
        subtitle="Lengkapi informasi pengurus dan riwayat generasi."
      >
        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            // Cegah tombol Enter memicu submit form di input wizard,
            // kecuali pada textarea (jika ada) supaya newline tetap berfungsi.
            if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
              e.preventDefault();
            }
          }}
          className="space-y-6"
        >
          <Stepper steps={STEPS} current={step} />

          <div className="pt-2">
            {renderStepContent()}
          </div>

          <div className="pt-6 flex items-center gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCloseDrawer}
              className="flex-1 rounded-xl bg-slate-100 text-slate-600 py-3 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer text-center"
            >
              Batal
            </button>
            {step > 0 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 rounded-xl bg-white border border-slate-200 text-slate-700 py-3 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Sebelumnya
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-[2] rounded-xl bg-blue-600 hover:bg-blue-500 text-white py-3 text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                Selanjutnya <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || isStepTransitioning}
                className={`flex-[2] rounded-xl font-bold py-3 text-xs text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 ${
                  editingMember ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {editingMember ? 'Simpan Perubahan' : 'Daftarkan Pengurus'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </Drawer>

      <Toast toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog state={confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
      <CreateAccountDialog
        isOpen={showCreateAccount}
        memberName={selectedMemberForAccount?.name || ''}
        onClose={() => {
          setShowCreateAccount(false);
          setSelectedMemberForAccount(null);
        }}
        onConfirm={handleConfirmCreateAccount}
      />
    </div>
  );
}

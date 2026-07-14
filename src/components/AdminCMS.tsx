/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Generation, Member, Event, Article, GalleryItem } from '../types';
import { 
  Calendar, Users, History, Plus, Edit2, Trash2, Check, 
  RotateCcw, Sparkles, AlertTriangle, ShieldCheck, Mail, Link2, Info, Image as ImageIcon,
  Download, Upload, FileSpreadsheet, Search, LogOut, UserCog
} from 'lucide-react';
import ImageUploader from './ImageUploader';
import UserManagement from './UserManagement';
import { useAuth } from '../context/AuthContext';

interface AdminCMSProps {
  generations: Generation[];
  setGenerations: React.Dispatch<React.SetStateAction<Generation[]>>;
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  gallery?: GalleryItem[];
  setGallery?: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  setIsAdminMode?: (val: boolean) => void;
  setCurrentTab?: (tab: string) => void;
}

export default function AdminCMS({
  generations,
  setGenerations,
  members,
  setMembers,
  events,
  setEvents,
  articles,
  setArticles,
  gallery = [],
  setGallery,
  setIsAdminMode,
  setCurrentTab
}: AdminCMSProps) {
  // Navigation tabs inside CMS
  const [cmsTab, setCmsTab] = useState<'events' | 'members' | 'gallery' | 'generations' | 'users'>('events');
  const { user: currentUser, logout, hasRole } = useAuth();

  // Success Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // --- EVENTS CRUD STATE ---
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    imageUrl: '',
    status: 'upcoming' as 'ongoing' | 'upcoming' | 'completed',
  });

  // --- GALLERY CRUD STATE ---
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    category: 'Webinar & Talkshow',
    date: '',
    imageUrl: '',
    photographer: '',
    imagesText: ''
  });

  // --- MEMBERS CRUD STATE ---
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberForm, setMemberForm] = useState({
    name: '',
    position: '',
    division: 'Badan Pengurus Harian (BPH)',
    generationId: '' as number | '',
    email: '',
    imageUrl: '',
    linkedinUrl: '',
  });

  // --- TRANSITION ROLLOVERS STATE ---
  const [newGenName, setNewGenName] = useState('');
  const [newGenYears, setNewGenYears] = useState('');

  // Find active generation
  const activeGen = useMemo(() => generations.find(g => g.isActive), [generations]);

  // --- BATCH CSV / EXCEL STATE ---
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState<string | null>(null);

  // --- MEMBERS FILTER & SEARCH STATE ---
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedGenFilter, setSelectedGenFilter] = useState<number | 'all'>('all');

  // Download CSV Template
  const downloadCsvTemplate = () => {
    const headers = "Nama,Jabatan,Divisi,Email,Foto,LinkedIn,Generasi\n";
    const rows = "Budi Santoso,Kepala Bidang Humas,Bidang Hubungan Masyarakat,budi@iai-dki.or.id,https://images.unsplash.com/photo-1535713875002-d1d0cf377fde,https://linkedin.com/in/budi,Generasi ke-2\n";
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_pendaftaran_pengurus.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Parsing and Import execution
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

    const parseLine = (line: string) => {
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

    const headers = parseLine(lines[0]).map(h => h.toLowerCase());
    const importedMembers: Array<Omit<Member, 'id'>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length < 2) continue; // Skip lines with too few values

      const rowData: any = {};
      headers.forEach((header, idx) => {
        const val = values[idx] || '';
        if (header.includes('nama') || idx === 0) rowData.name = val;
        else if (header.includes('jabatan') || idx === 1) rowData.position = val;
        else if (header.includes('divisi') || idx === 2) rowData.division = val;
        else if (header.includes('email') || idx === 3) rowData.email = val;
        else if (header.includes('foto') || header.includes('image') || idx === 4) rowData.imageUrl = val;
        else if (header.includes('linkedin') || idx === 5) rowData.linkedinUrl = val;
        else if (header.includes('generasi') || idx === 6) rowData.generation = val;
      });

      if (!rowData.name || !rowData.position) {
        continue;
      }

      // Fallback division list matching options
      const allowedDivisions = [
        "Badan Pengurus Harian (BPH)",
        "Bidang Edukasi & Sertifikasi",
        "Bidang Hubungan Masyarakat",
        "Bidang Kewirausahaan & Kemitraan",
        "Bidang Media & Desain Kreatif"
      ];
      let divisionMatched = allowedDivisions.find(d => 
        d.toLowerCase().includes((rowData.division || '').toLowerCase()) || 
        (rowData.division || '').toLowerCase().includes(d.toLowerCase())
      );
      if (!divisionMatched) {
        divisionMatched = "Badan Pengurus Harian (BPH)"; // default
      }

      // Detect Generation ID
      let matchedGenId: number | '' = '';
      if (rowData.generation) {
        const matchedGen = generations.find(g => 
          g.name.toLowerCase().includes(rowData.generation.toLowerCase()) || 
          rowData.generation.toLowerCase().includes(g.name.toLowerCase())
        );
        if (matchedGen) matchedGenId = matchedGen.id;
      }
      if (matchedGenId === '') {
        matchedGenId = activeGen?.id || generations[0]?.id || '';
      }

      const newM: Omit<Member, 'id'> & { id?: number } = {
        name: rowData.name,
        position: rowData.position,
        division: divisionMatched,
        generationId: (matchedGenId as number) || 0,
        email: rowData.email || '',
        imageUrl: rowData.imageUrl || '',
        linkedinUrl: rowData.linkedinUrl || ''
      };
      importedMembers.push(newM as Member);
    }

    if (importedMembers.length === 0) {
      setCsvError("Gagal mengimpor. Pastikan header kolom sesuai dan data valid.");
      return;
    }

    // Push each imported member to the API, then re-fetch the full list
    let successCount = 0;
    for (const m of importedMembers) {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: m.name,
          division: m.division,
          generationId: m.generationId || undefined,
          email: m.email || null,
          imageUrl: m.imageUrl || null,
          linkedinUrl: m.linkedinUrl || null,
        }),
      });
      const result = await res.json();
      if (result.success) successCount++;
    }

    // Re-fetch members list to reflect DB state
    const listRes = await fetch('/api/members');
    const listResult = await listRes.json();
    if (listResult.success) {
      setMembers(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
    }

    triggerToast(`Berhasil mengimpor ${successCount} pengurus baru!`);
    setCsvText('');
    setCsvError(null);
    setShowImportCsv(false);
  };

  // Browser file reader for CSV
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleCsvImport(text);
    };
    reader.onerror = () => {
      setCsvError("Gagal membaca file.");
    };
    reader.readAsText(file);
  };

  // Filtered members list based on search and generation filter
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (selectedGenFilter !== 'all' && m.generationId !== selectedGenFilter) {
        return false;
      }
      // Search text
      if (memberSearch.trim()) {
        const term = memberSearch.toLowerCase();
        return (
          m.name.toLowerCase().includes(term) ||
          m.position.toLowerCase().includes(term) ||
          m.division.toLowerCase().includes(term) ||
          (m.email && m.email.toLowerCase().includes(term))
        );
      }
      return true;
    });
  }, [members, memberSearch, selectedGenFilter]);

  // Handle Event submit (Add/Edit)
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      const res = await fetch(`/api/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });
      const result = await res.json();
      if (result.success) {
        setEvents(prev => prev.map(evt => evt.id === editingEvent.id ? { ...evt, ...eventForm } : evt));
        triggerToast('Acara berhasil diperbarui!');
        setEditingEvent(null);
      } else {
        triggerToast(`Gagal memperbarui: ${result.message}`);
        return;
      }
    } else {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm),
      });
      const result = await res.json();
      if (result.success) {
        // Re-fetch the full list so we get the real DB id back
        const listRes = await fetch('/api/events');
        const listResult = await listRes.json();
        if (listResult.success) {
          setEvents(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
        }
        triggerToast('Acara baru berhasil ditambahkan!');
      } else {
        triggerToast(`Gagal menambahkan: ${result.message}`);
        return;
      }
    }
    // reset form
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      imageUrl: '',
      status: 'upcoming',
    });
  };

  const handleEditEvent = (evt: Event) => {
    setEditingEvent(evt);
    setEventForm({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      time: evt.time,
      location: evt.location,
      imageUrl: evt.imageUrl || '',
      status: evt.status,
    });
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus acara ini?')) {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setEvents(prev => prev.filter(evt => evt.id !== id));
        triggerToast('Acara berhasil dihapus.');
      } else {
        triggerToast(`Gagal menghapus: ${result.message}`);
      }
    }
  };

  // Handle Gallery submit (Add/Edit)
  const handleGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setGallery) return;

    // Convert imagesText to array of clean URLs
    const additionalImages = galleryForm.imagesText
      ? galleryForm.imagesText.split('\n').map(line => line.trim()).filter(Boolean)
      : [];

    const { imagesText, ...cleanForm } = galleryForm;
    const galleryItemData = {
      ...cleanForm,
      images: additionalImages
    };

    if (editingGalleryItem) {
      // Edit
      setGallery(prev => prev.map(item => item.id === editingGalleryItem.id ? { ...item, ...galleryItemData } : item));
      triggerToast('Item galeri berhasil diperbarui!');
      setEditingGalleryItem(null);
    } else {
      // Add
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}`,
        ...galleryItemData
      };
      setGallery(prev => [newItem, ...prev]);
      triggerToast('Foto galeri baru berhasil ditambahkan!');
    }

    // reset form
    setGalleryForm({
      title: '',
      description: '',
      category: 'Webinar & Talkshow',
      date: '',
      imageUrl: '',
      photographer: '',
      imagesText: ''
    });
  };

  const handleEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryForm({
      title: item.title,
      description: item.description,
      category: item.category || 'Webinar & Talkshow',
      date: item.date,
      imageUrl: item.imageUrl || '',
      photographer: item.photographer || '',
      imagesText: item.images ? item.images.join('\n') : ''
    });
  };

  const handleDeleteGalleryItem = (id: string) => {
    if (!setGallery) return;
    if (confirm('Apakah Anda yakin ingin menghapus foto galeri ini?')) {
      setGallery(prev => prev.filter(item => item.id !== id));
      triggerToast('Foto galeri berhasil dihapus.');
    }
  };

  const handleUploadAdditional = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setGalleryForm(prev => {
          const currentText = prev.imagesText.trim();
          const newText = currentText ? `${currentText}\n${data.url}` : data.url;
          return { ...prev, imagesText: newText };
        });
        triggerToast('Berhasil mengunggah foto tambahan!');
      } else {
        triggerToast(data.message || 'Gagal mengunggah foto tambahan.');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Terjadi kesalahan saat mengunggah foto.');
    }
  };

  // Handle Member submit (Add/Edit)
  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const genId = memberForm.generationId || activeGen?.id || generations[0]?.id;
    if (!genId) return;
    if (editingMember) {
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...memberForm, generationId: genId }),
      });
      const result = await res.json();
      if (result.success) {
        setMembers(prev => prev.map(m => m.id === editingMember.id ? { ...m, ...memberForm, generationId: genId } : m));
        triggerToast('Data pengurus berhasil diperbarui!');
        setEditingMember(null);
      } else {
        triggerToast(`Gagal memperbarui: ${result.message}`);
        return;
      }
    } else {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...memberForm, generationId: genId }),
      });
      const result = await res.json();
      if (result.success) {
        // Re-fetch so we get real DB id
        const listRes = await fetch('/api/members');
        const listResult = await listRes.json();
        if (listResult.success) {
          setMembers(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
        }
        triggerToast('Pengurus baru berhasil didaftarkan!');
      } else {
        triggerToast(`Gagal mendaftarkan: ${result.message}`);
        return;
      }
    }
    // reset form
    setMemberForm({
      name: '',
      position: '',
      division: 'Badan Pengurus Harian (BPH)',
      generationId: '',
      email: '',
      imageUrl: '',
      linkedinUrl: '',
    });
  };

  const handleEditMember = (m: Member) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name,
      position: m.position,
      division: m.division,
      generationId: m.generationId,
      email: m.email || '',
      imageUrl: m.imageUrl || '',
      linkedinUrl: m.linkedinUrl || '',
    });
  };

  const handleDeleteMember = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengurus ini dari komite?')) {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setMembers(prev => prev.filter(m => m.id !== id));
        triggerToast('Anggota komite berhasil dihapus.');
      } else {
        triggerToast(`Gagal menghapus: ${result.message}`);
      }
    }
  };

  // Transition Rollover: Create a new generation and switch active
  const handleCreateGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenName || !newGenYears) return;

    // Check duplicate
    if (generations.some(g => g.name.toLowerCase() === newGenName.toLowerCase())) {
      alert('Generasi dengan nama tersebut sudah terdaftar.');
      return;
    }

    // Build a slug from the name (e.g. "Generasi ke-3" → "generasi-ke-3")
    const slug = newGenName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const res = await fetch('/api/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, name: newGenName, years: newGenYears, isActive: false }),
    });
    const result = await res.json();
    if (result.success) {
      // Re-fetch full list to get real DB id
      const listRes = await fetch('/api/generations');
      const listResult = await listRes.json();
      if (listResult.success) {
        setGenerations(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
      }
      triggerToast(`Generasi Baru (${newGenName}) berhasil didaftarkan!`);
      setNewGenName('');
      setNewGenYears('');
    } else {
      triggerToast(`Gagal mendaftarkan generasi: ${result.message}`);
    }
  };

  // Perform absolute rollover (Archiving current, activating the target generation)
  const handleRolloverTransition = async (targetGenId: number) => {
    const targetGen = generations.find(g => g.id === targetGenId);
    if (!targetGen) return;

    if (confirm(`Peringatan Transisi Kepengurusan:\n\nApakah Anda yakin ingin mengaktifkan "${targetGen.name}" sebagai kepengurusan utama aktif? Generasi lain akan otomatis diarsipkan sebagai data sejarah.`)) {
      // Set target as active in DB
      const res = await fetch(`/api/generations/${targetGenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });
      const result = await res.json();
      if (!result.success) {
        triggerToast(`Gagal memperbarui generasi: ${result.message}`);
        return;
      }

      // Deactivate all others in DB
      const othersToDeactivate = generations.filter(g => g.id !== targetGenId && g.isActive);
      for (const g of othersToDeactivate) {
        await fetch(`/api/generations/${g.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: false }),
        });
      }

      // Re-fetch to sync
      const listRes = await fetch('/api/generations');
      const listResult = await listRes.json();
      if (listResult.success) {
        setGenerations(Array.isArray(listResult.data) ? listResult.data : [listResult.data]);
      }

      // Check if target generation has members
      const targetMembers = members.filter(m => m.generationId === targetGenId);
      if (targetMembers.length === 0) {
        triggerToast(`Transisi Berhasil! ${targetGen.name} kini Aktif. Tambahkan pengurus baru melalui tab Kepengurusan.`);
      } else {
        triggerToast(`Transisi Berhasil! ${targetGen.name} kini ditetapkan sebagai kepengurusan Aktif.`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row w-full font-sans" id="admin-dashboard-layout">
      
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white shadow-2xl border border-emerald-500/20 animate-scale-up" id="cms-toast">
          <Check className="h-5 w-5 bg-white/20 p-0.5 rounded-full" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- DASHBOARD SIDEBAR --- */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between flex-shrink-0">
        
        <div className="p-6 space-y-8">
          {/* Brand Logo & Identifier */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-sm text-slate-900 tracking-wider uppercase">IAI MUDA DKI</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-slate-500 font-bold tracking-wider font-mono uppercase">Portal Admin</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics at Sidebar */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kondisi Kepengurusan</span>
            <div className="text-xs font-semibold text-slate-700">
              {activeGen ? (
                <div className="flex items-center justify-between">
                  <span>Aktif:</span>
                  <span className="text-blue-600 font-bold">{activeGen.name}</span>
                </div>
              ) : (
                <span className="text-amber-600">Generasi Belum Aktif</span>
              )}
            </div>
            {currentUser && (
              <div className="pt-1 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[60%]">{currentUser.username}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  currentUser.role === 'superadmin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                  currentUser.role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin' : 'Editor'}
                </span>
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-3 pb-2">Navigasi Utama</span>
            
            <button
              id="cms-tab-events-sidebar"
              onClick={() => setCmsTab('events')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                cmsTab === 'events' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="h-4.5 w-4.5" />
                <span>Agenda Acara</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                cmsTab === 'events' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {events.length}
              </span>
            </button>

            <button
              id="cms-tab-members-sidebar"
              onClick={() => setCmsTab('members')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                cmsTab === 'members' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4.5 w-4.5" />
                <span>Kepengurusan</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                cmsTab === 'members' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {members.length}
              </span>
            </button>
            )}

            <button
              onClick={() => setCmsTab('gallery')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                cmsTab === 'gallery' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <ImageIcon className="h-4.5 w-4.5" />
                <span>Galeri Kegiatan</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                cmsTab === 'gallery' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {gallery.length}
              </span>
            </button>

            <button
              id="cms-tab-generations-sidebar"
              onClick={() => setCmsTab('generations')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                cmsTab === 'generations' 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <History className="h-4.5 w-4.5" />
                <span>Masa Transisi</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                cmsTab === 'generations' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
              }`}>
                {generations.length}
              </span>
            </button>

            {/* Users tab — superadmin only */}
            {hasRole('superadmin') && (
              <button
                id="cms-tab-users-sidebar"
                onClick={() => setCmsTab('users')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  cmsTab === 'users' 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCog className="h-4.5 w-4.5" />
                  <span>Manajemen User</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Exit Control Panel at Bottom */}
        <div className="p-6 border-t border-slate-200 space-y-3 bg-white">
          <button
            onClick={async () => {
              await logout();
              if (setIsAdminMode && setCurrentTab) {
                setIsAdminMode(false);
                setCurrentTab('beranda');
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 py-3 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-sm hover:shadow-md"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Portal Admin</span>
          </button>
          <div className="text-[10px] text-slate-400 text-center font-mono font-medium">
            IKATAN AKUNTAN INDONESIA
          </div>
        </div>

      </aside>

      {/* --- DASHBOARD MAIN CONTENT AREA --- */}
      <main className="flex-1 bg-slate-50 p-6 sm:p-8 lg:p-10 overflow-y-auto min-h-screen">
        
        {/* Top Header of Main Area */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              {cmsTab === 'events' ? 'Manajemen Agenda & Webinar' :
               cmsTab === 'members' ? 'Kepengurusan' :
               cmsTab === 'gallery' ? 'Arsip Dokumentasi Galeri' : 'Transisi & Rollover Organisasi'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {cmsTab === 'events' ? 'Terbitkan webinar, kelola status pelaksanaan, dan pantau daftar hadir peserta.' :
               cmsTab === 'members' ? 'Kelola keanggotaan aktif divisi kerja, pendaftaran struktur baru, dan tautan sosial media.' :
               cmsTab === 'gallery' ? 'Unggah foto-foto beresolusi tinggi dokumentasi kesuksesan IAI Muda DKI.' : 'Luncurkan generasi kepengurusan baru, serta arsipkan sejarah komite terdahulu.'}
            </p>
          </div>

          {/* Quick Stats Widget inside Main Area */}
          <div className="flex items-center gap-4 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider block">Sesi Admin</span>
              <span className="text-xs font-bold text-slate-700">Super Administrator</span>
            </div>
          </div>
        </div>

        {/* Dynamic Inner Tab Content Rendering */}
        <div className="space-y-8">

      {/* --- RENDER 1: EVENTS CRUD CMS --- */}
      {cmsTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="events-crud-module">
          
          {/* Form Create/Edit on Left */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>{editingEvent ? 'Ubah Informasi Acara' : 'Buat Agenda Acara Baru'}</span>
            </h3>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Judul Kegiatan / Tema Webinar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Webinar Pelaporan Keuangan ESG..."
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Deskripsi Lengkap</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Deskripsikan garis besar materi, sasaran peserta, dan benefit..."
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Waktu Mulai</label>
                  <input
                    type="time"
                    required
                    value={eventForm.time}
                    onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Lokasi / Media Pertemuan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Media Zoom / Aula Grha Akuntan"
                  value={eventForm.location}
                  onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <ImageUploader
                label="Gambar Sampul Acara"
                value={eventForm.imageUrl}
                onChange={(url) => setEventForm(prev => ({ ...prev, imageUrl: url }))}
                placeholder="https://images.unsplash.com/photo-..."
                helperText="Unggah gambar poster atau pamflet webinar, atau tempel link gambar."
              />

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Status Publikasi</label>
                <select
                  value={eventForm.status}
                  onChange={(e) => setEventForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="upcoming">Akan Datang (Upcoming)</option>
                  <option value="ongoing">Berlangsung (Ongoing)</option>
                  <option value="completed">Telah Selesai (Completed)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center gap-2">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      setEventForm({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        location: '',
                        imageUrl: '',
                        status: 'upcoming',
                      });
                    }}
                    className="w-1/3 rounded-xl bg-slate-100 text-slate-600 py-2.5 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className={`rounded-xl font-bold py-2.5 text-xs text-white shadow-md cursor-pointer transition-all ${
                    editingEvent ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-blue-600 hover:bg-blue-500 shadow-blue-500/10'
                  }`}
                >
                  {editingEvent ? 'Simpan Perubahan' : 'Terbitkan Agenda'}
                </button>
              </div>

            </form>
          </div>

          {/* List Events on Right */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900">Daftar Agenda Aktif ({events.length})</h3>
            
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] pr-2 space-y-4">
              {events.map(evt => (
                <div key={evt.id} className="pt-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        evt.status === 'ongoing' ? 'bg-emerald-50 text-emerald-700' :
                        evt.status === 'upcoming' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {evt.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold font-mono">{evt.date}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 leading-tight">{evt.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{evt.description}</p>
                    <p className="text-[10px] text-slate-400 font-medium">📍 {evt.location}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEditEvent(evt)}
                      className="p-2 hover:bg-slate-50 rounded-lg text-blue-600 hover:text-blue-700 transition-all cursor-pointer"
                      title="Ubah Acara"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-all cursor-pointer"
                      title="Hapus Acara"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- RENDER 2: MEMBERS CRUD CMS --- */}
      {cmsTab === 'members' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="members-crud-module">
          
          {/* Member input form on left */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>{editingMember ? 'Ubah Profil Pengurus' : 'Daftarkan Pengurus Baru'}</span>
            </h3>

            {/* CSV/Excel Mass Registration Accordion */}
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
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleCsvFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500">Atau tempel teks CSV / salinan baris Excel:</label>
                    <textarea
                      rows={3}
                      placeholder="Nama,Jabatan,Divisi,Email,Foto,LinkedIn,Generasi&#10;Budi Santoso,Kepala Humas,Bidang Hubungan Masyarakat,budi@iai-dki.or.id,,,"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      className="w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-[10px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                    />
                  </div>

                  {csvError && (
                    <p className="text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-100 leading-relaxed">
                      {csvError}
                    </p>
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

            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Ak., CA"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Jabatan Komite</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kepala Bidang Hubungan Masyarakat"
                  value={memberForm.position}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Bidang / Divisi Kerja</label>
                <select
                  value={memberForm.division}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, division: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Badan Pengurus Harian (BPH)">Badan Pengurus Harian (BPH)</option>
                  <option value="Bidang Edukasi & Sertifikasi">Bidang Edukasi & Sertifikasi</option>
                  <option value="Bidang Hubungan Masyarakat">Bidang Hubungan Masyarakat</option>
                  <option value="Bidang Kewirausahaan & Kemitraan">Bidang Kewirausahaan & Kemitraan</option>
                  <option value="Bidang Media & Desain Kreatif">Bidang Media & Desain Kreatif</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Periode Generasi</label>
                <select
                  value={memberForm.generationId}
                  onChange={(e) => setMemberForm(prev => ({ ...prev, generationId: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="">-- Gunakan Generasi Aktif --</option>
                  {generations.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.years})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="nama@iai-dki.or.id"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tautan LinkedIn</label>
                  <input
                    type="text"
                    placeholder="https://linkedin.com/in/..."
                    value={memberForm.linkedinUrl}
                    onChange={(e) => setMemberForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <ImageUploader
                label="Foto Profil"
                value={memberForm.imageUrl}
                onChange={(url) => setMemberForm(prev => ({ ...prev, imageUrl: url }))}
                placeholder="https://images.unsplash.com/photo-..."
                helperText="Unggah pasfoto resmi pengurus atau tempel link Unsplash."
              />

              <div className="pt-4 flex items-center gap-2">
                {editingMember && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMember(null);
                      setMemberForm({
                        name: '',
                        position: '',
                        division: 'Badan Pengurus Harian (BPH)',
                        generationId: '',
                        email: '',
                        imageUrl: '',
                        linkedinUrl: '',
                      });
                    }}
                    className="w-1/3 rounded-xl bg-slate-100 text-slate-600 py-2.5 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className={`rounded-xl font-bold py-2.5 text-xs text-white shadow-md cursor-pointer transition-all ${
                    editingMember ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {editingMember ? 'Simpan Perubahan' : 'Daftarkan Pengurus'}
                </button>
              </div>

            </form>
          </div>

          {/* Members list on right */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">Daftar Pengurus</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  Menampilkan {filteredMembers.length} dari {members.length} total pengurus
                </p>
              </div>
              
              {/* Dynamic Filter Select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Filter Generasi:</span>
                <select
                  value={selectedGenFilter}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedGenFilter(val === 'all' ? 'all' : Number(val));
                  }}
                  className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">Semua Generasi</option>
                  {generations.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name} {g.isActive ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Input for Members */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari nama pengurus, jabatan, atau divisi kerja..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* List stage */}
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px] pr-2 space-y-4">
              {filteredMembers.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="text-slate-300 flex justify-center">
                    <Users className="h-10 w-10" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-500">Tidak ada pengurus ditemukan</h4>
                  <p className="text-[11px] text-slate-400 leading-normal max-w-xs mx-auto">
                    Coba sesuaikan kata kunci pencarian atau ubah filter generasi kepengurusan di atas.
                  </p>
                </div>
              ) : (
                filteredMembers.map(m => {
                  const gen = generations.find(g => g.id === m.generationId);
                  return (
                    <div key={m.id} className="pt-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {m.imageUrl ? (
                          <img 
                            src={m.imageUrl} 
                            alt={m.name} 
                            className="h-10 w-10 rounded-lg object-cover bg-slate-100 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Users className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{m.name}</h4>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                            <span className="text-blue-600 font-bold">{m.position}</span>
                            <span>•</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {gen?.name || 'Generasi lama'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{m.division}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditMember(m)}
                          className="p-2 hover:bg-slate-50 rounded-lg text-blue-600 hover:text-blue-700 transition-all cursor-pointer"
                          title="Ubah Anggota"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-all cursor-pointer"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- RENDER 3: GALLERY CRUD CMS --- */}
      {cmsTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="gallery-crud-module">
          
          {/* Gallery Form Creator */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>{editingGalleryItem ? 'Ubah Informasi Galeri' : 'Tambah Foto Galeri Baru'}</span>
            </h3>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Judul Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Diskusi Panel Akuntan Muda 2026..."
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Kategori</label>
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                >
                  <option value="Webinar & Talkshow">Webinar & Talkshow</option>
                  <option value="Rapat Kerja (Raker)">Rapat Kerja (Raker)</option>
                  <option value="Kunjungan Industri">Kunjungan Industri</option>
                  <option value="Sosial & Pengabdian">Sosial & Pengabdian</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Deskripsi Singkat</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ceritakan momen seru di foto ini..."
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tanggal Kegiatan</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 15 Maret 2026"
                    value={galleryForm.date}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Fotografer / Dokumentor</label>
                  <input
                    type="text"
                    placeholder="Opsional: Divisi Media..."
                    value={galleryForm.photographer}
                    onChange={(e) => setGalleryForm(prev => ({ ...prev, photographer: e.target.value }))}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <ImageUploader
                label="Gambar Utama / Cover"
                value={galleryForm.imageUrl}
                onChange={(url) => setGalleryForm(prev => ({ ...prev, imageUrl: url }))}
                placeholder="https://images.unsplash.com/photo-..."
                helperText="Unggah gambar utama sebagai cover dokumentasi galeri kegiatan."
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Foto-Foto Tambahan (Untuk Slide Carousel)</label>
                  <label className="text-[10px] text-blue-600 hover:text-blue-700 font-bold cursor-pointer flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full transition-all hover:bg-blue-100">
                    <Upload className="h-3 w-3" />
                    Unggah Baru
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAdditional}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                  value={galleryForm.imagesText}
                  onChange={(e) => setGalleryForm(prev => ({ ...prev, imagesText: e.target.value }))}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-mono text-[11px]"
                />
                <p className="text-[10px] text-slate-400 leading-normal font-medium">
                  Satu URL per baris. Anda dapat mengunggah foto tambahan baru secara langsung menggunakan tombol di atas, atau menempelkan URL gambar eksternal secara manual.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-2">
                {editingGalleryItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGalleryItem(null);
                      setGalleryForm({
                        title: '',
                        description: '',
                        category: 'Webinar & Talkshow',
                        date: '',
                        imageUrl: '',
                        photographer: '',
                        imagesText: ''
                      });
                    }}
                    className="w-1/3 rounded-xl bg-slate-100 text-slate-600 py-2.5 text-xs font-semibold hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className={`rounded-xl font-bold py-2.5 text-xs text-white shadow-md cursor-pointer transition-all ${
                    editingGalleryItem ? 'w-2/3 bg-emerald-600 hover:bg-emerald-500' : 'w-full bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  {editingGalleryItem ? 'Simpan Perubahan' : 'Unggah Foto'}
                </button>
              </div>

            </form>
          </div>

          {/* Gallery Items List */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900">Foto Terunggah ({gallery.length})</h3>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px] pr-2 space-y-4">
              {gallery.map(item => (
                <div key={item.id} className="pt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="h-14 w-14 rounded-xl object-cover bg-slate-100 shadow-sm flex-shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {item.category} • <span className="font-mono text-[11px] text-slate-400">{item.date}</span>
                        {item.images && item.images.length > 0 && (
                          <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                            +{item.images.length} Slide
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleEditGalleryItem(item)}
                      className="p-2 hover:bg-slate-50 rounded-lg text-blue-600 hover:text-blue-700 transition-all cursor-pointer"
                      title="Ubah Foto"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-all cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* --- RENDER 4: GENERATION ANNUAL ROLLOVERS & TRANSITION --- */}
      {cmsTab === 'generations' && (
        <div className="space-y-8" id="transition-annual-rollover">
          
          {/* Warning Banner */}
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-500 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-slate-900 text-base">Alur Transisi Kepengurusan Tahunan (1 Tahun Periode)</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Setiap generasi kepengurusan IAI Muda Wilayah DKI Jakarta hanya bertugas selama tepat 1 tahun. Gunakan konsol ini untuk memigrasi kepengurusan secara mulus. Saat Anda menetapkan Generasi baru sebagai <strong>Aktif</strong>, generasi sebelumnya akan diarsipkan ke basis data arsip/sejarah secara otomatis tanpa kehilangan data anggota lama!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Spawn generation form */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span>Langkah 1: Daftarkan Generasi Baru</span>
              </h3>

              <form onSubmit={handleCreateGeneration} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Generasi Baru</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Generasi ke-3"
                    value={newGenName}
                    onChange={(e) => setNewGenName(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tahun Jabatan (1 Tahun)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2026-2027"
                    value={newGenYears}
                    onChange={(e) => setNewGenYears(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 font-bold py-3 text-xs text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition-all cursor-pointer"
                >
                  Daftarkan Struktur Generasi Baru
                </button>
              </form>
            </div>

            {/* Rollover controls */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <h3 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <span>Langkah 2: Kelola Status Aktif & Arsip Sejarah</span>
              </h3>

              <div className="space-y-4">
                {generations.map(g => {
                  const totalMembers = members.filter(m => m.generationId === g.id).length;
                  return (
                    <div 
                      key={g.id} 
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        g.isActive 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{g.name}</h4>
                          {g.isActive ? (
                            <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-emerald-500 text-white animate-pulse">
                              AKTIF SEKARANG
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 text-[9px] uppercase font-bold rounded bg-slate-200 text-slate-500 font-semibold">
                              DIARSIPKAN
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Masa Jabatan: {g.years}</p>
                        <p className="text-xs text-slate-500 mt-1">👥 {totalMembers} Anggota Komite Terdaftar</p>
                      </div>

                      {!g.isActive ? (
                        <button
                          onClick={() => handleRolloverTransition(g.id)}
                          className="rounded-lg bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 px-3.5 py-2 text-xs font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Aktifkan Generasi Ini</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-3 py-2 text-emerald-600 text-xs font-bold">
                          <Check className="h-4 w-4" />
                          <span>Utama</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
                <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  Mengaktifkan generasi baru akan memperbarui diagram organisasi komite utama di laman publik, serta merubah total keanggotaan aktif secara instan.
                </span>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* --- RENDER 5: USER MANAGEMENT (superadmin only) --- */}
      {cmsTab === 'users' && hasRole('superadmin') && (
        <UserManagement />
      )}

        </div>
      </main>

    </div>
  );
}

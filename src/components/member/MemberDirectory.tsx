'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Search,
  Users,
  Linkedin,
  GraduationCap,
  Briefcase,
  School,
  X,
  UserCheck,
  UserX,
} from 'lucide-react';

interface Generation {
  id: number;
  name: string;
  years: string;
  isActive: boolean;
}

interface DirectoryMember {
  id: number;
  name: string;
  division: string | null;
  university: string | null;
  imageUrl: string | null;
  linkedinUrl: string | null;
  isAlumni: boolean;
  generations: Generation[];
  position: {
    id: number;
    name: string;
    category: string;
  } | null;
}

interface MemberDirectoryProps {
  token: string | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

type AlumniFilter = 'all' | 'active' | 'alumni';

export default function MemberDirectory({ token }: MemberDirectoryProps) {
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [alumniFilter, setAlumniFilter] = useState<AlumniFilter>('all');

  const fetchMembers = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (alumniFilter === 'alumni') params.append('isAlumni', 'true');
      if (alumniFilter === 'active') params.append('isAlumni', 'false');

      const response = await fetch(`/api/member/directory?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMembers(result.data);
        }
      }
    } catch (error) {
      console.error('Directory fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [token, search, alumniFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchMembers();
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchMembers]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const activeCount = members.filter((m) => !m.isAlumni).length;
  const alumniCount = members.filter((m) => m.isAlumni).length;

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau divisi..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Alumni Filter Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setAlumniFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${alumniFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setAlumniFilter('active')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${alumniFilter === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Aktif
            </button>
            <button
              onClick={() => setAlumniFilter('alumni')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${alumniFilter === 'alumni' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <UserX className="w-3.5 h-3.5" />
              Alumni
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Anggota</p>
              <p className="text-sm font-semibold text-slate-900">{members.length}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Aktif</p>
              <p className="text-sm font-semibold text-slate-900">{activeCount}</p>
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <UserX className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Alumni</p>
              <p className="text-sm font-semibold text-slate-900">{alumniCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            <p className="mt-4 text-slate-500">Memuat direktori anggota...</p>
          </div>
        </div>
      ) : members.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col items-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Tidak Ada Anggota Ditemukan</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-[300px]">
              {search
                ? `Tidak ada hasil untuk "${search}". Coba kata kunci lain.`
                : 'Belum ada anggota yang terdaftar dalam kategori ini.'}
            </p>
          </div>
        </div>
      ) : (
        /* Member Grid */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {members.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Card Header with Avatar */}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {member.imageUrl ? (
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-red-900 flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-sm flex-shrink-0">
                      {getInitials(member.name)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {member.position?.name || 'Anggota'}
                    </p>
                    {member.isAlumni ? (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-medium">
                        <UserX className="w-2.5 h-2.5" />
                        Alumni
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                        <UserCheck className="w-2.5 h-2.5" />
                        Aktif
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Body - Info */}
              <div className="px-5 pb-5 space-y-2.5">
                {member.division && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{member.division}</span>
                  </div>
                )}
                {member.university && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <School className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{member.university}</span>
                  </div>
                )}
                {member.generations.length > 0 && (
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {member.generations.map((gen) => (
                        <span
                          key={gen.id}
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ${gen.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                        >
                          {gen.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer - LinkedIn */}
              {member.linkedinUrl && (
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                  <a
                    href={member.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    Lihat Profil LinkedIn
                  </a>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
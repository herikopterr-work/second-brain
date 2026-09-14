'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import {
  getProjects,
  getAreas,
  createProject,
  updateProject,
  deleteProject,
  type ProjectWithDetails,
  type AreaWithCounts,
} from '@/lib/crud/actions';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [areas, setAreas] = useState<AreaWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done' | 'archived'>('active');

  // Modal Tambah / Edit Project
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithDetails | null>(null);
  const [projectName, setProjectName] = useState('');
  const [selectedAreaId, setSelectedAreaId] = useState('');
  const [projectStatus, setProjectStatus] = useState<'active' | 'done' | 'archived'>('active');
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projData, areaData] = await Promise.all([getProjects(), getAreas()]);
      setProjects(projData);
      setAreas(areaData.filter((a) => !a.archived_at));
    } catch (err) {
      console.error('Gagal memuat data projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aturan 1: Saat membuka form tambah Project, pemilihan Area wajib dan otomatis terpilih (tanpa opsi kosong)
  const handleOpenAdd = () => {
    setEditingProject(null);
    setProjectName('');
    setProjectStatus('active');
    // Pre-select area pertama atau area default (tidak ada opsi kosong)
    const defaultArea = areas.find((a) => a.is_default) || areas[0];
    setSelectedAreaId(defaultArea?.id || '');
    setShowModal(true);
  };

  const handleOpenEdit = (project: ProjectWithDetails) => {
    setEditingProject(project);
    setProjectName(project.name);
    setSelectedAreaId(project.area_id);
    setProjectStatus(project.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedAreaId || saving) return;

    setSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, projectName, selectedAreaId, projectStatus);
      } else {
        await createProject(projectName, selectedAreaId);
      }
      setShowModal(false);
      setProjectName('');
      setEditingProject(null);
      await loadData();
    } catch (err) {
      alert(`Gagal menyimpan Project: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project: ProjectWithDetails) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Project "${project.name}"?`)) return;

    try {
      await deleteProject(project.id);
      await loadData();
    } catch (err) {
      alert(`Gagal menghapus Project: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const handleQuickStatusChange = async (project: ProjectWithDetails, newStatus: 'active' | 'done' | 'archived') => {
    try {
      await updateProject(project.id, project.name, project.area_id, newStatus);
      await loadData();
    } catch (err) {
      alert(`Gagal mengubah status: ${err instanceof Error ? err.message : 'Error'}`);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'all') return true;
    return p.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kelola Projects</h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Struktur PARA tingkat 2: Hasil spesifik dengan tenggat waktu atau titik selesai, selalu di bawah satu Area.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            disabled={areas.length === 0}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950 disabled:opacity-50"
          >
            <span>+ Tambah Project</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {(['active', 'done', 'archived', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors uppercase tracking-wider text-[11px] ${
                statusFilter === st
                  ? 'bg-neutral-100 text-neutral-950 font-bold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800'
              }`}
            >
              {st === 'active' ? '⚡ Aktif' : st === 'done' ? '✓ Selesai' : st === 'archived' ? '📦 Arsip' : 'Semua'}
            </button>
          ))}
        </div>

        {/* Project List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-neutral-400">Memuat data Projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16 text-center text-xs text-neutral-500 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 space-y-3">
            <p>Tidak ada Project pada kategori filter ini.</p>
            {areas.length === 0 && (
              <p className="text-amber-400">
                Silakan buat Area terlebih dahulu di menu <b>Areas</b> sebelum membuat Project.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-800 text-neutral-300 border border-neutral-700/80">
                      📁 {proj.area_name}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        proj.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : proj.status === 'done'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-neutral-100 line-clamp-2">{proj.name}</h3>

                  <div className="text-[11px] text-neutral-400 font-mono">
                    <span className="text-neutral-200 font-semibold">{proj.item_count}</span> item terhubung
                  </div>
                </div>

                {/* Quick Status / Actions */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                  <div className="flex gap-1">
                    {proj.status !== 'active' && (
                      <button
                        onClick={() => handleQuickStatusChange(proj, 'active')}
                        title="Jadikan Aktif"
                        className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-[11px]"
                      >
                        ⚡ Aktifkan
                      </button>
                    )}
                    {proj.status !== 'done' && (
                      <button
                        onClick={() => handleQuickStatusChange(proj, 'done')}
                        title="Tandai Selesai"
                        className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-blue-400 text-[11px]"
                      >
                        ✓ Done
                      </button>
                    )}
                    {proj.status !== 'archived' && (
                      <button
                        onClick={() => handleQuickStatusChange(proj, 'archived')}
                        title="Arsipkan"
                        className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-[11px]"
                      >
                        📦 Arsip
                      </button>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="text-neutral-400 hover:text-neutral-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      className="text-rose-400 hover:text-rose-300"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Tambah / Edit Project */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in">
              <h3 className="font-bold text-base text-neutral-100">
                {editingProject ? 'Edit Project' : 'Tambah Project Baru'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Nama Project</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: Rilis V1 Aplikasi, Audit Finansial Q3"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Aturan 1: Pemilihan Area WAJIB dan TIDAK BOLEH punya opsi kosong */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Induk Area <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {/* Tidak ada opsi kosong di sini */}
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        📁 {a.name} {a.is_default ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Project wajib berada di bawah tepat satu Area.
                  </p>
                </div>

                {editingProject && (
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Status</label>
                    <select
                      value={projectStatus}
                      onChange={(e) => setProjectStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-100 text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="active">Active (Aktif)</option>
                      <option value="done">Done (Selesai)</option>
                      <option value="archived">Archived (Diarsip)</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={!projectName.trim() || !selectedAreaId || saving}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

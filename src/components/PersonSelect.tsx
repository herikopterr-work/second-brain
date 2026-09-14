'use client';

import { useState, useRef, useEffect } from 'react';
import { createPerson } from '@/lib/crud/actions';

export interface PersonOption {
  id: string;
  name: string;
  role?: string | null;
}

interface PersonSelectProps {
  people: PersonOption[];
  selectedPersonId: string;
  onSelectPerson: (personId: string) => void;
  required?: boolean;
  onPersonCreated?: (newPerson: PersonOption) => void;
  label?: string;
  placeholder?: string;
}

export default function PersonSelect({
  people,
  selectedPersonId,
  onSelectPerson,
  required = false,
  onPersonCreated,
  label = 'Terkait Siapa (Person)',
  placeholder = '-- Pilih Orang --',
}: PersonSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [saving, setSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const selectedPerson = people.find((p) => p.id === selectedPersonId);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsAddingNew(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAddingNew) {
      nameInputRef.current?.focus();
    }
  }, [isAddingNew]);

  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.role && p.role.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateNewPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || saving) return;

    setSaving(true);
    try {
      const created = await createPerson(newName, newRole);
      if (onPersonCreated) {
        onPersonCreated(created);
      }
      onSelectPerson(created.id);
      setNewName('');
      setNewRole('');
      setIsAddingNew(false);
      setIsOpen(false);
    } catch (err) {
      alert(`Gagal membuat person: ${err instanceof Error ? err.message : 'Error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#5B6B60]">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>
      )}

      {/* Button Pemilih */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-white border border-[#DFE6DC] hover:border-[#CBD5E1] rounded-xl text-left text-xs flex items-center justify-between transition-colors focus:outline-none focus:border-[#162B20] focus:ring-1 focus:ring-[#162B20] shadow-sm"
      >
        <span className={selectedPerson ? 'text-[#19241C] font-semibold' : 'text-[#9CA3AF]'}>
          {selectedPerson ? (
            <span className="flex items-center gap-1.5">
              <span>👤</span>
              <span>{selectedPerson.name}</span>
              {selectedPerson.role && (
                <span className="text-[#5B6B60] text-[11px]">({selectedPerson.role})</span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <span className="text-[#5B6B60] text-[10px]">▼</span>
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#DFE6DC] rounded-2xl shadow-xl overflow-hidden p-2 space-y-2 animate-fade-in">
          {/* Form Inline Tambah Orang Baru */}
          {isAddingNew ? (
            <form onSubmit={handleCreateNewPerson} className="p-3 bg-[#EFF3ED] border border-[#CBE0D1] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-[#1E3B2B]">
                <span>✨ Tambah Orang Baru</span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-[#5B6B60] hover:text-[#19241C]"
                >
                  ✕
                </button>
              </div>

              <input
                ref={nameInputRef}
                type="text"
                required
                placeholder="Nama (contoh: Siti Rahma)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DFE6DC] rounded-lg text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
              />

              <input
                type="text"
                placeholder="Peran / Jabatan (contoh: Vendor, Atasan)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DFE6DC] rounded-lg text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white border border-[#DFE6DC] hover:bg-neutral-50 text-[#5B6B60] text-[11px] font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || saving}
                  className="flex-1 py-1.5 rounded-lg bg-[#162B20] hover:bg-[#1E3B2B] text-white font-semibold text-[11px] disabled:opacity-50 shadow-sm"
                >
                  {saving ? 'Menyimpan...' : 'Simpan & Pilih'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Search Box */}
              <input
                type="text"
                placeholder="Cari nama atau peran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 bg-[#EFF3ED] border border-[#DFE6DC] rounded-lg text-[#19241C] text-xs focus:outline-none focus:border-[#162B20]"
              />

              {/* Tombol Inline + Orang Baru */}
              <button
                type="button"
                onClick={() => setIsAddingNew(true)}
                className="w-full py-2 px-3 rounded-lg bg-[#EBF4EE] hover:bg-[#D8ECD8] text-[#1E3B2B] font-bold text-xs border border-[#CBE0D1] text-left flex items-center justify-between transition-colors"
              >
                <span>➕ Tambah orang baru</span>
                <span className="text-[10px] font-medium opacity-80">Langsung di sini</span>
              </button>

              {/* Daftar Orang */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredPeople.length === 0 ? (
                  <p className="text-center text-[11px] text-[#5B6B60] py-3">
                    Tidak ditemukan. Klik tombol di atas untuk menambah.
                  </p>
                ) : (
                  filteredPeople.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => {
                        onSelectPerson(person.id);
                        setIsOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs flex items-center justify-between transition-colors ${
                        selectedPersonId === person.id
                          ? 'bg-[#EBF4EE] text-[#1E3B2B] font-bold border border-[#CBE0D1]'
                          : 'text-[#19241C] hover:bg-[#EFF3ED]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>👤</span>
                        <span className="truncate">{person.name}</span>
                      </div>
                      {person.role && (
                        <span className="text-[10px] text-[#5B6B60] shrink-0 ml-2 font-normal">
                          {person.role}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

# PRD — Personal Second Brain

Versi 1.0 · Single-user · PWA

---

## 1. Ringkasan

Sistem personal knowledge management dan produktivitas untuk satu orang (Team Leader), menggabungkan alur kerja GTD dengan struktur penyimpanan PARA.

Masalah yang diselesaikan: informasi tersebar di meeting, WhatsApp, Teams, dan email; follow-up terlupakan; output meeting tidak tertindaklanjuti; tidak ada satu tempat untuk menjawab "apa yang sedang berjalan".

Prinsip yang memandu seluruh keputusan di dokumen ini:

1. **Kecepatan capture di atas kerapian data.** Capture yang gagal berarti sistem yang mati.
2. **Aturan sedikit dan seragam.** Pengecualian per tipe adalah beban hafalan tanpa manfaat.
3. **Satu pertanyaan saat clarify:** "Bola ada di tangan siapa?"

---

## 2. Pengguna & lingkup

| Aspek | Keputusan |
|---|---|
| Pengguna | Satu orang. Tidak ada multi-user, sharing, permission, atau kolom owner |
| Platform | PWA (dipasang di home screen HP, juga dipakai di desktop) |
| Stack | Next.js + Supabase (Postgres) |
| Offline | Hanya Capture. Fitur lain memerlukan koneksi |

### Di luar lingkup

- Multi-user dan kolaborasi
- Integrasi kalender (Outlook/Google)
- Integrasi email, WhatsApp, atau Teams
- Audit trail dan recent activity
- Restore dari UI
- Notifikasi push

---

## 3. Konsep inti

### 3.1 Tiga tipe item

Seluruh pekerjaan direduksi menjadi tiga tipe. Pertanyaan tunggal saat clarify: **bola ada di tangan siapa?**

| Tipe | Arti | Sub-tipe |
|---|---|---|
| `ACTION` | Saya yang mengerjakan | `task`, `commitment`, `issue`, `question` |
| `WAITING` | Orang lain yang mengerjakan | `waiting_for`, `blocker`, `follow_up` |
| `RESOURCE` | Tidak ada bola | `reference`, `decision` |

Catatan turunan dari dokumen kebutuhan awal:

- Sembilan hasil clarify diringkas jadi tiga. Sub-tipe menjaga detail tanpa memperlambat keputusan.
- **Parking Lot dihapus.** Isinya sebenarnya daftar pertanyaan untuk orang lain — bola ada di tangan pengguna, jadi menjadi `ACTION / question`.
- Penamaan `RESOURCE` (bukan Reference) dipilih agar sejalan dengan PARA.

### 3.2 Struktur PARA

```
Area → Project → Item
```

- Project **selalu** berada di bawah tepat satu Area.
- Setiap item **wajib** terhubung ke Project atau Area, tanpa kecuali.
- Tersedia Area default `Uncategorized` sebagai escape hatch.

### 3.3 Relasi

- Relasi antar-item bersifat **many-to-many bebas**, berlabel `derived_from` atau `related_to`.
- Tidak ada pengecualian per tipe. Decision boleh ditautkan ke Action seperti item lain.
- Disiplin yang dipegang pengguna (bukan dipaksakan aplikasi): keputusan besar dituangkan menjadi Project baru, tautan hanya untuk tindak lanjut kecil.

---

## 4. Model data

### `areas`
| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `is_default` | boolean | true untuk `Uncategorized`, tidak dapat dihapus |
| `archived_at` | timestamptz | nullable |

### `projects`
| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid | PK |
| `area_id` | uuid | FK `areas`, **NOT NULL** |
| `name` | text | |
| `status` | enum | `active`, `done`, `archived` |
| `archived_at` | timestamptz | nullable, diisi manual |

### `people`
| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | |
| `role` | text | nullable, mis. "Atasan", "Vendor" |

### `items`
| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | |
| `body` | text | nullable |
| `type` | enum | `inbox`, `action`, `waiting`, `resource` |
| `subtype` | enum | sesuai tabel 3.1, null saat masih `inbox` |
| `status` | enum | `open`, `done` |
| `area_id` | uuid | FK, wajib terisi saat keluar dari inbox |
| `project_id` | uuid | FK, nullable (item boleh menempel langsung ke Area) |
| `person_id` | uuid | FK `people`, dipakai oleh `action/question` dan seluruh `waiting` |
| `source_meeting_id` | uuid | FK `meetings`, nullable |
| `due_date` | date | nullable |
| `waiting_since` | date | diisi saat tipe menjadi `waiting` |
| `answer` | text | nullable, jawaban atas question/waiting |
| `created_at` / `updated_at` | timestamptz | |
| `done_at` | timestamptz | nullable |
| `archived_at` | timestamptz | nullable |

### `item_relations`
| Kolom | Tipe | Catatan |
|---|---|---|
| `from_item_id` / `to_item_id` | uuid | FK `items` |
| `relation_type` | enum | `derived_from`, `related_to` |

### `meetings`
| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | |
| `meeting_date` | date | diisi manual, menjadi sumber "agenda hari ini" |
| `area_id` / `project_id` | uuid | **wajib** salah satu |
| `agenda` / `notes` / `conclusion` | text | |

### `meeting_attendees`
| Kolom | Tipe |
|---|---|
| `meeting_id` / `person_id` | uuid |

### `daily_snapshots`
| Kolom | Tipe | Catatan |
|---|---|---|
| `id` | uuid | PK |
| `date` | date | unik |
| `item_ids` | uuid[] | maksimal 3 |
| `completed_item_ids` | uuid[] | terisi saat item di-done pada tanggal itu |
| `morning_review_completed_at` | timestamptz | nullable |

Snapshot tidak pernah dihapus — riwayatnya adalah inti fitur.

---

## 5. Spesifikasi fitur

### 5.1 Capture

Titik masuk tercepat. Satu field teks, satu tombol simpan. Tidak ada field wajib lain.

Kriteria penerimaan:
- Dapat diakses dalam satu ketukan dari home screen (PWA shortcut).
- Berfungsi **tanpa koneksi**: tersimpan di IndexedDB, disinkronkan otomatis saat online.
- Item hasil capture masuk sebagai `type = inbox`, tanpa Area/Project.
- Indikator jumlah item yang belum tersinkron terlihat jelas.

### 5.2 Inbox & Clarify

Satu kartu penuh di layar, sisanya memudar di belakang. Daftar penuh sengaja dihindari karena mengundang pengguna mengambil yang paling mudah.

Alur per item: pilih tipe → pilih sub-tipe → pilih Project/Area → simpan.

Kriteria penerimaan:
- Item tidak dapat keluar dari Inbox tanpa Area/Project terisi.
- Jika `subtype = question` atau tipe `WAITING`, field `person` wajib diisi.
- Tipe `WAITING` otomatis mengisi `waiting_since` dengan tanggal hari itu.
- Peringatan muncul bila Area `Uncategorized` memuat lebih dari 10 item.

### 5.3 People

Master data dengan layar CRUD sederhana.

Kriteria penerimaan:
- Tersedia tombol "+ orang baru" **inline** di dalam pemilih person, agar capture cepat tidak terputus.
- Halaman detail orang menampilkan seluruh `question` dan `waiting` terkait orang tersebut.

### 5.4 Meeting Note

Form berisi judul, tanggal, Area/Project (wajib), attendees, agenda, catatan, kesimpulan.

Di dalam form terdapat tombol inline **+Action / +Waiting / +Resource**.

Kriteria penerimaan:
- Item yang dibuat lewat tombol tersebut **langsung menjadi Open Item**, tidak melalui Inbox — clarify sudah terjadi di ruang meeting.
- Item mewarisi Area/Project dari Meeting Note dan menyimpan `source_meeting_id`.
- Saat membuat Meeting Note, daftar `question` milik attendees ditampilkan otomatis sebagai bahan agenda.

> Ini membatalkan prinsip di dokumen kebutuhan awal ("tidak ada output meeting yang langsung menjadi pekerjaan aktif"). Memaksanya lewat Inbox hanya menghasilkan pengetikan ulang informasi yang sudah lengkap.

### 5.5 Waiting & sodokan

Kriteria penerimaan:
- Item `WAITING` dengan `waiting_since` lebih dari **3 hari** ditandai *perlu ditagih*.
- Item `action/question` yang berumur lebih dari **7 hari** ikut ditandai. Ambangnya lebih longgar karena pertanyaan menunggu kesempatan bertemu, bukan menunggu orang bertindak.
- Ambang bersifat seragam, tidak dapat diatur per item.

### 5.6 Siklus Question

1. Pertanyaan di-capture, menjadi `action/question`, diisi `person`.
2. Muncul otomatis saat menyusun Meeting Note dengan orang tersebut.
3. Setelah dijawab, jawaban ditulis di field `answer`.
4. Pengguna memilih: buat `ACTION` baru, atau simpan sebagai `RESOURCE`. Item baru ditautkan `derived_from` ke question asalnya.

Pola yang sama berlaku untuk item `WAITING` yang akhirnya terjawab.

### 5.7 Top 5 — "Today's winning"

Bukan daftar prioritas, melainkan bukti bahwa hari itu menghasilkan sesuatu.

Kriteria penerimaan:
- Berbentuk snapshot harian, bukan flag yang menempel di item.
- Item yang belum selesai otomatis terbawa ke snapshot hari berikutnya.
- **Hitungan hari terbawa ditampilkan mencolok** pada setiap item. Item yang bertahan lima hari adalah kekalahan beruntun dan angkanya harus terlihat.
- Riwayat snapshot dapat ditelusuri: hari mana yang punya kemenangan, hari mana yang kosong.

### 5.8 Morning Review

Layar berurutan lima langkah, bukan dashboard. Dashboard menuntut pengguna memilih mau melihat apa, padahal pagi hari adalah saat pengguna paling tidak ingin memilih.

| # | Langkah | Isi |
|---|---|---|
| 1 | Sapu sumber | Cek email, WhatsApp, Teams — capture yang relevan. Ditandai selesai manual, tanpa checklist atau timer |
| 2 | Kosongkan inbox | Clarify satu per satu |
| 3 | Sodokan | `waiting` > 3 hari dan `question` > 7 hari. Pilih: tagih hari ini, atau tunda |
| 4 | Agenda hari ini | Meeting bertanggal hari ini + question milik attendees-nya |
| 5 | Pilih Top 5 | Carryover sudah terisi; tinggal tambah atau buang |

Kriteria penerimaan:
- Tombol **Mulai hari** tidak aktif sebelum Inbox kosong dan Top 3 terisi.
- Tombol tetap terlihat dalam keadaan mati, disertai alasannya. Menyembunyikannya akan terasa seperti aplikasi rusak.
- Langkah berikutnya tampil sebagai daftar redup berisi angka. Pengguna tahu apa yang menanti, tapi tidak bisa melompat.

> **Risiko yang diterima.** Langkah 1 tidak punya garis akhir. Bila review sering tidak sampai langkah 5, penyebabnya hampir pasti di sana.

### 5.9 End of Day Review

Cermin dari morning review:

1. Tandai yang selesai hari ini.
2. Perbarui `WAITING` — ada yang sudah dijawab?
3. Item overdue — geser tanggal, atau akui bahwa itu bukan prioritas.
4. Catat satu hal pertama untuk besok, menjadi kandidat Top 3 pagi berikutnya.

### 5.10 Dashboard

Pembagian peran yang tegas: **Morning Review adalah alur yang dijalani** (punya urutan dan titik selesai), **Dashboard adalah keadaan yang dilihat** (tanpa urutan).

Isi:
- Seluruh Open Item — `action`, `waiting`, `question` — tanpa penyaringan.
- Kalender dengan mode harian / mingguan / bulanan.

Kriteria penerimaan kalender:
- Menumpuk semua jenis tanggal dengan warna berbeda: due date, tanggal dibuat, tanggal meeting.
- Toggle per jenis tanggal tersedia di atas kalender.
- **`tanggal dibuat` mati secara default.** Bila semua menyala, satu item muncul dua kali sehingga tampilan bulanan terlihat dua kali lebih padat daripada kenyataannya.

### 5.11 Search

Mengindeks judul item, isi item, dan **isi Meeting Note** — sehingga sesuatu yang hanya sempat disinggung dalam catatan diskusi tetap dapat ditemukan tanpa perlu mengingat item mana yang lahir darinya.

Menggunakan full-text search Postgres.

### 5.12 Arsip

- Pengarsipan Project bersifat **manual**.
- Item `ACTION` dan `WAITING` ikut terarsip bersama Project-nya.
- **`RESOURCE` tidak pernah diarsip.** Tetap aktif dan dapat dicari selamanya, dengan tautan Project/Area tetap melekat agar konteksnya tidak hilang.

### 5.13 Export

Satu tombol export seluruh data ke JSON dan CSV. Tidak ada fitur restore di UI — pemulihan ditangani di level database.

---

## 6. Non-fungsional

| Aspek | Target |
|---|---|
| Capture | Dapat dibuka dan disimpan dalam 5 detik, termasuk saat offline |
| Sinkronisasi | Otomatis saat koneksi kembali, tanpa aksi pengguna |
| Layout | Mobile-first; desktop menggunakan layout yang sama dengan lebar lebih longgar |
| Data | Tidak ada penghapusan permanen selain lewat aksi eksplisit |

---

## 7. Urutan pembangunan

Meskipun seluruh fitur akan dibangun, urutan ini disarankan agar taksonomi teruji sebelum dikunci:

**Tahap 1 — inti.** Capture (offline), Inbox, Clarify, Open Items, Area/Project, People.

**Jeda: pakai selama satu minggu.** Tujuannya bukan menghemat waktu, melainkan menemukan item pertama yang tidak jelas masuk tipe mana — sebelum Dashboard, kalender, dan Review dibangun di atas taksonomi yang belum terbukti.

**Tahap 2.** Meeting Note dengan tombol inline, siklus Question, sodokan.

**Tahap 3.** Morning Review, End of Day Review, Top 5 beserta riwayatnya.

**Tahap 4.** Dashboard, kalender, Search, Export.

---

## 8. Perubahan dari dokumen kebutuhan awal

| Perubahan | Alasan |
|---|---|
| 9 hasil clarify → 3 tipe + sub-tipe | Tipe yang tumpang tindih membuat clarify ragu, inbox menumpuk, sistem mati |
| Parking Lot → `action/question` + field person | Isinya pertanyaan untuk orang lain; bolanya di tangan pengguna |
| Output meeting tidak wajib lewat Inbox | Clarify sudah terjadi di ruang meeting |
| Audit Trail dibuang | Tidak bernilai untuk single-user |
| Recent activity dibuang | Memerlukan Audit Trail yang sudah dimatikan |
| Backup & Restore → Export saja | Backup adalah urusan infrastruktur database |
| Top 5 → snapshot harian "Today's winning" | Fungsinya bukti hasil harian, bukan penanda prioritas |
| Ditambahkan: master data People | Diperlukan agar daftar pertanyaan dapat dikelompokkan per orang |
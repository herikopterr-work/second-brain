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
| `item_ids` | uuid[] | maksimal 5 |
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
- Tombol **Mulai hari** tidak aktif sebelum Inbox kosong dan Top 5 terisi.
- Tombol tetap terlihat dalam keadaan mati, disertai alasannya. Menyembunyikannya akan terasa seperti aplikasi rusak.
- Langkah berikutnya tampil sebagai daftar redup berisi angka. Pengguna tahu apa yang menanti, tapi tidak bisa melompat.

> **Risiko yang diterima.** Langkah 1 tidak punya garis akhir. Bila review sering tidak sampai langkah 5, penyebabnya hampir pasti di sana.

### 5.9 End of Day Review

Cermin dari morning review:

1. Tandai yang selesai hari ini.
2. Perbarui `WAITING` — ada yang sudah dijawab?
3. Item overdue — geser tanggal, atau akui bahwa itu bukan prioritas.
4. Catat satu hal pertama untuk besok, menjadi kandidat Top 5 pagi berikutnya.

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

## 6. UI & Design System

Sistem desain bernama **Cognitive Clarity (Sage Palette)**. Filosofinya: meredam kelelahan mata selama sesi kerja intensif, membedakan status GTD secara visual tanpa warna yang berteriak, dan menjaga ritme layout yang rapi tanpa ruang mati.

Referensi layar yang sudah didesain: Dashboard Desktop dan Inbox & Clarify Hub.

---

### 6.1 Warna

#### Surfaces & Backgrounds
| Token | Hex | Penggunaan |
|---|---|---|
| `canvas-bg` | `#e2e8e3` | Latar dasar kanvas aplikasi |
| `surface-container-lowest` | `#ffffff` | Kartu utama, sidebar |
| `surface-container-low` | `#f8faf8` | Sub-area / header nested di dalam kartu |
| `surface-container-muted` | `#f0f3f0` | Tag, badge netral, input search, hover state |
| `surface-capture-banner` | `#fceee2` | Kartu Quick Capture (kontras hangat) |
| `surface-dark-active` | `#2d3b36` | Navigasi aktif sidebar, tanggal kalender aktif |

#### Typography & Text
| Token | Hex | Penggunaan |
|---|---|---|
| `text-primary` | `#1b2420` | Judul utama, angka metrik, label penting |
| `text-secondary` | `#4a5550` | Deskripsi, label input, status waktu |
| `text-muted` | `#7a8880` | Placeholder, metadata, breadcrumb |
| `text-on-dark` | `#ffffff` | Teks di atas elemen aktif gelap |
| `text-danger-critical` | `#c2410c` | Sodokan > 3 hari, carryover berulang |
| `text-success` | `#15803d` | Done, Zero Inbox, Streak |

#### Borders
| Token | Hex | Penggunaan |
|---|---|---|
| `border-subtle` | `#e2e7e3` | Pembatas kartu, separator list, border input |
| `border-emphasis` | `#cbd5ce` | Elemen fokus, pemisah kolom utama |
| `border-capture` | `#f6d2b5` | Border kartu Quick Capture |

#### Badge & Aksen Semantik
| Token | Background | Text | Penggunaan |
|---|---|---|---|
| `badge-action` | `#e8edf2` | `#1e3a5f` | Item tipe `ACTION` |
| `badge-waiting` | `#fef3c7` | `#92400e` | Item tipe `WAITING` |
| `badge-resource` | `#e7f2eb` | `#166534` | Item tipe `RESOURCE` |
| `badge-critical` | `#fee2e2` | `#b91c1c` | Ambang terlampaui (> 3 hari / > 7 hari) |
| `button-capture` | `#a35825` | `#ffffff` | Tombol submit Quick Capture |

---

### 6.2 Tipografi

Font utama: **Inter**. Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. Monospace opsional (ID/kode): `JetBrains Mono`.

| Skala | Ukuran | Weight | Penggunaan |
|---|---|---|---|
| Display / H1 | `24px` | 700 | Judul halaman, salam header |
| Heading / H2 | `18px` | 600 | Judul kartu |
| Subheading / H3 | `14px` | 600 | Judul section list, judul task |
| Body Regular | `13px` | 400 | Keterangan, deskripsi agenda |
| Body Medium | `13px` | 500 | Label metadata, tanggal, tombol aksi |
| Caption | `11px` | 500–600 | Badge GTD, status pill |
| Metric Large | `28px` | 700 | Angka counter metrik di Dashboard |

---

### 6.3 Spacing & Radius

**Grid:** kelipatan 4px / 8px.
- `space-xs`: 4px · `space-sm`: 8px · `space-md`: 12–16px · `space-lg`: 20–24px · `space-xl`: 32px

**Border radius:**
- `radius-sm`: 6px — badge, pill, tombol sekunder
- `radius-md`: 10px — input, item agenda
- `radius-lg`: 16px — kartu utama, kalender
- `radius-xl`: 20–24px — kontainer luar, sidebar
- `radius-full`: 9999px — avatar, dot indikator

**Shadow:**
- Surface: `0 2px 8px -2px rgba(27,36,32,0.04), 0 1px 3px 0 rgba(27,36,32,0.02)`
- Hover: `0 4px 14px -3px rgba(27,36,32,0.08)`
- Header: `0 1px 3px 0 rgba(0,0,0,0.02)`

---

### 6.4 Layout Desktop

CSS Grid 3 kolom:

```
[Sidebar 250–280px] [Main content flex-grow] [Schedule panel 360–400px]
```

Seluruh kontainer sejajar pada batas atas dan bawah kanvas. Tidak ada ragged edges atau ruang kosong.

Kartu-kartu sejajar tingginya (*equal-height containers*) dengan `overflow-y: auto` dan scrollbar tipis bila konten melebihi area pandang.

---

### 6.5 Spesifikasi komponen per layar

#### Dashboard

**Header Bar**
- Kiri: avatar bundar + nama pengguna + badge verifikasi + teks sambutan
- Kanan: search global (`⌘K`), ikon notifikasi, tombol `+ Capture` gelap kontras

**Quick Capture Banner** (selalu terlihat di atas konten)
- Format satu baris horizontal ramping
- Ikon petir aksen terracotta di kiri
- Input teks bersih, placeholder: `"Ketik apa saja yang terlintas di kepala lalu tekan Enter untuk simpan ke Inbox..."`
- Badge keyboard `↵ Enter` kecil di kanan
- Tombol submit bulat/persegi halus warna `#a35825`

**Total Overview · GTD State** (4 kartu metrik sejajar)
- Open Items — jumlah dengan ikon filter
- Waiting — jumlah dengan ikon hourglass
- Questions Critical — jumlah yang melampaui 7 hari, teks merah `text-danger-critical`
- Top 5 Streak — jumlah hari berturut-turut, ikon api bila streak aktif

**Weekly GTD Velocity & Completion** (chart batang)
- Dua seri: Selesai (sage muted) dan Aktif (dark charcoal)
- Sumbu X: hari dalam minggu (M–S)
- Toggle: Minggu Ini / pilihan lain
- Tooltip: label persentase velocity di titik tertinggi

**Top 5: Today's Winning**
- Header: ikon target, teks `"Top 5: Today's Winning"`, badge `"Terkunci Hari Ini"`, tombol `+ Add`
- Per item: checkbox bulat · judul · penanda carryover mencolok (`▲ 3 hari terbawa` merah / `Hari ke-1`) · badge durasi (`90m`, `45m`) · tanggal jatuh tempo
- Tinggi kartu sejajar presisi dengan kartu Sodokan

**Schedule Panel** (kolom kanan)
- Header: nama bulan + navigasi ← →  + tombol `See All`
- Date strip horizontal: tampilkan 5 hari, aktif dengan background `#2d3b36` teks putih
- Search schedule (`⌘1`) + filter pill: `Semua [n]` · `Action [n]` · `Waiting [n]`
- Item list: jam · badge tipe · judul · tombol Done cepat di kanan untuk ACTION dan WAITING
- Item dapat di-expand untuk melihat detail (attendees, Question yang menunggu, link platform)

**Sidebar Navigation**
- Brand: logo + subtitle `GTD • PARA Hub`
- Quick search (`⌘F`)
- Grup *Main*: Dashboard · Morning Review (dengan status `✓ Done` atau `Active`) · Inbox/Capture (badge counter) · People & Contacts · Meetings · PARA Archive
- Grup *Others*: Resources · Settings (badge counter) · Support
- Footer: card profil mini + status mode (`Deep Focus Mode`)

---

#### Inbox & Clarify Hub

**Header Halaman**
- Judul `Inbox & Clarify Hub` + badge status antrean (hijau: `Item Menanti`)
- Subjudul filosofi: *"Kecepatan capture di atas kerapian data. Satu pertanyaan saat clarify: Bola ada di tangan siapa?"*
- Kanan atas: indikator `Tersinkronisasi · Siap Offline (PWA)`

**Quick Capture** (tetap ada di halaman ini)
- Sama seperti banner Dashboard, ditambah baris **Sumber Cepat**: `Teks / Ide` · `Suara (Whisper AI)` · `WhatsApp / Chat` · `Meeting Snippet` · `Email Forward`

**Fokus Clarify** (area utama tengah)
- Label: `Fokus Clarify · Kartu 1 dari N dalam antrean` + indikator FIFO
- Kartu item aktif: sumber tangkapan · waktu diterima · konten mentah dalam kotak abu
- **Langkah 1 — Koreografi GTD:** tiga pilihan besar sejajar: `ACTION` · `WAITING` · `RESOURCE`, masing-masing dengan deskripsi singkat. Yang dipilih diberi border tegas / background aksen
- **Langkah 2 — Struktur PARA:** dropdown Area (wajib) + dropdown Project
- **Langkah 3 — Konteks Tambahan:** pill sub-tipe · pemilih orang (+ Orang Baru inline) · target selesai · estimasi durasi (pill: 15m · 30m · 45m · 60m+)
- Tombol bawah: `Tunda ke Nanti (Skip)` (sekunder) + `Simpan & Lanjut Item Berikutnya (N tersisa)` (primer gelap)
- Antrean berikutnya memudar di bawah kartu aktif, tidak dapat diklik (FIFO)

**Panel Kanan Inbox**
- **Aturan Clarify 2-Menit**: boks instruksional (butuh > 2m → ACTION, orang lain → WAITING, bahan bacaan → RESOURCE)
- **Status Antrean Inbox**: pending saat ini · overdue > 24 jam · progres bar Uncategorized (mis. `2 / 10 Maks`)
- **Master People Sering Terlibat**: daftar orang dengan badge jumlah Waiting dan Tanya, tombol `+ Tambah Kontak Cepat`
- **Filosofi Eksekutif**: kutipan pengingat di bagian bawah

---

### 6.6 Aturan interaksi

- Item selesai: teks dicoret (`text-decoration: line-through`) + opacity `0.6`, seketika tanpa animasi panjang
- Hover kartu: shadow meningkat ke level `Interactive Hover Shadow`
- Satu kartu clarify aktif penuh, kartu berikutnya `opacity: 0.4` — tidak dapat diklik sampai yang aktif diselesaikan atau di-skip
- State `text-danger-critical` muncul otomatis bila ambang hari terlampaui — tidak perlu aksi pengguna

---

## 7. Non-fungsional

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
| Top 5 → snapshot harian "Today's winning" | Fungsinya bukti hasil harian, bukan penanda prioritas (maksimal 5 item) |
| Ditambahkan: master data People | Diperlukan agar daftar pertanyaan dapat dikelompokkan per orang |
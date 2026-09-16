# Panduan Coding Agent — Second Brain
Untuk Antigravity · Ditulis untuk Pemula

---

## Cara membaca panduan ini

Setiap langkah punya tiga bagian:

- **Konteks** — kenapa langkah ini ada
- **Perintah** — teks yang Anda copy-paste ke Antigravity
- **Uji verifikasi** — yang Anda lakukan sendiri untuk memastikan berhasil

Perintah ditulis dalam kotak abu. Salin seluruh isinya, jangan diringkas.

Satu aturan yang tidak boleh dilanggar: **satu langkah per sesi**. Antigravity sanggup mengerjakan banyak hal sekaligus, tapi kalau dua hal dibangun bersamaan dan ada yang rusak, Anda tidak akan tahu yang mana penyebabnya.

---

## Sebelum mulai — siapkan tiga file ini di folder yang sama

Unduh ketiga file berikut dari percakapan ini dan simpan dalam satu folder bernama `second-brain-docs`:

- `prd-second-brain.md` — spesifikasi lengkap termasuk desain
- `implementasi-second-brain.md` — urutan pembangunan
- `panduan-coding-agent.md` — panduan ini sendiri

Setiap sesi Antigravity, lampirkan `prd-second-brain.md` sebagai konteks utama.

---

# BAGIAN A — Persiapan (lakukan sekali)

## A.1 Pasang Node.js

Node.js adalah mesin yang menjalankan aplikasi di komputer Anda sebelum dipublikasikan.

1. Buka **nodejs.org**
2. Klik tombol besar bertulisan **LTS** (bukan Current)
3. Unduh dan pasang seperti aplikasi biasa — klik Next terus sampai selesai

**Cek berhasil:**
Buka Terminal (Mac: tekan `Cmd+Space`, ketik "Terminal") atau Command Prompt (Windows: tekan `Win+R`, ketik "cmd").

Ketik perintah berikut lalu tekan Enter:
```
node --version
```

Kalau muncul angka seperti `v20.11.0` — berhasil.
Kalau muncul "not found" — restart komputer lalu coba lagi.

---

## A.2 Buat akun Supabase

Supabase adalah tempat seluruh data Anda disimpan di internet.

1. Buka **supabase.com**
2. Klik **Start your project** → daftar dengan akun Google
3. Klik **New project**
4. Isi kolom-kolom berikut:
   - **Name:** `second-brain`
   - **Database Password:** buat password kuat, **catat di tempat aman — tidak bisa dilihat lagi nanti**
   - **Region:** Southeast Asia (Singapore)
5. Klik **Create new project** — tunggu sekitar 2 menit sampai status berubah hijau

**Ambil dua kunci penting:**
1. Klik **Settings** (ikon gerigi di sidebar kiri bawah)
2. Klik **API**
3. Salin dua hal ini ke Notepad:
   - **Project URL** — terlihat seperti `https://abcxyz.supabase.co`
   - **anon public** — string panjang di bawah "Project API keys"

Dua kunci ini akan diminta nanti.

---

## A.3 Buat akun GitHub dan Vercel

GitHub menyimpan kode Anda. Vercel mempublikasikannya ke internet.

**GitHub:**
1. Buka **github.com** → Sign up → ikuti langkah pendaftaran
2. Pilih plan gratis

**Vercel:**
1. Buka **vercel.com**
2. Klik **Sign Up** → pilih **Continue with GitHub**
3. Izinkan Vercel mengakses GitHub Anda

---

## A.4 Buka Antigravity dan siapkan proyek

1. Buka Antigravity
2. Klik **New Project**
3. Beri nama `second-brain`
4. Pilih mode **Agent-assisted** (bukan Agent-driven)
5. Lampirkan file `prd-second-brain.md` ke konteks — biasanya ada tombol "Add context" atau ikon klip

---

# BAGIAN B — Membangun

---

## Langkah 1 — Buat kerangka aplikasi

**Konteks:** Ini fondasi tempat semua fitur akan dibangun. Harus selesai dan berjalan sebelum langkah lain dimulai.

**Perintah untuk Antigravity:**

```
Buatkan project Next.js baru dengan konfigurasi berikut:
- TypeScript
- Tailwind CSS
- App Router
- Nama folder: second-brain

Setelah selesai:
1. Pasang package Supabase: @supabase/supabase-js dan @supabase/ssr
2. Buat file .env.local dengan placeholder untuk NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Buat file helper koneksi Supabase untuk sisi klien (browser) dan sisi server
4. Jalankan server lokal dan tunjukkan alamat yang harus saya buka

Tunjukkan di baris mana tepatnya saya harus mengisi URL dan anon key Supabase saya.
```

Setelah agen selesai, isi file `.env.local` dengan dua kunci Supabase dari langkah A.2.

**Uji verifikasi:**
Buka `localhost:3000` di browser. Halaman muncul tanpa error merah = berhasil.

---

## Langkah 2 — Publikasikan ke internet

**Konteks:** Dilakukan sekarang, saat aplikasi masih kosong. Aplikasi ini akan dipakai dari HP. Kalau baru dipublikasikan di akhir, semua pengujian terjadi di laptop dan Anda tidak akan tahu mana tombol yang terlalu kecil untuk jempol.

**Perintah untuk Antigravity:**

```
Bantu saya mempublikasikan project ini ke internet lewat GitHub dan Vercel.

Tuntun saya langkah demi langkah:
1. Cara membuat repository baru di GitHub dari folder ini
2. Cara menghubungkan repository ke Vercel
3. Cara menambahkan environment variable Supabase di dashboard Vercel (NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY)
4. Cara memastikan setiap kali saya simpan perubahan, Vercel otomatis memperbarui

Tuliskan perintah git yang harus saya ketik satu per satu, jangan gabungkan.
```

**Uji verifikasi:**
Buka URL Vercel dari **HP** (bukan laptop). Halaman terbuka = berhasil. Mulai sekarang setiap perubahan otomatis terpublikasikan.

---

## Langkah 3 — Buat struktur database

**Konteks:** Ini "lemari arsip" tempat semua data disimpan. Constraint yang dipasang di sini mencegah data rusak dari sumbernya — lebih andal daripada mengandalkan form.

**Perintah untuk Antigravity:**

```
Berdasarkan bagian 4 (Model Data) di PRD terlampir, buatkan satu file SQL lengkap untuk dijalankan di Supabase SQL Editor.

File SQL ini harus:
1. Membuat semua tabel dalam urutan yang benar sesuai dependensinya: areas → projects → people → meetings → items → item_relations → meeting_attendees → daily_snapshots
2. Menambahkan semua kolom dan tipe data persis seperti di PRD
3. Menambahkan constraint berikut:
   - projects.area_id NOT NULL
   - items: wajib punya area_id kecuali kalau type = 'inbox'
   - items: person_id wajib diisi kalau type = 'waiting' atau subtype = 'question'
4. Mengaktifkan Row Level Security di setiap tabel dengan policy "hanya pemilik yang bisa akses" menggunakan auth.uid()
5. Menambahkan kolom user_id uuid default auth.uid() di setiap tabel
6. Mengisi satu baris Area default: name = 'Uncategorized', is_default = true

Berikan hasilnya sebagai satu blok SQL yang bisa langsung saya tempel dan jalankan.
```

**Cara menjalankan SQL-nya:**
1. Buka **supabase.com** → proyek Anda
2. Klik **SQL Editor** di sidebar kiri
3. Klik **New query**
4. Tempel seluruh SQL dari agen
5. Klik **Run**

**Uji verifikasi:**
Klik **Table Editor** di sidebar Supabase. Harus muncul 8 tabel. Klik tabel `areas` — harus ada satu baris bertulisan "Uncategorized".

---

## Langkah 4 — Buat sistem login

**Konteks:** Single-user, jadi login sesederhana mungkin. Magic link berarti Anda hanya perlu memasukkan email dan klik tautan yang dikirim — tidak ada password.

**Perintah untuk Antigravity:**

```
Buatkan sistem autentikasi Supabase dengan magic link untuk aplikasi single-user ini.

Yang dibutuhkan:
1. Halaman login di /login dengan form email dan tombol "Kirim Magic Link"
2. Halaman callback di /auth/callback untuk menangkap sesi setelah klik tautan
3. Middleware yang melindungi semua halaman kecuali /login — pengguna yang belum login otomatis diarahkan ke /login
4. Komponen kecil di header untuk menampilkan email pengguna dan tombol logout

Setelah selesai, tunjukkan cara mematikan pendaftaran publik di dashboard Supabase supaya hanya akun saya yang bisa masuk.
```

**Uji verifikasi:**
1. Buka aplikasi tanpa login — harus langsung diarahkan ke halaman login
2. Masukkan email Anda → cek email → klik magic link → masuk ke aplikasi
3. Buka URL lain (misal `/dashboard`) tanpa login — harus diarahkan ke login

---

## Langkah 5 — Capture offline

**Konteks:** Ini bagian paling teknis dan paling penting. Dikerjakan sekarang karena kalau ditunda, akan terus tertunda. Capture yang gagal = sistem yang mati.

**Perintah untuk Antigravity:**

```
Buatkan fitur Capture yang berfungsi tanpa koneksi internet, sesuai spesifikasi 5.1 di PRD.

Desain visual mengikuti komponen "Quick Capture Banner" di bagian 6.5 PRD:
- Satu baris horizontal ramping
- Ikon petir warna #a35825 di sebelah kiri
- Input teks tanpa border kaku, placeholder: "Ketik apa saja yang terlintas di kepala lalu tekan Enter untuk simpan ke Inbox..."
- Badge keyboard ↵ Enter kecil di kanan
- Tombol submit bulat warna #a35825

Cara kerjanya:
1. Pengguna mengetik dan menekan Enter atau klik tombol
2. Item langsung tersimpan ke IndexedDB (gunakan library Dexie.js) dengan status 'pending'
3. Konfirmasi muncul seketika — TIDAK menunggu jaringan
4. Background sync mengirim item 'pending' ke Supabase saat online, lalu tandai 'synced'
5. Setiap item diberi UUID di sisi klien (bukan dari database) agar sinkronisasi tidak duplikat kalau diulang
6. Indikator jumlah item pending muncul di header, hilang saat semua tersinkron
7. Item masuk ke tabel items dengan type = 'inbox', tanpa area_id

Pasang Dexie.js terlebih dahulu sebelum menulis kode.
```

**Uji verifikasi — WAJIB dilakukan di HP:**
1. Buka aplikasi di HP lewat URL Vercel
2. **Nyalakan mode pesawat**
3. Ketik dan simpan 3 catatan berbeda
4. Cek header — harus muncul "3 pending"
5. **Matikan mode pesawat**, tunggu 10 detik
6. Buka Supabase → Table Editor → tabel `items`
7. Harus ada **tepat 3 baris** — tidak lebih, tidak kurang

Kalau muncul 6 baris: laporkan ke agen dengan kalimat ini:
> "Capture offline menghasilkan duplikat setelah online. Tolong perbaiki agar sinkronisasi idempoten menggunakan UUID klien sebagai primary key."

---

## Langkah 6 — Pasang PWA

**Konteks:** Supaya aplikasi bisa dipasang di home screen HP dan terasa seperti aplikasi sungguhan, bukan website.

**Perintah untuk Antigravity:**

```
Ubah aplikasi ini menjadi PWA yang bisa dipasang di home screen HP.

Yang dibutuhkan:
1. File manifest.json dengan nama "Second Brain", warna tema #2d3b36, display: standalone
2. Ikon aplikasi dalam ukuran 192x192 dan 512x512 (buat dengan warna dan inisial "SB" jika tidak ada gambar)
3. Service worker yang:
   - Menyimpan shell aplikasi untuk dibuka offline
   - TIDAK mengganggu IndexedDB sync yang sudah dibuat di langkah sebelumnya
4. Meta tag yang diperlukan di layout utama

Gunakan next-pwa atau implementasi manual — pilih yang lebih stabil untuk Next.js App Router.
```

**Uji verifikasi:**
1. Buka aplikasi di HP lewat Chrome atau Safari
2. Cari opsi "Tambahkan ke Layar Utama" di menu browser
3. Pasang, lalu buka dari ikon — harus terbuka tanpa address bar di atas

---

## Langkah 7 — Area, Project, People

**Konteks:** Tiga master data ini adalah "label" yang wajib ada sebelum fitur clarify bisa dibangun. Tanpa ini, pengguna tidak punya pilihan saat mengorganisir item.

**Perintah untuk Antigravity:**

```
Buatkan tiga halaman CRUD: Areas, Projects, dan People.

Gunakan design system dari bagian 6 PRD:
- Background: #e2e8e3 (canvas-bg)
- Kartu: #ffffff dengan shadow subtle
- Font: Inter
- Radius kartu: 16px

Aturan khusus yang wajib diikuti:
1. Area "Uncategorized" tidak bisa dihapus atau diubah namanya (is_default = true)
2. Saat membuat Project, dropdown Area wajib dipilih — tidak boleh ada opsi kosong
3. Di MANA PUN ada field pemilih orang (person), sediakan tombol "+ Orang Baru" langsung di dalam dropdown itu sendiri. Menambah orang baru tidak boleh membuka halaman baru atau menghilangkan isian form yang sedang diketik
4. Tampilkan semua tiga menu ini di sidebar navigasi di bawah "People & Contacts"

Sidebar navigasi mengikuti spesifikasi di bagian 6.5 PRD:
- Background sidebar: #ffffff
- Item aktif: background #2d3b36, teks putih
- Brand di atas: "Second Brain" + subtitle "GTD • PARA Hub"
```

**Uji verifikasi:**
1. Buat satu Area bernama "Pekerjaan"
2. Buat satu Project bernama "Q4 Planning" di bawah Area "Pekerjaan"
3. Di tengah-tengah membuat Project, coba tambah orang baru dari dropdown — isian Project harus tetap ada setelah orang ditambahkan
4. Coba hapus Area "Uncategorized" — harus ditolak

---

## Langkah 8 — Inbox & Clarify

**Konteks:** Jantung sistem. Tampilan satu kartu penuh bukan kebetulan — daftar mengundang Anda memilih yang paling mudah; satu kartu memaksa selesai satu per satu.

**Perintah untuk Antigravity:**

```
Buatkan halaman Inbox & Clarify Hub sesuai spesifikasi 5.2 PRD dan desain layar "Inbox & Clarify Hub" di bagian 6.5.

Layout halaman:
- Dua kolom: area clarify (kiri, lebih lebar) + panel status (kanan, lebih sempit)
- Header halaman: judul "Inbox & Clarify Hub" + badge hijau jumlah item menanti + kalimat filosofi
- Pojok kanan atas: indikator "Tersinkronisasi · Siap Offline (PWA)"

Area clarify (kolom kiri):
- Quick Capture banner (sama seperti di Dashboard) selalu terlihat di atas
- Baris Sumber Cepat di bawah capture: Teks / Ide · Suara · WhatsApp/Chat · Meeting Snippet · Email Forward (untuk sekarang cukup sebagai label, belum perlu berfungsi)
- Label "Fokus Clarify · Kartu N dari M dalam antrean" + label FIFO
- SATU kartu item aktif ditampilkan penuh
- Kartu berikutnya tampil MEMUDAR di bawah (opacity 0.4), tidak bisa diklik
- Isi kartu aktif:
  LANGKAH 1 — Pilih tipe: tiga kotak besar sejajar ACTION / WAITING / RESOURCE
  Masing-masing dengan deskripsi singkat sesuai PRD
  Yang dipilih: border tegas + background aksen sesuai badge color di bagian 6.1
  LANGKAH 2 — Pilih Area (dropdown wajib) + Project (dropdown opsional)
  LANGKAH 3 — Pilih sub-tipe (pill) + orang (muncul HANYA jika tipe WAITING atau sub-tipe question) + due date opsional + estimasi durasi (pill: 15m 30m 45m 60m+)
- Dua tombol di bawah: "Tunda ke Nanti (Skip)" (sekunder) dan "Simpan & Lanjut Item Berikutnya" (primer, warna #2d3b36)

Panel kanan:
- Kotak "Aturan Clarify 2-Menit" sesuai desain PRD
- Kotak "Status Antrean": jumlah pending + progress bar Uncategorized (peringatan merah kalau > 10)
- Kotak "Master People Sering Terlibat": tampilkan orang dengan jumlah Waiting dan Question terbanyak + tombol "+ Tambah Kontak Cepat"
- Kotak filosofi di bawah: "Daftar penuh sengaja dihindari di layar clarify agar pikiran tidak tergoda memilih item termudah. Tuntaskan satu per satu."

Logika bisnis:
- Item tidak bisa disimpan keluar dari inbox tanpa Area terisi
- Memilih tipe WAITING otomatis mengisi waiting_since dengan tanggal hari ini
- Field person wajib dan muncul hanya untuk WAITING dan question
- Setelah simpan, kartu berikutnya masuk otomatis tanpa reload halaman
```

**Uji verifikasi:**
Ambil 3 item yang sudah ada di inbox dari langkah sebelumnya. Clarify ketiganya berturut-turut. Anda tidak boleh sekali pun menekan tombol Back atau navigasi di antaranya.

Coba simpan item tanpa memilih Area — harus ditolak dengan pesan yang jelas.

---

## Langkah 9 — Open Items

**Konteks:** Tempat melihat seluruh pekerjaan aktif. Berbeda dari Dashboard — ini daftar operasional, bukan ringkasan.

**Perintah untuk Antigravity:**

```
Buatkan halaman Open Items sesuai spesifikasi 5.2 PRD (bagian monitoring).

Tampilan:
- Daftar semua item dengan status 'open', dikelompokkan per tipe (ACTION / WAITING / RESOURCE)
- Setiap item menampilkan: judul · badge tipe (warna sesuai bagian 6.1 PRD) · sub-tipe · nama orang (kalau ada) · Area/Project · due date (kalau ada)
- Tombol centang (✓) di setiap item untuk tandai selesai
- Item WAITING dengan waiting_since > 3 hari: tampilkan badge merah "Perlu Ditagih" dengan warna text-danger-critical (#c2410c)
- Item action/question dengan created_at > 7 hari: tampilkan badge merah yang sama

Filter di atas daftar:
- Filter tipe: Semua · Action · Waiting · Resource
- Filter Area/Project: dropdown
- Filter orang: dropdown (tampilkan semua orang yang punya item aktif)

Banner peringatan:
- Kalau Area "Uncategorized" berisi lebih dari 10 item, tampilkan banner kuning di atas daftar:
  "⚠ Uncategorized berisi [N] item — batas aman 10. Tolong organisir sebelum menambah lebih banyak."
```

**Uji verifikasi:**
Cari "semua yang saya tunggu dari [nama orang]" menggunakan filter orang. Harus ketemu dalam dua ketukan.

---

## BERHENTI DI SINI — Pakai dulu selama 7 hari

Langkah 10 ke atas tidak boleh dimulai sebelum Anda memakai 4 layar ini setiap hari selama satu minggu.

Yang Anda cari selama seminggu:
- Tulis nama item yang bikin ragu — "ini ACTION atau WAITING ya?"
- Catat sub-tipe yang tidak pernah sekali pun Anda pilih
- Catat momen Anda memilih mencatat di tempat lain (WhatsApp ke diri sendiri, Notes HP) — itu tanda capture masih terlalu lambat

Setelah seminggu, laporkan temuan itu ke agen sebelum melanjutkan:
> "Saya sudah pakai selama seminggu. Temuan saya: [tulis di sini]. Apakah perlu ada penyesuaian sebelum lanjut ke Meeting Note?"

---

## Langkah 10 — Meeting Note

**Konteks:** Tempat mencatat meeting sekaligus langsung membuat item — tanpa perlu kembali ke inbox.

**Perintah untuk Antigravity:**

```
Buatkan halaman Meetings sesuai spesifikasi 5.4 PRD.

Form Meeting Note:
- Judul meeting (wajib)
- Tanggal meeting (wajib, diisi manual — menjadi sumber agenda harian di Dashboard)
- Area/Project terkait (wajib)
- Attendees (multi-select dari master People, opsional)
- Agenda (textarea)
- Catatan diskusi (textarea)
- Kesimpulan (textarea)

Fitur khusus di dalam form:
1. Tombol inline +Action / +Waiting / +Resource di bawah area catatan
   - Klik tombol membuka mini-form kecil langsung di dalam halaman (bukan popup terpisah)
   - Item langsung tersimpan sebagai Open Item (bukan ke Inbox)
   - Item mewarisi Area/Project dari Meeting Note
   - Item menyimpan source_meeting_id yang menunjuk ke meeting ini
   
2. Saat attendees dipilih, tampilkan otomatis daftar item type=question yang person_id-nya ada di daftar attendees tersebut
   - Tampilkan sebagai boks "Pertanyaan yang perlu ditanyakan ke [nama]"
   - Ada tombol "Tandai Terjawab" di setiap pertanyaan

Halaman daftar meeting:
- Daftar semua meeting diurutkan tanggal terbaru
- Klik meeting → buka detail + item-item yang lahir dari meeting itu
- Filter: Hari ini / Minggu ini / Semua

Gunakan warna dan tipografi dari design system bagian 6 PRD.
```

**Uji verifikasi:**
1. Buat satu meeting dengan dua attendees
2. Dari dalam form, buat satu Action dan satu Waiting
3. Buka Open Items — dua item itu harus sudah ada, bukan di Inbox
4. Klik item tersebut — harus ada tautan balik ke meeting asalnya

---

## Langkah 11 — Top 5 (Today's Winning)

**Perintah untuk Antigravity:**

```
Buatkan fitur Top 5: Today's Winning sesuai spesifikasi 5.7 PRD dan komponen 5.4 di bagian 6.5.

Catatan: Keputusan sistem adalah maksimal 5 item (Top 5).

Logika snapshot harian:
1. Setiap hari ada satu baris di tabel daily_snapshots
2. Saat hari baru dimulai, carryover otomatis: ambil item_ids dari kemarin yang statusnya masih open
3. Pengguna bisa tambah item baru (dari daftar Open Items) sampai maksimal 5
4. Snapshot tidak pernah dihapus

Tampilan komponen Top 5 (sesuai desain referensi):
- Header: ikon target · "Top 5: Today's Winning" · badge "Terkunci Hari Ini" · tombol "+ Add"
- Per item:
  · Checkbox bulat di kiri
  · Judul item
  · Penanda carryover MENCOLOK: "▲ [N] hari terbawa" dengan warna #c2410c kalau > 2 hari
  · Kalau hari pertama: label hijau "Baru"
  · Badge durasi estimasi (kalau diisi)
  · Due date
- Kalau item dicentang: judul dicoret, opacity 0.6, seketika tanpa delay panjang

Halaman riwayat:
- Tampilkan kalender atau daftar per tanggal
- Setiap tanggal menunjukkan berapa item yang selesai dari 5
- Hari dengan 5/5 selesai: latar hijau muda
- Hari dengan 0 selesai: latar abu
```

**Uji verifikasi:**
Tambah 5 item hari ini. Selesaikan dua. Besok pagi, buka aplikasi — 3 sisanya harus sudah otomatis terbawa dengan label "▲ 1 hari terbawa".

---

## Langkah 12 — Morning Review

**Perintah untuk Antigravity:**

```
Buatkan halaman Morning Review sesuai spesifikasi 5.8 PRD.

Ini adalah layar berurutan 5 langkah — BUKAN dashboard. Satu langkah terbuka penuh, langkah lain hanya terlihat sebagai baris redup berisi angka di bawahnya. Pengguna tidak bisa melompat ke langkah yang belum saatnya.

Urutan langkah:
1. Sapu Sumber
   - Instruksi: "Cek email, WhatsApp, dan Teams sekarang. Capture semua yang relevan."
   - Tombol besar: "Sudah, lanjut →" (pengguna yang menilai sendiri)
   
2. Kosongkan Inbox
   - Langsung tampilkan antarmuka Clarify yang sudah dibangun (langkah 8)
   - Tidak bisa lanjut ke langkah 3 kalau masih ada item di inbox
   
3. Sodokan
   - Tampilkan semua item WAITING > 3 hari dan question > 7 hari
   - Per item, dua pilihan: "Tagih Sekarang" (menandai untuk dikerjakan) atau "Tunda 3 Hari Lagi"
   - Bisa lanjut meski masih ada yang perlu ditagih
   
4. Agenda Hari Ini
   - Tampilkan Meeting Note yang tanggalnya sama dengan hari ini
   - Tampilkan question yang menunggu untuk attendees meeting hari ini
   - Baca saja, tidak ada aksi wajib
   
5. Pilih Top 5
   - Tampilkan komponen Top 5 yang sudah dibangun di langkah 11
   - Carryover sudah otomatis terisi
   - Bisa tambah atau buang
   - Wajib terisi minimal 1 item sebelum lanjut

Tombol "Mulai Hari":
- Tetap TERLIHAT sepanjang waktu tapi tidak bisa diklik (disabled, bukan hidden)
- Di bawah tombol ada teks kecil: "Aktif setelah inbox kosong dan Top 5 terisi"
- Setelah syarat terpenuhi: tombol aktif, warna #2d3b36

Progress di atas halaman:
- Tampilkan 5 garis kecil horizontal, garis langkah aktif penuh, sisanya redup
- Nomor langkah dan judul di atas garis
```

**Uji verifikasi:**
Jalankan Morning Review dari awal sampai selesai. Harus selesai dalam 5 menit. Kalau lebih dari 10 menit, laporkan ke agen bagian mana yang memperlambat.

---

## Langkah 13 — End of Day Review

**Perintah untuk Antigravity:**

```
Buatkan halaman End of Day Review sesuai spesifikasi 5.9 PRD.

Empat langkah berurutan (pola sama dengan Morning Review):

1. Tandai yang Selesai
   - Tampilkan Top 5 hari ini dengan checkbox
   - Pengguna mencentang yang sudah selesai

2. Perbarui Waiting
   - Tampilkan semua item WAITING milik pengguna
   - Per item: tombol "Sudah Dijawab" → buka mini-form isi jawaban dan pilih: jadikan Action baru atau simpan sebagai Resource
   - Tombol "Masih Menunggu" → lewati
   
3. Item Overdue
   - Tampilkan semua item dengan due_date < hari ini
   - Per item: dua pilihan: "Geser ke [besok]" atau "Bukan Prioritas (Hapus Due Date)"
   
4. Rencana Besok
   - Satu field teks: "Hal pertama yang akan saya kerjakan besok"
   - Isian ini masuk sebagai kandidat Top 5 untuk morning review besok
   - Opsional, bisa dilewati
```

---

## Langkah 14 — Dashboard

**Perintah untuk Antigravity:**

```
Buatkan halaman Dashboard sesuai spesifikasi 5.10 PRD dan desain layar Dashboard di bagian 6.5.

Layout tiga kolom desktop (CSS Grid):
- Sidebar: 250–280px (sudah dibangun, integrasikan)
- Konten utama: flex-grow
- Panel Schedule: 360–400px

Header Bar (di atas konten utama):
- Kiri: avatar bundar + nama pengguna + badge verifikasi + teks "Welcome back to Second Brain 👋"
- Kanan: search global dengan shortcut ⌘K · ikon notifikasi · tombol "+ Capture" warna gelap (#2d3b36)

Quick Capture Banner (tepat di bawah header):
- Satu baris ramping sesuai spesifikasi komponen 5.1 di bagian 6.5 PRD
- Ikon petir warna #a35825 · input teks · badge ↵ Enter · tombol submit

Total Overview GTD State (4 kartu metrik sejajar):
- Open Items: jumlah item status=open
- Waiting: jumlah item type=waiting
- Questions Critical: jumlah question yang berumur > 7 hari, teks merah #c2410c
- Top 5 Streak: berapa hari berturut-turut pengguna menyelesaikan minimal 1 dari Top 5

Chart "Weekly GTD Velocity & Completion" (konten utama bawah kiri):
- Bar chart per hari (M-S)
- Dua seri: Selesai (warna #9bb8a0) dan Aktif (warna #2d3b36)
- Toggle: Minggu Ini
- Tampilkan persentase velocity di bar tertinggi
- Gunakan library Recharts

Komponen Top 5 Today's Winning (konten utama bawah kanan):
- Integrasikan komponen yang sudah dibangun di langkah 11

Panel Schedule (kolom kanan):
- Header: nama bulan + navigasi ← → + tombol "See All"
- Date strip: 5 hari berurutan, hari aktif background #2d3b36 teks putih
- Search schedule + filter pill: Semua · Action · Waiting
- Daftar item: tampilkan Meeting Note hari ini + item dengan due_date hari ini
- Per item: rentang waktu (kalau meeting) · badge tipe · judul · tombol ✓ untuk Action dan Waiting
- Item bisa di-expand untuk lihat detail

Background kanvas: #e2e8e3
Semua kartu: background #ffffff, shadow subtle, radius 16px
```

**Uji verifikasi:**
Buka Dashboard dari HP. Semua bagian terlihat tanpa perlu scroll horizontal. Kartu metrik menampilkan angka yang sesuai dengan data di Supabase.

---

## Langkah 15 — Search

**Perintah untuk Antigravity:**

```
Buatkan fitur Search full-text sesuai spesifikasi 5.11 PRD.

Di Supabase, tambahkan kolom tsvector di tabel items:
- Indeks dari: title + body
- Gunakan konfigurasi 'simple' (BUKAN 'english') karena konten berbahasa Indonesia

Tambahkan juga pencarian di tabel meetings yang mengindeks: title + agenda + notes + conclusion

Buat fungsi RPC di Supabase yang menerima query teks dan mengembalikan:
- Item yang cocok (dengan highlight kata yang dicari)
- Meeting Note yang cocok

Implementasi di UI:
- Search bar di header (shortcut ⌘K) membuka modal search
- Hasil muncul real-time saat mengetik (debounce 300ms)
- Hasil dikelompokkan: Items · Meeting Notes
- Klik hasil langsung buka item atau meeting terkait
```

---

## Langkah 16 — Arsip & Export

**Perintah untuk Antigravity:**

```
Buatkan fitur Arsip dan Export sesuai spesifikasi 5.12 dan 5.13 PRD.

Arsip:
- Di halaman Projects, tambahkan tombol "Arsipkan Project"
- Saat diarsipkan: project.archived_at terisi, semua item type=action dan type=waiting milik project itu ikut terarsip
- Item type=resource TIDAK diarsipkan — tetap aktif dan bisa dicari
- Item resource tetap menyimpan project_id dan area_id aslinya agar konteks tidak hilang
- Buat halaman "PARA Archive" di sidebar: tampilkan semua project yang sudah diarsipkan beserta item-itemnya
- Di halaman Search, hasil dari project arsip tetap muncul tapi diberi label "Arsip"

Export:
- Di halaman Settings, tambahkan satu tombol "Export Semua Data"
- Klik tombol → unduh file ZIP berisi:
  · items.json dan items.csv
  · meetings.json dan meetings.csv  
  · projects.json, areas.json, people.json
  · daily_snapshots.json
- Tidak ada fitur import atau restore di UI
```

---

## Selesai

Setelah langkah 16 selesai, seluruh aplikasi sudah lengkap.

Dua hal terakhir yang disarankan setelah semua jalan:

**Optimasi mobile.** Buka setiap halaman dari HP dan catat tombol mana yang terlalu kecil atau teks yang terpotong. Laporkan ke agen: "Di HP, [nama halaman] terlihat seperti ini [deskripsi]. Tolong perbaiki layout mobile-nya."

**Backup database.** Di Supabase → Settings → Database → Backups. Aktifkan Point-in-Time Recovery kalau tersedia di plan Anda, atau atur jadwal backup manual.

---

## Ketika ada masalah

**Error merah di layar:** salin SELURUH teks error (bukan ringkasannya), tempel ke agen, tulis "ini errornya, tolong perbaiki".

**Fitur jalan tapi hasilnya salah:** jelaskan tiga hal — (1) apa yang saya klik, (2) apa yang terjadi, (3) apa yang seharusnya terjadi.

**Agen bilang selesai tapi tidak:** katakan apa adanya. "Kamu bilang sudah jalan, tapi saat saya [aksi], yang terjadi adalah [hasil]. Yang seharusnya terjadi adalah [ekspektasi]."

**Agen mengusulkan penyederhanaan:** tanyakan dulu. "Apakah usulan ini mengubah perilaku yang ada di PRD?" Kalau iya, tolak dan katakan: "Ikuti PRD, jangan sederhanakan."

**Semuanya kacau:** katakan ke agen: "Kembalikan ke commit terakhir yang berhasil sebelum langkah ini dimulai."
# Rencana Implementasi — Personal Second Brain

Next.js + Supabase · PWA · Single-user

Setiap langkah punya **definisi selesai**. Jangan lanjut sebelum terpenuhi — bukan karena aturan, tapi karena langkah berikutnya menumpuk di atasnya.

---

## Tahap 0 — Fondasi

### Langkah 0.1 — Proyek & deployment

```bash
npx create-next-app@latest second-brain --typescript --tailwind --app
```

Buat project Supabase, salin `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ke `.env.local`. Deploy kosong ke Vercel sejak awal — bukan nanti. Aplikasi ini dipakai dari HP, jadi kalau baru di-deploy di akhir, Anda tidak pernah benar-benar mengujinya di tempat ia akan hidup.

**Selesai bila:** halaman kosong terbuka dari HP lewat URL Vercel.

### Langkah 0.2 — Autentikasi

Single-user, jadi paling sederhana: Supabase Auth dengan magic link, satu akun saja. Matikan pendaftaran publik di dashboard Supabase.

Aktifkan RLS di semua tabel dengan satu policy seragam:

```sql
create policy "owner only" on items
  for all using (auth.uid() = user_id);
```

Sertakan kolom `user_id uuid default auth.uid()` di setiap tabel. Terasa berlebihan untuk satu orang, tapi tanpa RLS, anon key Anda yang terbuka di browser membuat seluruh data bisa dibaca siapa pun yang menemukan URL-nya.

**Selesai bila:** login berhasil, dan request tanpa sesi mengembalikan array kosong.

### Langkah 0.3 — Skema database

Jalankan migration sesuai bagian 4 PRD. Urutan pembuatan mengikuti dependensi: `areas` → `projects` → `people` → `meetings` → `items` → `item_relations` → `meeting_attendees` → `daily_snapshots`.

Constraint yang tidak boleh dilewat:

```sql
alter table projects alter column area_id set not null;

alter table items add constraint must_have_context
  check (type = 'inbox' or area_id is not null);

alter table items add constraint person_required
  check (
    (type = 'waiting' or subtype = 'question') and person_id is not null
    or (type != 'waiting' and subtype is distinct from 'question')
  );

alter table daily_snapshots add constraint check_max_top_items
  check (cardinality(item_ids) <= 5);
```

Seed satu baris: Area `Uncategorized` dengan `is_default = true`.

**Selesai bila:** insert item tanpa area dan tanpa tipe inbox ditolak database, bukan hanya ditolak form.

### Langkah 0.4 — PWA shell

`manifest.json`, ikon, `display: standalone`, dan service worker. Pakai `next-pwa` atau Workbox langsung.

**Selesai bila:** aplikasi terpasang di home screen HP dan terbuka tanpa address bar.

---

## Tahap 1 — Inti yang harus dipakai dulu

### Langkah 1.1 — Capture offline

Bagian paling teknis di seluruh proyek, dan yang paling menentukan apakah sistem ini hidup. Kerjakan lebih dulu, jangan disisakan.

Alurnya:

1. Form satu field, simpan ke IndexedDB (pakai `idb` atau Dexie) dengan status `pending`.
2. Tampilkan konfirmasi seketika — jangan menunggu jaringan.
3. Background sync mengirim yang `pending` ke Supabase, lalu menandainya `synced`.
4. Indikator jumlah `pending` terlihat di header.

Beri setiap item UUID **di sisi klien**, bukan dari database, agar sinkronisasi idempoten dan tidak menghasilkan duplikat saat percobaan ulang.

**Selesai bila:** HP dalam mode pesawat, capture 3 item, matikan mode pesawat, ketiganya muncul di Supabase tanpa duplikat.

### Langkah 1.2 — Areas, Projects, People

Tiga layar CRUD sederhana. Yang penting bukan tampilannya, melainkan dua hal:

- Project wajib memilih Area — dropdown tanpa opsi kosong.
- Pemilih person punya tombol "+ orang baru" **inline**. Kalau menambah orang berarti pindah halaman, capture cepat Anda mati di sana.

**Selesai bila:** Anda bisa menambah orang baru dari tengah-tengah form tanpa kehilangan isian yang sudah diketik.

### Langkah 1.3 — Inbox & Clarify

Satu kartu penuh, sisanya memudar di belakang. Urutan kontrol: tipe → sub-tipe → Project/Area.

Logika yang perlu diperhatikan:

- Sub-tipe berubah mengikuti tipe yang dipilih.
- `person` muncul dan menjadi wajib hanya untuk `waiting` dan `question`.
- Memilih `waiting` mengisi `waiting_since` dengan tanggal hari itu.
- Setelah simpan, kartu berikutnya masuk — tanpa kembali ke daftar.

**Selesai bila:** tiga item bisa diclarify berturut-turut tanpa satu pun ketukan navigasi.

### Langkah 1.4 — Open Items

Daftar dengan filter tipe, Area/Project, dan person. Tombol tandai selesai.

Peringatan `Uncategorized` muncul di sini: banner bila isinya melewati 10 item.

**Selesai bila:** Anda bisa menemukan "semua yang saya tunggu dari Rina" dalam dua ketukan.

---

## Jeda — pakai selama satu minggu

Berhenti membangun. Pakai keempat layar itu setiap hari selama tujuh hari.

Yang dicari selama seminggu:

- Item yang bikin ragu masuk tipe mana. Catat kalimat aslinya.
- Sub-tipe yang tidak pernah sekali pun Anda pilih.
- Momen Anda memilih mencatat di tempat lain — itu menandai capture yang masih terlalu lambat.

Kalau ada tipe yang tak pernah terpakai atau selalu bikin ragu, perbaiki sekarang. Setelah Tahap 3 dibangun di atasnya, mengubah taksonomi berarti membongkar Morning Review, Dashboard, dan kalender sekaligus.

---

## Tahap 2 — Meeting & sodokan

### Langkah 2.1 — Meeting Note

Form dengan judul, tanggal, Area/Project wajib, attendees, agenda, catatan, kesimpulan.

Tombol inline **+Action / +Waiting / +Resource** membuat item yang langsung berstatus open, mewarisi Area/Project, dan menyimpan `source_meeting_id`.

Saat attendees dipilih, tampilkan otomatis daftar `question` milik orang-orang itu sebagai bahan agenda.

**Selesai bila:** satu meeting bisa dicatat dan menghasilkan tiga item tanpa membuka layar lain.

### Langkah 2.2 — Sodokan

Kalkulasi di query, bukan di cron. Tidak ada background job, tidak ada notifikasi:

```sql
-- perlu ditagih
select * from items
where status = 'open'
  and (
    (type = 'waiting' and waiting_since < current_date - 3)
    or (subtype = 'question' and created_at < now() - interval '7 days')
  );
```

**Selesai bila:** item waiting yang tanggalnya dimundurkan 4 hari langsung muncul sebagai perlu ditagih.

### Langkah 2.3 — Siklus Question & relasi

Field `answer`, lalu tombol "jadikan Action" atau "simpan sebagai Resource" yang membuat item baru dengan relasi `derived_from`.

Layar detail item menampilkan tautan masuk dan keluar, dikelompokkan menurut jenis relasinya.

**Selesai bila:** dari sebuah Action, Anda bisa mengklik balik sampai ke pertanyaan yang melahirkannya.

---

## Tahap 3 — Ritme harian

### Langkah 3.1 — Top 5 & snapshot

Tabel `daily_snapshots`, satu baris per tanggal (maksimal 5 item).

Carryover dihitung saat snapshot hari baru dibuat: ambil `item_ids` kemarin yang statusnya masih open. Hitung berapa hari berturut-turut sebuah item muncul, lalu tampilkan angkanya mencolok di kartu.

**Selesai bila:** item yang tidak selesai selama tiga hari menampilkan angka 3 yang tidak bisa Anda abaikan.

### Langkah 3.2 — Morning Review

Lima langkah berurutan dengan state langkah aktif. Pola wireframe: satu langkah terbuka, sisanya redup berisi angka, tanpa bisa dilompati.

Tombol "Mulai hari" tetap terlihat dalam keadaan mati sampai Inbox kosong dan Top 5 terisi, dengan alasannya tertulis di bawahnya.

**Selesai bila:** review pagi selesai dalam lima menit tanpa Anda perlu memutuskan mau membuka apa.

### Langkah 3.3 — End of Day Review

Empat langkah cermin. Catatan "satu hal pertama untuk besok" disimpan dan muncul sebagai kandidat Top 5 di langkah 5 pagi berikutnya.

---

## Tahap 4 — Pelengkap

### Langkah 4.1 — Search

Full-text search Postgres. Satu materialized view atau kolom `tsvector` yang menggabungkan judul item, isi item, dan isi Meeting Note.

```sql
alter table items add column search_vector tsvector
  generated always as (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(body,''))
  ) stored;
create index on items using gin(search_vector);
```

Gunakan konfigurasi `simple`, bukan `english` — isi catatan Anda berbahasa Indonesia dan stemmer Inggris justru merusak hasilnya.

### Langkah 4.2 — Dashboard & kalender

Seluruh Open Item tanpa penyaringan, plus kalender harian/mingguan/bulanan.

Kalender menumpuk tiga jenis tanggal dengan warna berbeda, dengan toggle di atasnya. `tanggal dibuat` **mati secara default**.

### Langkah 4.3 — Arsip & Export

Tombol arsipkan Project yang membawa serta item `action` dan `waiting`, tapi **tidak** menyentuh `resource`.

Export seluruh tabel ke JSON dan CSV lewat satu tombol.

---

## Catatan untuk mengarahkan AI coding

Serahkan PRD-nya sebagai konteks tetap, lalu minta **satu langkah per sesi**. Meminta "bangun Tahap 1" sekaligus menghasilkan kode yang tidak bisa Anda periksa, dan Anda akan menerimanya begitu saja karena terlihat masuk akal.

Beberapa hal yang biasanya diusulkan AI coding dan sebaiknya Anda tolak, karena membatalkan keputusan yang sudah dipikirkan:

| Usulan yang mungkin muncul | Kenapa ditolak |
| --- | --- |
| Clarify sebagai daftar, bukan satu kartu | Daftar membuat Anda mengambil yang paling gampang |
| Ambang sodokan dibuat bisa diatur per item | Sudah sengaja diseragamkan; opsi hanya menambah beban keputusan |
| `person` sebagai teks bebas | Nama akan terpecah jadi beberapa varian dan pengelompokan rusak |
| Cron job untuk menandai overdue | Cukup dihitung di query; tidak perlu infrastruktur tambahan |
| Menyembunyikan tombol "Mulai hari" | Tombol mati dengan alasan lebih baik daripada tombol hilang |
| Menghapus RLS karena single-user | Anon key terbuka di browser |
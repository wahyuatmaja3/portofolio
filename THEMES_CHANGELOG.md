# Theme Revisions & Layout Fixes Changelog

Dokumen ini merangkum semua perbaikan tata letak (layout) dan peningkatan visual yang telah diimplementasikan pada sistem multi-tema portofolio ini.

## 1. Perbaikan Layout Global (Horizontal Scroll)
- **Isu Sebelumnya**: Bagian hero dan about saling bertumpuk (overlap) atau "penceng" pada tampilan desktop/landscape karena tidak ada batasan ukuran lebar (width) yang ketat.
- **Solusi**: Menambahkan aturan CSS yang mengunci setiap `<section>` agar selalu memakan ruang persis 1 viewport:
  ```css
  section {
      width: 100vw;
      flex: 0 0 100vw; /* Mencegah section menyusut atau melebar */
      overflow-y: auto;
      overflow-x: hidden;
  }
  ```
  Ini memastikan transisi antar section saat di-scroll ke samping (horizontal) lebih rapi dan konsisten.

## 2. Peningkatan Visual per Tema

### ⬛ Neobrutalism
- Ditambahkan latar belakang motif polkadot (titik-titik hitam) khas desain Neobrutalism menggunakan `radial-gradient` di CSS.
- Bayangan keras (hard shadows) dan garis batas (borders) hitam tebal tetap dipertahankan.

### 💿 Y2K / Web 1.0 Retro
- Ditambahkan gambar kolase estetika era 2000-an (CD berputar, globe wireframe, dan ikon retro) di samping teks Hero. Gambar ini dibuat secara spesifik dan hanya ditampilkan saat tema Y2K aktif.
- Latar belakang menggunakan pola grid/ubin berulang (`repeating-linear-gradient`) untuk meniru gaya website lawas.

### 🧪 Acid / Cyberpunk
- Ditambahkan *overlay* layar CRT bergaya retro-futuristik (efek scanlines) pada seluruh layar.
- Background diganti dengan pola grid linear gradient warna hijau neon bercahaya untuk memberi kesan di dalam terminal komputer.

### 💥 Maximalism
- Latar belakang diubah menjadi pola papan catur (checkerboard) atau garis diagonal silang yang sengaja menggunakan warna sangat bertabrakan (kuning dan magenta).
- Teks menggunakan font raksasa yang saling tumpang tindih.

### 🍱 Vibrant Bento UI
- Ditambahkan efek *gradient mesh* yang kaya warna (gabungan banyak *radial-gradient*) di latar belakang, memberikan kesan modern, lembut, dan dinamis, sangat cocok untuk layout kotak-kotak bersudut melengkung.

# Insyst-Technical-Backend

## POST /bookings — Membuat Booking Baru
Endpoint ini digunakan untuk memproses pemesanan ruang meeting baru oleh pengguna.

### Contoh Request Header
```http
POST /bookings
Host: localhost:8000
```

### Contoh Request Body (JSON)
```json
{
  "roomId": 1,
  "slotId": 3,
  "date": "2026-10-20",
  "name": "Nama Pemesan",
  "email": "user@example.com",
  "phone": "081234567890",
  "participants": 4
}
```

---

## Alur Logika Server & Respons API
### Validasi Input Dasar (`422 Unprocessable Entity`)
- **Kondisi Berdasarkan Kode:** Dipicu jika salah satu parameter wajib (`roomId`, `slotId`, `date`, `name`, `email`, `phone`, `participants`) bernilai kosong, `undefined`, atau tidak disertakan dalam body request.
- **Status Code:** `422 Unprocessable Entity`
- **Format Response JSON:**
  ```json
  {
    "message": "Semua field wajib diisi dengan benar."
  }
  ```

### Keberadaan Ruangan Tidak Ada (`404 Not Found`)
- Dipicu jika `roomId` yang direferensikan di dalam request tidak ditemukan di dalam database (`!room`).
- **Status Code:** `404 Not Found`
- **Format Response JSON:**
  ```json
  {
    "message": "Ruangan tidak ditemukan"
  }
  ```

### Pemeriksaan Kapasitas Peserta (`422 Unprocessable Entity`)
- Dipicu jika jumlah `participants` yang diinputkan melampaui batas kapasitas maksimal ruangan (`room.capacity`).
- **Status Code:** `422 Unprocessable Entity`
- **Format Response JSON:**
  ```json
  {
    "message": "Jumlah partisipan melebihi kapasitas ruangan (10 orang)."
  }
  ```

### Pemeriksaan Konflik Jadwal Slot (`409 Conflict`)
- Dipicu jika ditemukan data pada entitas `booking` yang sudah memesan kombinasi `roomId` dan `slotId` yang sama pada tanggal (`date`) yang persis sama (`existingBooking`).
- **Status Code:** `409 Conflict`
- **Format Response JSON:**
  ```json
  {
    "message": "Slot jam pada tanggal tersebut sudah dibooking orang lain."
  }
  ```

### Berhasil Membuat Booking (`201 Created`)
- Tereksekusi apabila seluruh tahapan validasi, batas kapasitas, dan pemeriksaan konflik slot berhasil dilewati. Setelah berhasil, akan tereksekusi juga *Prisma Transaction* untuk mengubah status ketersediaan slot menjadi tidak tersedia (`isAvailable: false`).
- **Status Code:** `201 Created`
- **Format Response JSON:**
  ```json
  {
    "message": "Booking berhasil dibuat",
    "bookingCode": "BK-X9Y2Z1",
    "booking": {
      "id": 123,
      "bookingCode": "BK-X9Y2Z1",
      "roomId": 1,
      "slotId": 3,
      "date": "2026-10-20",
      "name": "Nama Pemesan",
      "email": "user@example.com",
      "phone": "081234567890",
      "participants": 4,
      "createdAt": "2026-10-16T08:30:00.000Z"
    }
  }
  ```

### Kesalahan Server Internal (`500 Internal Server Error`)
- Ditangkap melalui blok `catch (error)` apabila terjadi kendala teknis tak terduga pada koneksi database ataupun eksekusi runtime server.
- **Status Code:** `500 Internal Server Error`
- **Format Response JSON:**
  ```json
  {
    "message": "Terjadi kesalahan pada server"
  }
  ```

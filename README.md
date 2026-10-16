# Insyst-Technical-Backend

## POST /bookings
Endpoint ini digunakan untuk memproses booking / pemesanan ruang meeting baru oleh pengguna.

- **Method:** `POST`
- **Endpoint:** `/bookings`
- **Headers**: `Content-Type: application/json`

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
### Validasi Input Gagal (`422 Unprocessable Entity`)

Jika terdapat kesalahan atau kekurangan pada data yang dikirimkan oleh klien, server akan mengembalikan respons dengan struktur objek terperinci (`details`) per masing-masing field.

- **Status code:** `422 Unprocessable Entity`
- **Headers:** `Content-Type: application/json`
- **Contoh Body Respons:**
  ```json
  {
      "status": 422,
      "error": "ValidationError",
      "message": "Input tidak valid",
      "details": {
          "name": [
              "Nama wajib diisi"
          ],
          "email": [
              "Email tidak valid atau wajib diisi"
          ],
          "date": [
              "Format tanggal harus YYYY-MM-DD"
          ],
          "slotId": [
              "Slot ID harus berupa angka yang valid"
          ],
          "participants": [
              "Participants harus integer / angka bulat >= 1"
          ]
      }
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

## GET /rooms

Endpoint ini digunakan untuk mendapatkan seluruh daftar ruangan meeting yang tersedia beserta fasilitas dan informasi detailnya.

- **Method:** `GET`
- **Endpoint:** `/rooms`

### Contoh Response Sukses (`200 OK`)
```json
[
  {
    "id": 1,
    "name": "Meeting Room Alpha",
    "capacity": 10,
    "pricePerHour": 150000,
    "facilities": ["Projector", "Whiteboard", "AC"],
    "image": "alpha.jpg"
  }
]
```

### Penanganan Error Server (`500 Internal Server Error`)
- Gagal membaca data dari database.
- **Response JSON:**
  ```json
  {
    "error": "Internal Server Error"
  }
  ```

---

## GET /slots?roomId=[No]

Endpoint ini digunakan untuk mengambil daftar slot waktu beserta status ketersediaannya (`isAvailable`) pada ruangan tertentu.

- **Method:** `GET`
- **Endpoint:** `/slots?roomId=1`
- **Query Parameters:** 
  - `roomId` (Integer) - ID ruangan yang ingin dilihat slot jamnya.

### Contoh Response Sukses (`200 OK`)
```json
[
  {
    "id": 1,
    "roomId": 1,
    "time": "09:00 - 10:00",
    "isAvailable": true
  },
  {
    "id": 2,
    "roomId": 1,
    "time": "10:00 - 11:00",
    "isAvailable": false
  }
]
```

### Penanganan Error:
- Jika `roomId` tidak disertakan dalam query parameter.
  ```json
  {
    "error": "roomId diperlukan"
  }
  ```
- **Kesalahan Server (`500 Internal Server Error`):**
  Terjadi kendala pada proses query database.
  ```json
  {
    "error": "Internal Server Error"
  }
  ```

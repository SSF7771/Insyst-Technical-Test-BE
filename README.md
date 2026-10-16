# Insyst-Technical-Backend

## API Singkat: /bookings

Base URL: /bookings  
Content-Type: application/json

### POST /bookings
Membuat booking baru.

Request body (application/json):
{
  "name": "Nama Pemesan",
  "email": "user@example.com",
  "date": "2026-10-20",
  "slot_id": 3,
  "participants": 4,
  "notes": "opsional"
}

Validasi penting:
- Semua field wajib, kecuali `notes`.
- `email` harus valid.
- `date` harus format `YYYY-MM-DD` dan valid.
- `participants` harus integer dengan nilai >= 1.
- `slot_id` harus tersedia.

### Respons Umum
Semua respons JSON memiliki format konsisten:

- Sukses: `{ "status": 200|201, "data": { ... } }`
- Error: `{ "status": 422|404|409, "error": "NamaError", "message": "Pesan error", "details": { ... } }`

### Status Code

#### 201 Created
Booking berhasil dibuat.

```json
{
  "status": 201,
  "data": {
    "id": 123,
    "name": "Nama Pemesan",
    "email": "user@example.com",
    "date": "2026-10-20",
    "slot_id": 3,
    "participants": 4,
    "notes": "opsional"
  }
}
```

#### 200 OK
Permintaan berhasil diproses saat membaca data booking.

```json
{
  "status": 200,
  "data": {
    "id": 123,
    "name": "Nama Pemesan",
    "email": "user@example.com",
    "date": "2026-10-20",
    "slot_id": 3,
    "participants": 4,
    "notes": "opsional"
  }
}
```

#### 422 Unprocessable Entity
Validasi input gagal. Kembalikan pesan yang jelas per field.

```json
{
  "status": 422,
  "error": "ValidationError",
  "message": "Input tidak valid",
  "details": {
    "email": ["Email tidak valid"],
    "date": ["Format tanggal harus YYYY-MM-DD"],
    "participants": ["Participants harus lebih dari 0"]
  }
}
```

#### 409 Conflict
Booking ditolak karena konflik slot atau kapasitas.

- Slot sudah terisi pada tanggal yang sama
- Jumlah peserta melebihi kapasitas slot

```json
{
  "status": 409,
  "error": "SlotConflict",
  "message": "Slot sudah terisi pada tanggal yang sama."
}
```

```json
{
  "status": 409,
  "error": "CapacityExceeded",
  "message": "Jumlah peserta melebihi kapasitas slot."
}
```

#### 404 Not Found
Resource yang diminta tidak ditemukan, misalnya slot tidak tersedia.

```json
{
  "status": 404,
  "error": "NotFound",
  "message": "Slot dengan id 999 tidak ditemukan."
}
```

### Aturan bisnis penting
1. Validasi input harus dijalankan terlebih dahulu. Jika tidak valid, kembalikan `422`.
2. Jika slot pada tanggal yang sama sudah terisi, tolak dengan `409`.
3. Jika jumlah peserta melebihi kapasitas slot, tolak dengan `409`.
4. Pastikan respons JSON konsisten untuk semua kasus sukses dan error.
5. Gunakan pesan error yang jelas dan spesifik agar client bisa menampilkan informasi yang baik.

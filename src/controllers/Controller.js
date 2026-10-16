const prisma = require("../utils/prismaClient");
const isValidDateString = require("../utils/helpers.js");

// POST /bookings
const createBooking = async (req, res) => {
  const { roomId, slotId, date, name, email, phone, participants } = req.body;
  const details = {};

  if (!name) 
    details.name = ["Nama wajib diisi"];

  if (!email)
    details.email = ["Email tidak valid atau wajib diisi"];

  if (!date || !isValidDateString(date)) 
    details.date = ["Format tanggal harus YYYY-MM-DD"];
  
  else {
    // Cek apakah tanggal di masa lalu
    const todayStr = new Date().toISOString().split("T")[0];
    if (date < todayStr)
      details.date = ["Tanggal tidak boleh di masa lalu"];
  }

  if (!slotId || typeof slotId !== "number")
    details.slotId = ["Slot ID harus berupa angka yang valid"];
  
  if (!participants || typeof participants !== "number" || participants < 1) 
    details.participants = ["Participants harus integer / angka bulat >= 1"];
  
  if (Object.keys(details).length > 0) {
    return res.status(422).json({
      status: 422,
      error: "ValidationError",
      message: "Input tidak valid",
      details,
    });
  }

  try {
    // Cek kapasitas Room
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) },
    });

    if (!room)
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });

    if (participants > room.capacity) {
      return res.status(422).json({
        message: `Jumlah partisipan melebihi kapasitas ruangan (${room.capacity} orang).`,
      });
    }

    // Slot sudah terisi di tanggal yang sama atau belum (StatusCode 409)
    const existingBooking = await prisma.booking.findFirst({
      where: { roomId: parseInt(roomId), slotId: parseInt(slotId), date },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "Slot jam pada tanggal tersebut sudah dibooking orang lain.",
      });
    }

    // Buat Booking Baru
    const bookingCode =
      "BK-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    const [newBooking, updatedSlot] = await prisma.$transaction([
      // Simpan data booking baru
      prisma.booking.create({
        data: {
          bookingCode,
          roomId: parseInt(roomId),
          slotId: parseInt(slotId),
          date,
          name,
          email,
          phone,
          participants: parseInt(participants),
        },
      }),

      // Ubah status isAvailable slot menjadi false (singkatnya menutup slot)
      prisma.slot.update({
        where: { id: parseInt(slotId) },
        data: { isAvailable: false },
      }),
    ]);

    res.status(201).json({
      message: "Booking berhasil dibuat",
      bookingCode: newBooking.bookingCode,
      booking: newBooking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

// GET /rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    const formattedRooms = rooms.map((r) => ({
      ...r,
      facilities: JSON.parse(r.facilities || "[]"),
      image: r.image,
    }));
    res.status(200).json(formattedRooms);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// GET /slots?roomId=[No]
// Notes: untuk roomId, uji pakai Params di Postman
const getSlot = async (req, res) => {
  const { roomId } = req.query;
  if (!roomId) return res.status(400).json({ error: "roomId diperlukan" });

  try {
    const slots = await prisma.slot.findMany({
      where: { roomId: parseInt(roomId) },
    });

    if (!slots)
      return res.status(404).json({ message: "Ruangan tidak ditemukan" });

    res.status(200).json(slots);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createBooking,
  getRooms,
  getSlot,
};

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Hapus data lama (jika ada)
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.room.deleteMany();

  // Data Rooms
  const room1 = await prisma.room.create({
    data: {
      name: "Meeting Room Alpha",
      capacity: 10,
      pricePerHour: 150000,
      facilities: JSON.stringify(["Projector", "Whiteboard", "AC"]),
      image: "alpha.jpg",
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Boardroom Beta",
      capacity: 6,
      pricePerHour: 100000,
      facilities: JSON.stringify(["TV Screen", "AC"]),
      image: "beta.jpg",
    },
  });

  // Data Slots untuk Room 1 & Room 2
  await prisma.slot.createMany({
    data: [
      { roomId: room1.id, time: "09:00 - 10:00", isAvailable: true },
      { roomId: room1.id, time: "10:00 - 11:00", isAvailable: true },
      { roomId: room1.id, time: "13:00 - 14:00", isAvailable: true },
      { roomId: room2.id, time: "09:00 - 10:00", isAvailable: true },
      { roomId: room2.id, time: "14:00 - 15:00", isAvailable: true },
    ],
  });

  console.log("Seeding successful!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

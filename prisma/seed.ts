import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("Admin@2026", 12);

  await prisma.users.upsert({
    where: { email: "admin@rideflow.pk" },
    update: {},
    create: {
      full_name: "Super Admin",
      email: "admin@rideflow.pk",
      phone: "+92-300-0000001",
      password_hash: adminHash,
      role: "admin",
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

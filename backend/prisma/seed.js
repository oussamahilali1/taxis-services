import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, AdminRole } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const prisma = new PrismaClient();

function parseBoolean(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD?.trim();
  const allowPasswordReset = parseBoolean(process.env.ALLOW_ADMIN_PASSWORD_RESET);

  if (!email) {
    throw new Error('SEED_ADMIN_EMAIL must be set before running the seed script.');
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!existingAdmin) {
    if (!bootstrapPassword) {
      throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be set to create the first admin.');
    }

    const passwordHash = await bcrypt.hash(bootstrapPassword, 12);
    const admin = await prisma.admin.create({
      data: {
        email,
        passwordHash,
        role: AdminRole.SUPER_ADMIN,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`Created initial admin ${admin.email} (${admin.role}).`);
    return;
  }

  if (!allowPasswordReset) {
    console.log(`Admin ${existingAdmin.email} already exists. Seed skipped without changing credentials.`);
    return;
  }

  if (!bootstrapPassword) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be set when ALLOW_ADMIN_PASSWORD_RESET=true.');
  }

  const passwordHash = await bcrypt.hash(bootstrapPassword, 12);
  const admin = await prisma.admin.update({
    where: { id: existingAdmin.id },
    data: {
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      role: true,
      updatedAt: true,
    },
  });

  console.log(`Password reset explicitly for admin ${admin.email} (${admin.role}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

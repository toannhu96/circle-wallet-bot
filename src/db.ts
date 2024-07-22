import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const connectDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
  } catch (err) {
    throw new Error(`DB connection error: ${err}`);
  }
};

export const closeConnection = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    throw new Error("DB connection closure fail");
  }
};

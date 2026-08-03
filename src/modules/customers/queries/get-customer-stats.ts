import { prisma } from "@/lib/prisma";

export async function getCustomerStats() {
  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  return { totalCustomers };
}

import { prisma } from "@/lib/prisma";
import type { OrderStatus, Prisma } from "@/generated/prisma/client";

const PAGE_SIZE = 20;

export async function listOrdersAdmin({
  query,
  status,
  page = 1,
}: {
  query?: string;
  status?: OrderStatus;
  page?: number;
}) {
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { user: { name: { contains: query, mode: "insensitive" } } },
            { user: { email: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { name: true, email: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

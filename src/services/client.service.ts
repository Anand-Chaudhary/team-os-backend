import { prisma } from '../db/prisma';

/**
 * List all client records.
 */
export async function listClients() {
  return prisma.client.findMany();
}

/**
 * Get a single client by ID.
 */
export async function getClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

/**
 * Create a new client.
 * Expected data: { name, contactEmail?, contactPhone?, whatsappGroupUrl?, contentTags?, monthlyGoal? }
 */
function normalizeDeliverables(items: any) {
  if (!Array.isArray(items)) return items;
  return items.map((item, idx) => ({
    ...item,
    id: item.id || `deliv_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    number: Number(item.number || item.count || 1),
    type: item.type || item.title || 'Deliverable',
  }));
}

export async function createClient(data: {
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  whatsappGroupUrl?: string | null;
  monthlyGoal?: number | null;
  password?: string;
  deliverables?: any;
}) {
  const { name, contactEmail, contactPhone, whatsappGroupUrl, monthlyGoal, password, deliverables } = data;
  let passwordHash: string | undefined;
  if (password) {
    const bcrypt = await import('bcrypt');
    passwordHash = await bcrypt.hash(password, 10);
  }
  return prisma.client.create({
    data: {
      name,
      contactEmail: contactEmail ?? null,
      contactPhone: contactPhone ?? null,
      whatsappGroupUrl: whatsappGroupUrl ?? null,
//      contentTags: contentTags ?? [],
      monthlyGoal: monthlyGoal ?? null,
      passwordHash,
      deliverables: normalizeDeliverables(deliverables ?? []),
    },
  });
}

/**
 * Update an existing client. `updateData` should contain only fields to be updated.
 */
export async function updateClient(id: string, updateData: any) {
  if (updateData.deliverables !== undefined) {
    updateData.deliverables = normalizeDeliverables(updateData.deliverables);
  }
  return prisma.client.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete a client by ID.
 */
export async function deleteClient(id: string) {
  return prisma.client.delete({ where: { id } });
}

/**
 * Generate (or retrieve) a tokenized read‑only calendar share link for a client.
 */
export async function generateShareLink(clientId: string) {
  // Ensure the client exists (caller should verify, but we also guard here).
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    const err: any = new Error('Client not found');
    err.status = 404;
    throw err;
  }

  const shareLink = await prisma.shareLink.upsert({
    where: { clientId },
    update: {}, // keep existing token; rotate logic can be added later
    create: { clientId },
  });

  return { url: `/clients/${clientId}/calendar?token=${shareLink.token}` };
}

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
export async function createClient(data: {
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  whatsappGroupUrl?: string | null;
  contentTags?: string[];
  monthlyGoal?: number | null;
}) {
  const { name, contactEmail, contactPhone, whatsappGroupUrl, contentTags, monthlyGoal } = data;
  return prisma.client.create({
    data: {
      name,
      contactEmail: contactEmail ?? null,
      contactPhone: contactPhone ?? null,
      whatsappGroupUrl: whatsappGroupUrl ?? null,
      contentTags: contentTags ?? [],
      monthlyGoal: monthlyGoal ?? null,
    },
  });
}

/**
 * Update an existing client. `updateData` should contain only fields to be updated.
 */
export async function updateClient(id: string, updateData: any) {
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

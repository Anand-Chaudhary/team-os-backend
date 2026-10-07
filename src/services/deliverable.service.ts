import { prisma } from '../db/prisma';

export interface ClientDeliverableItem {
  id: string;
  type: string;
  title: string;
  number: number;
  count: number;
  clientId: string;
  clientName: string;
  assignedCount: number;
  remainingCount: number;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: Date | null;
    assignees: Array<{ id: string; name: string; email: string }>;
  }>;
}

/**
 * Get all deliverables for a given client along with their task assignment status.
 */
export async function getDeliverablesByClientId(clientId: string): Promise<ClientDeliverableItem[]> {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      deliverables: true,
    },
  });

  if (!client) {
    const err: any = new Error('Client not found');
    err.status = 404;
    throw err;
  }

  let deliverables = client.deliverables;
  if (typeof deliverables === 'string') {
    try {
      deliverables = JSON.parse(deliverables);
    } catch {
      deliverables = [];
    }
  }
  if (!Array.isArray(deliverables)) {
    deliverables = [];
  }

  // Fetch tasks belonging to this client to compute assignment progress
  const clientTasks = await prisma.task.findMany({
    where: { clientId },
    include: {
      assignees: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return deliverables.map((d: any, index: number) => {
    const id = d.id || `${client.id}-deliv-${index + 1}`;
    const type = d.type || d.title || d.name || 'Deliverable';
    const number = Number(d.number || d.count || 1);

    const matchedTasks = clientTasks.filter((t: any) => {
      if (t.deliverableId && t.deliverableId === id) return true;
      if (t.description && t.description.includes(`[deliverableId:${id}]`)) return true;
      return false;
    });

    return {
      id,
      type,
      title: d.title || `${type}`,
      number,
      count: number,
      clientId: client.id,
      clientName: client.name,
      assignedCount: matchedTasks.length,
      remainingCount: Math.max(0, number - matchedTasks.length),
      tasks: matchedTasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        deadline: t.deadline,
        assignees: t.assignees?.map((a: any) => a.user) || [],
      })),
    };
  });
}

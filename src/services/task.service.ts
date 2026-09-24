import { prisma } from '../db/prisma';
import { TaskStatus, TaskPriority } from '../generated/prisma/enums';

export async function listTasks() {
  return prisma.task.findMany({ include: { assignees: true, revisions: true, client: true } });
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignees: { include: { user: true } },
      revisions: true,
      client: true,
      calendarPost: true,
    },
  });
}

/** Normalizes a priority string to a valid TaskPriority enum value. */
function normalizePriority(p?: string | TaskPriority): TaskPriority | undefined {
  if (!p) return undefined;
  if (typeof p === 'string') {
    const upper = p.toUpperCase();
    if (Object.values(TaskPriority).includes(upper as TaskPriority)) {
      return upper as TaskPriority;
    }
    // invalid value – let caller decide (service will fallback to default)
    return undefined;
  }
  return p;
}

export async function createTask(data: {
  title: string;
  description?: string | null;
  clientId?: string | null;
  deadline?: string | Date | null;
  priority?: string | TaskPriority;
  createdById: string;
}) {
  const { title, description, clientId, deadline, priority, createdById } = data;
  const normalizedPriority = normalizePriority(priority);
  return prisma.task.create({
    data: {
      title,
      description: description ?? null,
      client: clientId ? { connect: { id: clientId } } : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      priority: normalizedPriority ?? TaskPriority.MEDIUM,
      createdBy: { connect: { id: createdById } },
    },
  });
}

export async function updateTask(id: string, updateData: any) {
  if (updateData.status) {
    updateData.status = updateData.status as TaskStatus;
  }
  if (updateData.priority) {
    const normalized = normalizePriority(updateData.priority);
    if (normalized) {
      updateData.priority = normalized;
    } else {
      delete updateData.priority;
    }
  }
  if (updateData.deadline) {
    updateData.deadline = new Date(updateData.deadline);
  }
  return prisma.task.update({ where: { id }, data: updateData });
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } });
}

/** Returns tasks assigned to a particular user. */
export async function listUserTasks(userId: string) {
  return prisma.task.findMany({
    where: { assignees: { some: { userId } } },
    include: { assignees: true, revisions: true, client: true },
  });
}

export async function assignTask(taskId: string, assigneeIds: string[]) {
  const creates = assigneeIds.map((userId) => ({ taskId, userId }));
  await prisma.taskAssignee.createMany({ data: creates, skipDuplicates: true });
  return prisma.task.findUnique({
    where: { id: taskId },
    include: { assignees: { include: { user: true } } },
  });
}

export async function addTaskRevision(
  taskId: string,
  data: { note: string; attachmentUrl?: string | null; submittedById: string }
) {
  const maxRound = await prisma.taskRevision
    .findMany({ where: { taskId }, select: { roundNumber: true } })
    .then((revs) => revs.reduce((max, r) => (r.roundNumber > max ? r.roundNumber : max), 0));

  const roundNumber = maxRound + 1;
  return prisma.taskRevision.create({
    data: {
      task: { connect: { id: taskId } },
      roundNumber,
      note: data.note,
      attachmentUrl: data.attachmentUrl ?? null,
      submittedBy: { connect: { id: data.submittedById } },
    },
  });
}

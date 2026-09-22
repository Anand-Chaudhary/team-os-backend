import { prisma } from '../db/prisma'
import { TaskStatus, TaskPriority } from '../generated/prisma/enums'

export async function listTasks() {
  return prisma.task.findMany({ include: { assignees: true, revisions: true, client: true } })
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: { assignees: { include: { user: true } }, revisions: true, client: true, calendarPost: true },
  })
}

export async function createTask(data: {
  title: string
  description?: string | null
  clientId?: string | null
  deadline?: string | Date | null
  priority?: TaskPriority
  createdById: string
}) {
  const { title, description, clientId, deadline, priority, createdById } = data
  return prisma.task.create({
    data: {
      title,
      description: description ?? null,
      client: clientId ? { connect: { id: clientId } } : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      priority: priority ?? TaskPriority.MEDIUM,
      createdBy: { connect: { id: createdById } },
    },
  })
}

export async function updateTask(id: string, updateData: any) {
  if (updateData.status) {
    updateData.status = updateData.status as TaskStatus
  }
  if (updateData.priority) {
    updateData.priority = updateData.priority as TaskPriority
  }
  if (updateData.deadline) {
    updateData.deadline = new Date(updateData.deadline)
  }
  return prisma.task.update({ where: { id }, data: updateData })
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } })
}

export async function assignTask(taskId: string, assigneeIds: string[]) {
  const creates = assigneeIds.map(userId => ({ taskId, userId }))
  await prisma.taskAssignee.createMany({ data: creates, skipDuplicates: true })
  return prisma.task.findUnique({ where: { id: taskId }, include: { assignees: { include: { user: true } } } })
}

export async function addTaskRevision(taskId: string, data: { note: string; attachmentUrl?: string | null; submittedById: string }) {
  const maxRound = await prisma.taskRevision
    .findMany({ where: { taskId }, select: { roundNumber: true } })
    .then(revs => revs.reduce((max, r) => (r.roundNumber > max ? r.roundNumber : max), 0))
  const roundNumber = maxRound + 1
  return prisma.taskRevision.create({
    data: {
      task: { connect: { id: taskId } },
      roundNumber,
      note: data.note,
      attachmentUrl: data.attachmentUrl ?? null,
      submittedBy: { connect: { id: data.submittedById } },
    },
  })
}

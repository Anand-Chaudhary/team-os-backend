import { prisma } from '../db/prisma'
import { Decimal } from '@prisma/client/runtime'

export async function listShoots() {
  return prisma.shoot.findMany({ include: { crew: true, gearChecklist: true, client: true } })
}

export async function getShootById(id: string) {
  return prisma.shoot.findUnique({
    where: { id },
    include: { crew: { include: { user: true } }, gearChecklist: true, client: true },
  })
}

export async function createShoot(data: {
  clientId?: string | null
  title: string
  scheduledAt: string | Date
  location?: string | null
  cost?: number | null
}) {
  const { clientId, title, scheduledAt, location, cost } = data
  return prisma.shoot.create({
    data: {
      client: clientId ? { connect: { id: clientId } } : undefined,
      title,
      scheduledAt: new Date(scheduledAt),
      location: location ?? null,
      cost: cost !== undefined && cost !== null ? new Decimal(cost) : undefined,
    },
  })
}

export async function updateShoot(id: string, updateData: any) {
  if (updateData.scheduledAt) {
    updateData.scheduledAt = new Date(updateData.scheduledAt)
  }
  if (updateData.cost !== undefined) {
    updateData.cost = updateData.cost !== null ? new Decimal(updateData.cost) : null
  }
  return prisma.shoot.update({ where: { id }, data: updateData })
}

export async function deleteShoot(id: string) {
  return prisma.shoot.delete({ where: { id } })
}

export async function assignCrew(shootId: string, crew: { userId: string; role?: string }[]) {
  const creates = crew.map(c => ({ shootId, userId: c.userId, role: c.role ?? null }))
  await prisma.shootCrew.createMany({ data: creates, skipDuplicates: true })
  return prisma.shoot.findUnique({ where: { id: shootId }, include: { crew: { include: { user: true } } } })
}

export async function addGearItem(shootId: string, data: { name: string; packed?: boolean }) {
  const { name, packed } = data
  return prisma.gearItem.create({ data: { shoot: { connect: { id: shootId } }, name, packed: packed ?? false } })
}

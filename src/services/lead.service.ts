// Lead service – CRUD operations for lead management (Phase 5)

import { prisma } from '../db/prisma';
import { LeadStage } from '../generated/prisma/enums';

/** List all leads */
export async function listLeads() {
  return prisma.lead.findMany({ include: { assignedTo: true } });
}

/** Get a lead by its ID */
export async function getLeadById(id: string) {
  return prisma.lead.findUnique({ where: { id }, include: { assignedTo: true } });
}

/** Create a new lead */
export async function createLead(data: {
  name: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  source?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
  stage?: LeadStage;
}) {
  const {
    name,
    contactEmail = null,
    contactPhone = null,
    source = null,
    notes = null,
    assignedToId = null,
    stage = LeadStage.NEW,
  } = data;

  return prisma.lead.create({
    data: {
      name,
      contactEmail,
      contactPhone,
      source,
      notes,
      assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      stage,
    },
    include: { assignedTo: true },
  });
}

/** Update an existing lead */
export async function updateLead(id: string, update: {
  name?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  source?: string | null;
  notes?: string | null;
  assignedToId?: string | null;
  stage?: LeadStage;
}) {
  const data: any = { ...update };
  if ('assignedToId' in update) {
    if (update.assignedToId) {
      data.assignedTo = { connect: { id: update.assignedToId } };
    } else {
      data.assignedTo = { disconnect: true };
    }
    delete data.assignedToId;
  }
  return prisma.lead.update({ where: { id }, data, include: { assignedTo: true } });
}

/** Delete a lead */
export async function deleteLead(id: string) {
  return prisma.lead.delete({ where: { id } });
}

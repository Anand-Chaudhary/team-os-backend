import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import {
  listLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../services/lead.service';

/** GET /leads – list all leads */
export async function listLeadsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const leads = await listLeads();
    return sendResponse(res, { success: true, message: 'Leads fetched', status: 200, data: leads });
  } catch (error) {
    next(error);
  }
}

/** GET /leads/:id – fetch single lead */
export async function getLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const lead = await getLeadById(id as string);
    if (!lead) {
      const err: any = new Error('Lead not found');
      err.status = 404;
      throw err;
    }
    return sendResponse(res, { success: true, message: 'Lead fetched', status: 200, data: lead });
  } catch (error) {
    next(error);
  }
}

/** POST /leads – create a new lead */
export async function createLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      contactEmail,
      contactPhone,
      source,
      notes,
      assignedToId,
      stage,
    } = req.body ?? {};
    if (!name) {
      const err: any = new Error('Field "name" is required');
      err.status = 400;
      throw err;
    }
    const lead = await createLead({
      name,
      contactEmail,
      contactPhone,
      source,
      notes,
      assignedToId,
      stage,
    });
    return sendResponse(res, { success: true, message: 'Lead created', status: 201, data: lead });
  } catch (error) {
    next(error);
  }
}

/** PATCH /leads/:id – update an existing lead */
export async function updateLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const update = req.body ?? {};
    const lead = await updateLead(id as string, update);
    return sendResponse(res, { success: true, message: 'Lead updated', status: 200, data: lead });
  } catch (error) {
    next(error);
  }
}

/** DELETE /leads/:id – delete a lead */
export async function deleteLeadHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await deleteLead(id as string);
    return sendResponse(res, { success: true, message: 'Lead deleted', status: 200, data: null });
  } catch (error) {
    next(error);
  }
}

import type { Request, Response, NextFunction } from 'express';
import { sendResponse } from '../utils/response';
import {
  listClients as serviceListClients,
  getClientById,
  createClient as serviceCreateClient,
  updateClient as serviceUpdateClient,
  deleteClient as serviceDeleteClient,
  generateShareLink as serviceGenerateShareLink,
} from '../services/client.service';

/** GET /clients – list all client records. */
export async function listClients(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await serviceListClients();
    return sendResponse(res, {
      success: true,
      message: 'Clients fetched successfully',
      status: 200,
      data: clients,
    });
  } catch (error) {
    next(error);
  }
}

/** GET /clients/:id – fetch a single client. */
export async function getClient(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const client = await getClientById(id);
    if (!client) {
      const err: any = new Error('Client not found');
      err.status = 404;
      throw err;
    }
    return sendResponse(res, {
      success: true,
      message: 'Client fetched successfully',
      status: 200,
      data: client,
    });
  } catch (error) {
    next(error);
  }
}

/** POST /clients – create a new client. */
export async function createClient(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      contactEmail,
      contactPhone,
      whatsappGroupUrl,
      contentTags,
      monthlyGoal,
    } = req.body ?? {};

    if (!name) {
      const err: any = new Error('Client name is required');
      err.status = 400;
      throw err;
    }

    const client = await serviceCreateClient({
      name,
      contactEmail,
      contactPhone,
      whatsappGroupUrl,
      contentTags,
      monthlyGoal,
    });

    return sendResponse(res, {
      success: true,
      message: 'Client created successfully',
      status: 201,
      data: client,
    });
  } catch (error) {
    next(error);
  }
}

/** PATCH /clients/:id – update an existing client. */
export async function updateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const {
      name,
      contactEmail,
      contactPhone,
      whatsappGroupUrl,
      contentTags,
      monthlyGoal,
    } = req.body ?? {};

    const updateData: any = {
      ...(name && { name }),
      ...(contactEmail !== undefined && { contactEmail: contactEmail ?? null }),
      ...(contactPhone !== undefined && { contactPhone: contactPhone ?? null }),
      ...(whatsappGroupUrl !== undefined && { whatsappGroupUrl: whatsappGroupUrl ?? null }),
      ...(contentTags !== undefined && { contentTags: contentTags ?? [] }),
      ...(monthlyGoal !== undefined && { monthlyGoal: monthlyGoal ?? null }),
    };

    const client = await serviceUpdateClient(id, updateData);

    return sendResponse(res, {
      success: true,
      message: 'Client updated successfully',
      status: 200,
      data: client,
    });
  } catch (error) {
    next(error);
  }
}

/** DELETE /clients/:id – delete a client. */
export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await serviceDeleteClient(id);
    return sendResponse(res, {
      success: true,
      message: 'Client deleted successfully',
      status: 200,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

/** POST /clients/:id/share – generate a tokenized read‑only calendar link for a client. */
export async function generateShareLink(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const result = await serviceGenerateShareLink(id);
    return sendResponse(res, {
      success: true,
      message: 'Share link generated',
      status: 201,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

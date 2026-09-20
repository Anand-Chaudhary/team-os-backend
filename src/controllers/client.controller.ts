import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../db/prisma';
import { sendResponse } from '../utils/response';

/**
 * GET /clients – list all client records.
 */
export async function listClients(req: Request, res: Response, next: NextFunction) {
  try {
    const clients = await prisma.client.findMany();
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

/**
 * GET /clients/:id – fetch a single client.
 */
export async function getClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({ where: { id } });
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

/**
 * POST /clients – create a new client.
 * Expected body: { name, contactEmail?, contactPhone?, whatsappGroupUrl?, contentTags?, monthlyGoal? }
 */
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

    const client = await prisma.client.create({
      data: {
        name,
        contactEmail: contactEmail ?? null,
        contactPhone: contactPhone ?? null,
        whatsappGroupUrl: whatsappGroupUrl ?? null,
        contentTags: contentTags ?? [],
        monthlyGoal: monthlyGoal ?? null,
      },
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

/**
 * PATCH /clients/:id – update an existing client.
 * Allows partial updates.
 */
export async function updateClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const {
      name,
      contactEmail,
      contactPhone,
      whatsappGroupUrl,
      contentTags,
      monthlyGoal,
    } = req.body ?? {};

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(contactEmail !== undefined && { contactEmail: contactEmail ?? null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone ?? null }),
        ...(whatsappGroupUrl !== undefined && { whatsappGroupUrl: whatsappGroupUrl ?? null }),
        ...(contentTags !== undefined && { contentTags: contentTags ?? [] }),
        ...(monthlyGoal !== undefined && { monthlyGoal: monthlyGoal ?? null }),
      },
    });

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

/**
 * DELETE /clients/:id – delete a client.
 */
export async function deleteClient(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id } });
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

/**
 * POST /clients/:id/share – generate a tokenized read‑only calendar link for a client.
 */
export async function generateShareLink(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    // Ensure client exists
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      const err: any = new Error('Client not found');
      err.status = 404;
      throw err;
    }

    // Create (or replace) a ShareLink for the client
    const shareLink = await prisma.shareLink.upsert({
      where: { clientId: id },
      update: {}, // keep existing token; can add logic to rotate if needed
      create: { clientId: id },
    });

    return sendResponse(res, {
      success: true,
      message: 'Share link generated',
      status: 201,
      data: { url: `/clients/${id}/calendar?token=${shareLink.token}` },
    });
  } catch (error) {
    next(error);
  }
}

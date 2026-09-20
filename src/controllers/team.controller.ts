import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../db/prisma';
import { sendResponse } from '../utils/response';

/**
 * Helper to remove sensitive fields from a user record before returning it.
 */
function sanitizeUser(user: any) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * GET /team – list all employees (users).
 */
export async function listEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    const employees = await prisma.user.findMany();
    const safe = employees.map(sanitizeUser);
    return sendResponse(res, {
      success: true,
      message: 'Employees fetched successfully',
      status: 200,
      data: safe,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /team/:id – fetch a single employee.
 */
export async function getEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee) {
      const err: any = new Error('Employee not found');
      err.status = 404;
      throw err;
    }
    return sendResponse(res, {
      success: true,
      message: 'Employee fetched successfully',
      status: 200,
      data: sanitizeUser(employee),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /team – create a new employee.
 * Expected body: { name, email, password, phone?, role?, jobType?, reportTime?, gracePeriodMins? }
 */
export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      jobType,
      reportTime,
      gracePeriodMins,
    } = req.body ?? {};

    if (!name || !email || !password) {
      const err: any = new Error('Name, email, and password are required');
      err.status = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone ?? null,
        passwordHash,
        role: role ?? 'SALES',
        status: 'ACTIVE',
        jobType: jobType ?? null,
        reportTime: reportTime ?? null,
        gracePeriodMins: gracePeriodMins ?? undefined,
      },
    });

    return sendResponse(res, {
      success: true,
      message: 'Employee created successfully',
      status: 201,
      data: sanitizeUser(employee),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /team/:id – update an existing employee.
 * Allows partial updates of any editable fields.
 */
export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      role,
      status,
      jobType,
      reportTime,
      gracePeriodMins,
    } = req.body ?? {};

    const employee = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone: phone ?? null }),
        ...(role && { role }),
        ...(status && { status }),
        ...(jobType !== undefined && { jobType: jobType ?? null }),
        ...(reportTime !== undefined && { reportTime: reportTime ?? null }),
        ...(gracePeriodMins !== undefined && { gracePeriodMins }),
      },
    });

    return sendResponse(res, {
      success: true,
      message: 'Employee updated successfully',
      status: 200,
      data: sanitizeUser(employee),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /team/:id – remove an employee.
 */
export async function deleteEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return sendResponse(res, {
      success: true,
      message: 'Employee deleted successfully',
      status: 200,
      data: null,
    });
  } catch (error) {
    next(error);
  }
}

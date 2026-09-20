import bcrypt from 'bcrypt';
import { prisma } from '../db/prisma';

/**
 * List all employees (users).
 */
export async function listEmployees() {
  return prisma.user.findMany();
}

/**
 * Get a single employee by ID.
 */
export async function getEmployeeById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

/**
 * Create a new employee.
 * Expected data: { name, email, password, phone?, role?, jobType?, reportTime?, gracePeriodMins? }
 */
export async function createEmployee(data: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  role?: string;
  jobType?: string | null;
  reportTime?: string | null;
  gracePeriodMins?: number;
}) {
  const { name, email, password, phone, role, jobType, reportTime, gracePeriodMins } = data;

  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      phone: phone ?? null,
      passwordHash,
      role: (role ?? 'SALES') as any,
      status: 'ACTIVE',
      jobType: jobType ?? null,
      reportTime: reportTime ?? null,
      gracePeriodMins: gracePeriodMins ?? undefined,
    },
  });
}

/**
 * Update an existing employee. `updateData` should contain only fields to be updated.
 */
export async function updateEmployee(id: string, updateData: any) {
  return prisma.user.update({
    where: { id },
    data: updateData,
  });
}

/**
 * Delete an employee by ID.
 */
export async function deleteEmployee(id: string) {
  return prisma.user.delete({ where: { id } });
}

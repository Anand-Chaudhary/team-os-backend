import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { prisma } from '../db/prisma';

/** Input payload for salary slip generation */
export interface SalarySlipInput {
  employeeId: string;
  salaryMonth: string; // YYYY-MM
  monthlySalary: number;
  attendanceDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  salaryPaymentDate: string;
}

/** Ensure the uploads directory exists and return its path */
function ensureUploadsDir(): string {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  return uploadsDir;
}

/** Generate a PDF salary slip and resolve the absolute file path */
function generatePdf(data: {
  id: string;
  employeeName: string;
  designation: string;
  salaryMonth: string;
  monthlySalary: number;
  attendanceDays: number;
  paidLeaves: number;
  unpaidLeaves: number;
  unpaidLeaveDeduction: number;
  netSalary: number;
  salaryPaymentDate: string;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadsDir = ensureUploadsDir();
    const filePath = path.join(uploadsDir, `${data.id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Salary Slip', { align: 'center' }).moveDown(1);
    doc.fontSize(12);
    // Body
    doc.text(`Employee Name: ${data.employeeName}`);
    doc.text(`Designation: ${data.designation}`);
    doc.text(`Salary Month: ${data.salaryMonth}`);
    doc.text(`Monthly Salary: ₹${data.monthlySalary.toFixed(2)}`);
    doc.text(`Attendance / Working Days: ${data.attendanceDays}`);
    doc.text(`Paid Leaves: ${data.paidLeaves}`);
    doc.text(`Unpaid Leaves: ${data.unpaidLeaves}`);
    doc.text(`Unpaid Leave Deduction: ₹${data.unpaidLeaveDeduction.toFixed(2)}`);
    doc.text(`Net Salary Payable: ₹${data.netSalary.toFixed(2)}`);
    doc.text(`Salary Payment Date: ${data.salaryPaymentDate}`);

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

/** Create a new salary slip or return an existing one for the same month/user */
export async function createOrGetSalarySlip(userId: string, payload: SalarySlipInput): Promise<{
  id: string;
  url: string;
  created: boolean;
}> {
  // Basic validation – ensures all required fields are present
  const {
    employeeId,
    salaryMonth,
    monthlySalary,
    attendanceDays,
    paidLeaves,
    unpaidLeaves,
    salaryPaymentDate,
  } = payload;

  if (!employeeId || !salaryMonth || monthlySalary === undefined || attendanceDays === undefined || paidLeaves === undefined || unpaidLeaves === undefined || !salaryPaymentDate) {
    const err: any = new Error('Missing required fields for salary slip');
    err.status = 400;
    throw err;
  }

  // Fetch employee details (name and designation)
  const employee = await prisma.user.findUnique({ where: { id: employeeId } });
  if (!employee) {
    const err: any = new Error('Employee not found');
    err.status = 404;
    throw err;
  }
  const employeeName = employee.name;
  const designation = (employee.role as any).toString(); // role used as designation

  // Compute days in month and salary calculations
  const monthDate = new Date(`${salaryMonth}-01`);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const perDaySalary = Number(monthlySalary) / daysInMonth;
  const unpaidLeaveDeduction = perDaySalary * Number(unpaidLeaves);
  const netSalary = Number(monthlySalary) - unpaidLeaveDeduction;

  // Normalise month to first day (UTC) for DB storage/comparison
  const monthStart = new Date(Date.UTC(monthDate.getFullYear(), monthDate.getMonth(), 1, 0, 0, 0, 0));

  // Check existing slip for this employee and month
  const existingSlip = await prisma.salarySlip.findFirst({
    where: { userId: employeeId, month: monthStart },
  });
  if (existingSlip) {
    return { id: existingSlip.id, url: `/api/v1/salary-slips/${existingSlip.id}`, created: false };
  }

  // Deterministic ID: YYYY-MM-DD_<employeeId>
  const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const id = `${todayStr}_${employeeId}`;

  // Generate PDF using fetched details
  await generatePdf({
    id,
    employeeName,
    designation,
    salaryMonth,
    monthlySalary: Number(monthlySalary),
    attendanceDays: Number(attendanceDays),
    paidLeaves: Number(paidLeaves),
    unpaidLeaves: Number(unpaidLeaves),
    unpaidLeaveDeduction,
    netSalary,
    salaryPaymentDate,
  });

  // Persist record in DB (belongs to employeeId)
  const pdfRelativePath = path.join('uploads', `${id}.pdf`);
  await prisma.salarySlip.create({
    data: {
      id,
      userId: employeeId,
      month: monthStart,
      pdfPath: pdfRelativePath,
    },
  });

  return { id, url: `/api/v1/salary-slips/${id}`, created: true };
}

/** Retrieve the absolute PDF file path for a slip, validating ownership */
export async function getSalarySlipFile(userId: string, slipId: string): Promise<string> {
  const slip = await prisma.salarySlip.findUnique({ where: { id: slipId } });
  if (!slip) {
    const err: any = new Error('Salary slip not found');
    err.status = 404;
    throw err;
  }
  if (slip.userId !== userId) {
    const err: any = new Error('Unauthorized access to salary slip');
    err.status = 403;
    throw err;
  }
  const filePath = path.join(process.cwd(), slip.pdfPath);
  if (!fs.existsSync(filePath)) {
    const err: any = new Error('Salary slip file missing');
    err.status = 404;
    throw err;
  }
  return filePath;
}

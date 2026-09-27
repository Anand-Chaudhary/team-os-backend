import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../auth/auth.config';
import { prisma } from '../db/prisma';

function signClientToken(clientId: string) {
  return jwt.sign({ clientId }, JWT_SECRET, { expiresIn: '7d' });
}

/** Verify client credentials and return client data with a JWT token. */
export async function loginClient(email: string, password: string) {
  const client = await prisma.client.findFirst({
    where: { contactEmail: email },
  });
  if (!client) {
    const err: any = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
  const hash = client.passwordHash;
  if (!hash) {
    const err: any = new Error('Client password not set');
    err.status = 401;
    throw err;
  }
  const matches = await bcrypt.compare(password, hash);
  if (!matches) {
    const err: any = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const { passwordHash, ...clientData } = client as any;
  const token = signClientToken(client.id);

  return {
    client: clientData,
    token,
  };
}

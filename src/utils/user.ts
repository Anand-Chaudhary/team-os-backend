export function sanitizeUser<T extends Record<string, any> | null | undefined>(user: T) {
  if (!user) return null;

  const { passwordHash, password, ...safeUser } = user as Record<string, any>;
  return safeUser as Omit<T, 'passwordHash' | 'password'>;
}

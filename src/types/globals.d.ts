export {}

declare global {
  interface CustomJwtSessionClaims {
    metadata?: {
      role?: 'superAdmin' | 'admin' | 'user';
    };
  }
}

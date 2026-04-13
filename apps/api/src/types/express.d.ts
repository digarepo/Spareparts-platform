import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        scopes: string[];
        tenantId: string;
        [key: string]: unknown;
      };
    }
  }
}

export {};

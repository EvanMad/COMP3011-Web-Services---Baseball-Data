import { Request } from 'express';

/**
 * Express request with user set by AuthGuard (JWT payload).
 */
export type AuthorisedRequest = Request & {
  user: { sub: string; username?: string };
};

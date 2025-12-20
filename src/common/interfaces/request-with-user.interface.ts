import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    id: string;
    role: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
  };
}
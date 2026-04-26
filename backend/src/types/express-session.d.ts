import 'express-session';
import { SessionUser } from './models';

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

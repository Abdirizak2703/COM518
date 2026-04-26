import { Router } from 'express';
import { forgotPassword, getSession, login, logout, register } from '../controllers/authController';
import { validateBody } from '../middleware/validateMiddleware';
import { forgotPasswordSchema, loginSchema, registerSchema } from '../validators/authSchemas';

const authRouter = Router();

authRouter.post('/login', validateBody(loginSchema), (req, res, next) => {
  login(req, res).catch(next);
});

authRouter.post('/register', validateBody(registerSchema), (req, res, next) => {
  register(req, res).catch(next);
});

authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), (req, res, next) => {
  forgotPassword(req, res).catch(next);
});

authRouter.get('/session', getSession);
authRouter.post('/logout', logout);

export { authRouter };

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByUsername, updateUserPassword } from '../dao/userDao';
import { validateStrongPassword } from '../security/passwordPolicy';
import { ApiError } from '../middleware/apiError';
import { upsertProfile } from '../dao/profileDao';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username: string; password: string };

  const user = await findUserByUsername(username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  if (user.blocked === 1) {
    res.status(403).json({ error: 'Your account is blocked. Contact support or admin.' });
    return;
  }

  req.session.user = {
    id: user.id,
    username: user.username,
    admin: user.admin === 1
  };

  res.status(200).json({ user: req.session.user });
}

export function getSession(req: Request, res: Response): void {
  if (!req.session.user) {
    res.status(401).json({ error: 'No active session.' });
    return;
  }

  res.status(200).json({ user: req.session.user });
}

export function logout(req: Request, res: Response): void {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Failed to terminate session.' });
      return;
    }

    res.clearCookie('connect.sid');
    res.status(204).send();
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { username, password, fullName, phone, homeCity, bio } = req.body as {
    username: string;
    password: string;
    fullName: string;
    phone: string;
    homeCity: string;
    bio: string;
  };
  const normalizedUsername = username.trim();

  const existingUser = await findUserByUsername(normalizedUsername);
  if (existingUser) {
    throw new ApiError(409, 'Username already exists.');
  }

  const passwordPolicy = validateStrongPassword(password);
  if (!passwordPolicy.valid) {
    throw new ApiError(400, passwordPolicy.errors.join(' '));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userID = await createUser({
    username: normalizedUsername,
    passwordHash,
    admin: false
  });

  await upsertProfile({
    userID,
    fullName: fullName.trim(),
    phone: phone.trim(),
    homeCity: homeCity.trim(),
    bio: bio.trim()
  });

  res.status(201).json({
    message: 'Account created successfully. Please login with your new credentials.',
    userID
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { username, newPassword } = req.body as { username: string; newPassword: string };
  const normalizedUsername = username.trim();

  const user = await findUserByUsername(normalizedUsername);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }

  const passwordPolicy = validateStrongPassword(newPassword);
  if (!passwordPolicy.valid) {
    throw new ApiError(400, passwordPolicy.errors.join(' '));
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.id, passwordHash);

  res.status(200).json({ message: 'Password reset successful. Please login with your new password.' });
}

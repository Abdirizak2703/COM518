import bcrypt from 'bcryptjs';
import { initDb } from '../db/initDb';
import { createUser, findUserByUsername } from '../dao/userDao';
import { validateStrongPassword } from '../security/passwordPolicy';

interface CliArgs {
  username: string | undefined;
  password: string | undefined;
  admin: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { username: undefined, password: undefined, admin: false };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--username') {
      args.username = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--password') {
      args.password = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--admin') {
      args.admin = true;
    }
  }

  return args;
}

function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 50) {
    return 'Username must be between 3 and 50 characters.';
  }
  if (!/^[A-Za-z0-9_.@+-]+$/.test(trimmed)) {
    return 'Username can contain only letters, numbers, underscore, dot, at-sign, plus, and hyphen.';
  }
  return null;
}

function printUsage(): void {
  console.log('Usage: npm run user:create -- --username <name> --password <strong-password> [--admin]');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.username || !args.password) {
    printUsage();
    process.exit(1);
  }

  const usernameError = validateUsername(args.username);
  if (usernameError) {
    console.error(usernameError);
    process.exit(1);
  }

  const passwordCheck = validateStrongPassword(args.password);
  if (!passwordCheck.valid) {
    console.error('Password does not meet policy requirements:');
    passwordCheck.errors.forEach((item) => console.error(`- ${item}`));
    process.exit(1);
  }

  await initDb();

  const existing = await findUserByUsername(args.username);
  if (existing) {
    console.error('User already exists. Choose another username.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(args.password, 10);
  const userId = await createUser({
    username: args.username.trim(),
    passwordHash: hashedPassword,
    admin: args.admin
  });

  console.log(`User created successfully with id ${userId}.`);
}

main().catch((error: unknown) => {
  console.error('Failed to create user', error);
  process.exit(1);
});

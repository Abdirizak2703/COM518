import { initDb } from '../db/initDb';
import { findUserByUsername, setUserAdminByUsername } from '../dao/userDao';

interface CliArgs {
  username: string | undefined;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { username: undefined };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--username') {
      args.username = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function printUsage(): void {
  console.log('Usage: npm run user:promote -- --username <existing-user>');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (!args.username) {
    printUsage();
    process.exit(1);
  }

  await initDb();

  const existing = await findUserByUsername(args.username.trim());
  if (!existing) {
    console.error('User not found.');
    process.exit(1);
  }

  await setUserAdminByUsername(args.username.trim(), true);
  console.log(`User ${args.username.trim()} promoted to admin successfully.`);
}

main().catch((error: unknown) => {
  console.error('Failed to promote user', error);
  process.exit(1);
});

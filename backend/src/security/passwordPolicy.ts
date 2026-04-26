export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

export function validateStrongPassword(password: string): PasswordPolicyResult {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character.');
  }
  if (/\s/.test(password)) {
    errors.push('Password cannot include whitespace.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Shared password validation — used in both frontend and API routes

export type PasswordRule = {
  label: string;
  valid: boolean;
};

export type PasswordValidationResult = {
  valid: boolean;
  rules: PasswordRule[];
  error?: string;
};

export function validatePassword(password: string): PasswordValidationResult {
  const rules: PasswordRule[] = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter (A–Z)",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter (a–z)",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One number (0–9)",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character (!@#$...)",
      valid: /[^A-Za-z0-9]/.test(password),
    },
    {
      label: "No spaces",
      valid: !/\s/.test(password),
    },
  ];

  const allValid = rules.every((r) => r.valid);

  return {
    valid: allValid,
    rules,
    error: allValid ? undefined : "Password does not meet all requirements",
  };
}

export function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
  return undefined;
}

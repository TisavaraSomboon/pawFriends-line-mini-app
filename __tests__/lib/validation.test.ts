import { validatePassword, validateEmail } from '@/lib/validation';

describe('validatePassword', () => {
  it('returns valid for a strong password', () => {
    const result = validatePassword('StrongP@ss1');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.rules.every((r) => r.valid)).toBe(true);
  });

  it('fails when password is too short', () => {
    const result = validatePassword('Ab1!');
    expect(result.valid).toBe(false);
    expect(result.rules.find((r) => r.label === 'At least 8 characters')?.valid).toBe(false);
  });

  it('fails when no uppercase letter', () => {
    const result = validatePassword('lowercase1!');
    expect(result.valid).toBe(false);
    expect(result.rules.find((r) => r.label === 'One uppercase letter (A–Z)')?.valid).toBe(false);
  });

  it('fails when no lowercase letter', () => {
    const result = validatePassword('UPPERCASE1!');
    expect(result.valid).toBe(false);
    expect(result.rules.find((r) => r.label === 'One lowercase letter (a–z)')?.valid).toBe(false);
  });

  it('fails when no digit', () => {
    const result = validatePassword('NoDigit!Pass');
    expect(result.valid).toBe(false);
    expect(result.rules.find((r) => r.label === 'One number (0–9)')?.valid).toBe(false);
  });

  it('fails when no special character', () => {
    const result = validatePassword('NoSpecial1Char');
    expect(result.valid).toBe(false);
    expect(result.rules.find((r) => r.label === 'One special character (!@#$...)')?.valid).toBe(false);
  });

  it('fails when password contains a space', () => {
    const result = validatePassword('Pass word1!');
    expect(result.valid).toBe(false);
    expect(result.rules.find((r) => r.label === 'No spaces')?.valid).toBe(false);
  });

  it('fails for empty string', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
    // At minimum: length, uppercase, lowercase, digit, special char rules all fail
    const failedRules = result.rules.filter((r) => !r.valid);
    expect(failedRules.length).toBeGreaterThanOrEqual(5);
  });

  it('returns error message when invalid', () => {
    const result = validatePassword('weak');
    expect(result.error).toBe('Password does not meet all requirements');
  });

  it('returns all 6 rules', () => {
    const result = validatePassword('anything');
    expect(result.rules).toHaveLength(6);
  });
});

describe('validateEmail', () => {
  it('returns undefined for a valid email', () => {
    expect(validateEmail('user@example.com')).toBeUndefined();
  });

  it('returns error for empty string', () => {
    expect(validateEmail('')).toBe('Email is required');
  });

  it('returns error for email without @', () => {
    expect(validateEmail('notanemail')).toBe('Invalid email address');
  });

  it('returns error for email without domain', () => {
    expect(validateEmail('user@')).toBe('Invalid email address');
  });

  it('returns error for email without local part', () => {
    expect(validateEmail('@example.com')).toBe('Invalid email address');
  });

  it('returns error for email with spaces', () => {
    expect(validateEmail('user @example.com')).toBe('Invalid email address');
  });

  it('returns undefined for email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBeUndefined();
  });

  it('returns undefined for email with plus alias', () => {
    expect(validateEmail('user+tag@example.com')).toBeUndefined();
  });
});

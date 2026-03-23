import { POST } from '@/app/api/auth/verify-otp/route';
import bcrypt from 'bcryptjs';

// ── mocks ──────────────────────────────────────────────────────────────────
const mockFindOne = jest.fn();
const mockUpdateOne = jest.fn();

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  get default() {
    return Promise.resolve({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: (...args: unknown[]) => mockFindOne(...args),
          updateOne: (...args: unknown[]) => mockUpdateOne(...args),
        }),
      }),
    });
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body: unknown, init?: { status?: number }) => ({
      _body: body,
      status: init?.status ?? 200,
      cookies: { set: jest.fn() },
    })),
  },
}));

// ── helpers ────────────────────────────────────────────────────────────────
function makeRequest(body: unknown) {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as Request;
}

function futureDate(minutesFromNow = 10) {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
}

// ── tests ──────────────────────────────────────────────────────────────────
describe('POST /api/auth/verify-otp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateOne.mockResolvedValue({});
  });

  it('returns 400 when email is missing', async () => {
    const req = makeRequest({ email: '', code: '123456' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Invalid request');
  });

  it('returns 400 when code is missing', async () => {
    const req = makeRequest({ email: 'user@example.com', code: '' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Invalid request');
  });

  it('returns 400 when code length is not 6', async () => {
    const req = makeRequest({ email: 'user@example.com', code: '12345' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Invalid request');
  });

  it('returns 400 when no OTP record exists for the email', async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest({ email: 'user@example.com', code: '123456' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Code expired. Please request a new one.');
  });

  it('returns 400 when OTP is already used', async () => {
    mockFindOne.mockResolvedValue({
      email: 'user@example.com',
      code: '$2b$10$hashed',
      used: true,
      expiresAt: futureDate(),
    });
    const req = makeRequest({ email: 'user@example.com', code: '123456' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Code expired. Please request a new one.');
  });

  it('returns 400 when OTP is expired', async () => {
    mockFindOne.mockResolvedValue({
      email: 'user@example.com',
      code: '$2b$10$hashed',
      used: false,
      expiresAt: new Date(Date.now() - 1000), // already expired
    });
    const req = makeRequest({ email: 'user@example.com', code: '123456' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Code expired. Please request a new one.');
  });

  it('returns 400 when code does not match', async () => {
    mockFindOne.mockResolvedValue({
      email: 'user@example.com',
      code: '$2b$10$hashed',
      used: false,
      expiresAt: futureDate(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const req = makeRequest({ email: 'user@example.com', code: '999999' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Incorrect code.');
  });

  it('returns 200 and marks OTP as used on success', async () => {
    mockFindOne.mockResolvedValue({
      email: 'user@example.com',
      code: '$2b$10$hashed',
      used: false,
      expiresAt: futureDate(),
    });
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const req = makeRequest({ email: 'user@example.com', code: '123456' });
    const res = await POST(req) as unknown as { _body: { ok: boolean }; status: number };
    expect(res.status).toBe(200);
    expect(res._body.ok).toBe(true);
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      { $set: { used: true } },
    );
  });
});

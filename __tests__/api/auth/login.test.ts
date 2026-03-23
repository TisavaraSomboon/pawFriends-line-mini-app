import { POST } from '@/app/api/auth/login/route';
import bcrypt from 'bcryptjs';

// ── mocks ──────────────────────────────────────────────────────────────────
const mockFindOne = jest.fn();

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  get default() {
    return Promise.resolve({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: (...args: unknown[]) => mockFindOne(...args),
        }),
      }),
    });
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn(),
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

const validUser = {
  _id: { toString: () => 'user-id-123' },
  email: 'user@example.com',
  password: '$2b$12$hashedpassword',
  name: 'Test User',
};

// ── tests ──────────────────────────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not found', async () => {
    mockFindOne.mockResolvedValue(null);
    const req = makeRequest({ email: 'unknown@example.com', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(401);
    expect(res._body.error).toBe('Invalid email or password');
  });

  it('returns 401 when password does not match', async () => {
    mockFindOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const req = makeRequest({ email: 'user@example.com', password: 'WrongPass1!' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(401);
    expect(res._body.error).toBe('Invalid email or password');
  });

  it('returns 200 with user data (no password) on success', async () => {
    mockFindOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const req = makeRequest({ email: 'user@example.com', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: Record<string, unknown>; status: number };
    expect(res.status).toBe(200);
    expect(res._body.email).toBe('user@example.com');
    expect(res._body.password).toBeUndefined();
  });

  it('sets the auth_token cookie on success', async () => {
    mockFindOne.mockResolvedValue(validUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const req = makeRequest({ email: 'user@example.com', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: unknown; status: number; cookies: { set: jest.Mock } };
    expect(res.cookies.set).toHaveBeenCalledWith(
      'auth_token',
      'mock.jwt.token',
      expect.objectContaining({ httpOnly: true }),
    );
  });
});

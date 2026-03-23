import { POST } from '@/app/api/auth/register/route';

// ── mocks ──────────────────────────────────────────────────────────────────
const mockFindOne = jest.fn();
const mockInsertOne = jest.fn();

jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  get default() {
    return Promise.resolve({
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          findOne: (...args: unknown[]) => mockFindOne(...args),
          insertOne: (...args: unknown[]) => mockInsertOne(...args),
        }),
      }),
    });
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
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

// ── tests ──────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindOne.mockResolvedValue(null); // default: no existing user
    mockInsertOne.mockResolvedValue({ insertedId: '507f1f77bcf86cd799439011' });
  });

  it('returns 400 for an invalid email', async () => {
    const req = makeRequest({ email: 'not-an-email', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Invalid email address');
  });

  it('returns 400 for missing email', async () => {
    const req = makeRequest({ email: '', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Email is required');
  });

  it('returns 400 for a weak password', async () => {
    const req = makeRequest({ email: 'user@example.com', password: 'weak' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Password does not meet all requirements');
  });

  it('returns 400 when the email is already registered', async () => {
    mockFindOne.mockResolvedValue({ email: 'user@example.com' });
    const req = makeRequest({ email: 'user@example.com', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toBe('Email already in use');
  });

  it('returns 201 and an id on successful registration', async () => {
    const req = makeRequest({ email: 'newuser@example.com', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: { id: unknown }; status: number; cookies: { set: jest.Mock } };
    expect(res.status).toBe(201);
    expect(res._body.id).toBeDefined();
  });

  it('sets the auth_token cookie on success', async () => {
    const req = makeRequest({ email: 'newuser@example.com', password: 'ValidP@ss1' });
    const res = await POST(req) as unknown as { _body: unknown; status: number; cookies: { set: jest.Mock } };
    expect(res.cookies.set).toHaveBeenCalledWith(
      'auth_token',
      'mock.jwt.token',
      expect.objectContaining({ httpOnly: true }),
    );
  });
});

import jwt from 'jsonwebtoken';
import { getAuthUser } from '@/lib/auth';

const mockGet = jest.fn();

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: (...args: unknown[]) => mockGet(...args),
  }),
}));

jest.mock('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET!;

describe('getAuthUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no auth_token cookie is present', async () => {
    mockGet.mockReturnValue(undefined);
    const result = await getAuthUser();
    expect(result).toBeNull();
  });

  it('returns the decoded payload for a valid token', async () => {
    const payload = { userId: 'user123', email: 'test@example.com' };
    mockGet.mockReturnValue({ value: 'valid.jwt.token' });
    (jwt.verify as jest.Mock).mockReturnValue(payload);

    const result = await getAuthUser();
    expect(result).toEqual(payload);
    expect(jwt.verify).toHaveBeenCalledWith('valid.jwt.token', JWT_SECRET);
  });

  it('returns null when jwt.verify throws (expired / invalid token)', async () => {
    mockGet.mockReturnValue({ value: 'bad.token' });
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const result = await getAuthUser();
    expect(result).toBeNull();
  });
});

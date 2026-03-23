import { GET, PATCH } from '@/app/api/activities/[id]/route';

// ── mocks ──────────────────────────────────────────────────────────────────
const mockActivitiesCol = jest.fn();

jest.mock('@/lib/db', () => ({
  activitiesCol: (...args: unknown[]) => mockActivitiesCol(...args),
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
const VALID_ID = '507f1f77bcf86cd799439011';

function makeContext(id: string) {
  // The route awaits params, but awaiting a plain object just returns it
  return { params: { id } } as { params: { id: string } };
}

const sampleActivity = {
  _id: VALID_ID,
  title: 'Dog Park Meetup',
  status: 'active',
  locationName: 'Central Park',
};

// ── tests ──────────────────────────────────────────────────────────────────
describe('GET /api/activities/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 when the activity does not exist', async () => {
    mockActivitiesCol.mockResolvedValue({ findOne: jest.fn().mockResolvedValue(null) });
    const res = await GET({} as Request, makeContext(VALID_ID)) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(404);
    expect(res._body.error).toBe('Not found');
  });

  it('returns the activity when found', async () => {
    mockActivitiesCol.mockResolvedValue({ findOne: jest.fn().mockResolvedValue(sampleActivity) });
    const res = await GET({} as Request, makeContext(VALID_ID)) as unknown as { _body: typeof sampleActivity; status: number };
    expect(res.status).toBe(200);
    expect(res._body).toEqual(sampleActivity);
  });
});

describe('PATCH /api/activities/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 with success:true', async () => {
    const mockUpdateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
    mockActivitiesCol.mockResolvedValue({ updateOne: mockUpdateOne });

    const req = { json: jest.fn().mockResolvedValue({ title: 'Updated Title' }) } as unknown as Request;
    const res = await PATCH(req, makeContext(VALID_ID)) as unknown as { _body: { success: boolean }; status: number };

    expect(res.status).toBe(200);
    expect(res._body.success).toBe(true);
  });

  it('passes the body fields and updatedAt to $set', async () => {
    const mockUpdateOne = jest.fn().mockResolvedValue({});
    mockActivitiesCol.mockResolvedValue({ updateOne: mockUpdateOne });

    const req = { json: jest.fn().mockResolvedValue({ status: 'ended' }) } as unknown as Request;
    await PATCH(req, makeContext(VALID_ID));

    const [, update] = mockUpdateOne.mock.calls[0];
    expect(update.$set.status).toBe('ended');
    expect(update.$set.updatedAt).toBeInstanceOf(Date);
  });
});

import { GET, POST } from '@/app/api/activities/route';

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
function makeGetRequest(queryString = '') {
  return {
    url: `http://localhost/api/activities${queryString}`,
  } as unknown as Request;
}

function makePostRequest(body: unknown) {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as Request;
}

const sampleActivity = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Dog Park Meetup',
  status: 'active',
  locationName: 'Central Park',
  date: new Date(),
};

// ── tests ──────────────────────────────────────────────────────────────────
describe('GET /api/activities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns a list of active activities', async () => {
    const mockToArray = jest.fn().mockResolvedValue([sampleActivity]);
    const mockSort = jest.fn().mockReturnValue({ toArray: mockToArray });
    const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
    mockActivitiesCol.mockResolvedValue({ find: mockFind });

    const req = makeGetRequest();
    const res = await GET(req) as unknown as { _body: typeof sampleActivity[]; status: number };

    expect(res.status).toBe(200);
    expect(res._body).toEqual([sampleActivity]);
    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ status: 'active' }));
  });
});

describe('POST /api/activities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when ownerId is missing', async () => {
    const req = makePostRequest({ title: 'Dog Park Meetup', locationName: 'Central Park' });
    const res = await POST(req) as unknown as { _body: { error: string }; status: number };
    expect(res.status).toBe(400);
    expect(res._body.error).toContain('ownerId');
  });

  it('returns 201 with the inserted id on success', async () => {
    const insertedId = '507f1f77bcf86cd799439011';
    const mockInsertOne = jest.fn().mockResolvedValue({ insertedId });
    mockActivitiesCol.mockResolvedValue({ insertOne: mockInsertOne });

    const req = makePostRequest({
      title: 'Dog Park Meetup',
      locationName: 'Central Park',
      ownerId: '507f1f77bcf86cd799439022',
    });
    const res = await POST(req) as unknown as { _body: { id: string }; status: number };

    expect(res.status).toBe(201);
    expect(res._body.id).toBe(insertedId);
  });

  it('sets status to "active" and timestamps on insert', async () => {
    const mockInsertOne = jest.fn().mockResolvedValue({ insertedId: '507f1f77bcf86cd799439011' });
    mockActivitiesCol.mockResolvedValue({ insertOne: mockInsertOne });

    const req = makePostRequest({ title: 'Meetup', ownerId: '507f1f77bcf86cd799439022' });
    await POST(req);

    const insertedDoc = mockInsertOne.mock.calls[0][0];
    expect(insertedDoc.status).toBe('active');
    expect(insertedDoc.createdAt).toBeInstanceOf(Date);
    expect(insertedDoc.updatedAt).toBeInstanceOf(Date);
  });
});

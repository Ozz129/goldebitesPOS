import { RequestIdMiddleware, RequestWithId } from './request-id.middleware';

describe('RequestIdMiddleware', () => {
  const middleware = new RequestIdMiddleware();

  function createRequest(headers: Record<string, string> = {}): RequestWithId {
    return { headers } as unknown as RequestWithId;
  }

  function createResponse() {
    return { setHeader: jest.fn() };
  }

  it('generates a new request id when none is provided', () => {
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    middleware.use(req, res as never, next);

    expect(req.requestId).toEqual(expect.any(String));
    expect(req.requestId.length).toBeGreaterThan(0);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('reuses an incoming X-Request-Id header for correlation across services', () => {
    const req = createRequest({ 'x-request-id': 'incoming-id-123' });
    const res = createResponse();
    const next = jest.fn();

    middleware.use(req, res as never, next);

    expect(req.requestId).toBe('incoming-id-123');
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      'incoming-id-123',
    );
  });
});

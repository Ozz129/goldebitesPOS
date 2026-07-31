import { parseDurationMs } from './duration.util';

describe('parseDurationMs', () => {
  it('parses seconds', () => {
    expect(parseDurationMs('30s')).toBe(30 * 1000);
  });

  it('parses minutes', () => {
    expect(parseDurationMs('15m')).toBe(15 * 60 * 1000);
  });

  it('parses hours', () => {
    expect(parseDurationMs('1h')).toBe(60 * 60 * 1000);
  });

  it('parses days', () => {
    expect(parseDurationMs('7d')).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('parses raw milliseconds', () => {
    expect(parseDurationMs('500ms')).toBe(500);
  });

  it('throws on an invalid format', () => {
    expect(() => parseDurationMs('not-a-duration')).toThrow(
      'Invalid duration format',
    );
  });

  it('throws on an unsupported unit', () => {
    expect(() => parseDurationMs('5w')).toThrow('Invalid duration format');
  });
});

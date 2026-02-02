import { calculateAge } from './date-util';

describe('date-util.calculateAge', () => {
  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2025-12-30T00:00:00Z'));
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('parses slash-delimited date and returns correct age', () => {
    const age = calculateAge('08/01/1979');
    expect(age).toBe(46);
  });

  it('parses dot-delimited date and returns correct age', () => {
    const age = calculateAge('08.01.1979');
    expect(age).toBe(46);
  });

  it('parses dash-delimited date and returns correct age', () => {
    const age = calculateAge('01-01-2003');
    expect(age).toBe(22);
  });

  it('parses YYMMDD compact format correctly', () => {
    const age = calculateAge('790108');
    expect(age).toBe(46);
  });

  it('handles leap day correctly', () => {
    const age = calculateAge('29.02.2004');
    expect(age).toBe(21);
  });

  it('returns 0 for invalid input', () => {
    expect(calculateAge('abc')).toBe(0);
    expect(calculateAge('123')).toBe(0);
    expect(calculateAge('')).toBe(0);
  });
});

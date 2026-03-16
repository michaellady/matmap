import { calculateTemperatureScore, temperatureToColor } from '../../utils/temperature';

describe('calculateTemperatureScore', () => {
  it('returns 0 for never-taught technique', () => {
    const score = calculateTemperatureScore(0, null, 'guard');
    expect(score).toBe(0);
  });

  it('returns 0 for never-taught standing', () => {
    const score = calculateTemperatureScore(0, null, 'standing');
    expect(score).toBe(0);
  });

  it('scores ~2.3 for guard taught 1x, 25 days ago', () => {
    const score = calculateTemperatureScore(1, 25, 'guard');
    expect(score).toBeCloseTo(2.3, 0);
  });

  it('scores ~7.7 for guard taught at expected rate, 10 days ago', () => {
    const score = calculateTemperatureScore(2.67, 10, 'guard');
    expect(score).toBeCloseTo(7.7, 0);
  });

  it('scores ~5.1 for guard taught at expected rate, 21 days ago', () => {
    const score = calculateTemperatureScore(2.67, 21, 'guard');
    expect(score).toBeCloseTo(5.1, 0);
  });

  it('produces different scores for standing vs guard with same raw numbers', () => {
    const standingScore = calculateTemperatureScore(2, 10, 'standing');
    const guardScore = calculateTemperatureScore(2, 10, 'guard');
    expect(standingScore).toBeGreaterThan(guardScore);
  });

  it('handles pinning category with 0 expected count', () => {
    const score = calculateTemperatureScore(0, null, 'pinning');
    expect(score).toBe(0);
    // With recency only
    const score2 = calculateTemperatureScore(1, 5, 'pinning');
    expect(score2).toBeGreaterThan(0);
  });

  it('clamps score to 10 maximum', () => {
    const score = calculateTemperatureScore(10, 0, 'guard');
    expect(score).toBe(10);
  });

  it('clamps score to 0 minimum', () => {
    const score = calculateTemperatureScore(0, null, 'standing');
    expect(score).toBe(0);
  });
});

describe('temperatureToColor', () => {
  it('returns gray for score 0', () => {
    expect(temperatureToColor(0)).toBe('#6B7280');
  });

  it('returns blue-ish for score ~2', () => {
    const color = temperatureToColor(2);
    expect(color).not.toBe('#6B7280');
    expect(color).not.toBe('#3B82F6');
  });

  it('returns blue for score 3', () => {
    expect(temperatureToColor(3)).toBe('#3B82F6');
  });

  it('returns orange for score 6', () => {
    expect(temperatureToColor(6)).toBe('#F59E0B');
  });

  it('returns red for score 10', () => {
    expect(temperatureToColor(10)).toBe('#EF4444');
  });
});

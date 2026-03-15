import { calculateTemperatureScore, temperatureToColor } from '../../utils/temperature';

describe('calculateTemperatureScore', () => {
  it('returns 0 for never-taught technique', () => {
    const score = calculateTemperatureScore(0, null, 'guard');
    expect(score).toBe(0);
  });

  it('returns 0 for never-taught standing_zoom_in', () => {
    const score = calculateTemperatureScore(0, null, 'standing_zoom_in');
    expect(score).toBe(0);
  });

  it('scores ~2.3 for guard taught 1x, 25 days ago', () => {
    // ratio = 1/2.7 = 0.37, recency = max(0, 10 - 25/3) = max(0, 1.67) = 1.67
    // score = 0.37*3 + 1.67*0.7 = 1.11 + 1.17 = 2.28
    const score = calculateTemperatureScore(1, 25, 'guard');
    expect(score).toBeCloseTo(2.3, 0);
  });

  it('scores ~7.7 for guard taught at expected rate, 10 days ago', () => {
    // expectedFreq for guard = 16/6 = 2.67
    // ratio = 2.67/2.67 = 1.0, recency = 10 - 10/3 = 6.67
    // score = 1.0*3 + 6.67*0.7 = 3.0 + 4.67 = 7.67
    const score = calculateTemperatureScore(2.67, 10, 'guard');
    expect(score).toBeCloseTo(7.7, 0);
  });

  it('scores ~5.1 for guard taught at expected rate, 21 days ago', () => {
    // ratio = 1.0, recency = 10 - 21/3 = 10 - 7 = 3
    // score = 3.0 + 3*0.7 = 3.0 + 2.1 = 5.1
    const score = calculateTemperatureScore(2.67, 21, 'guard');
    expect(score).toBeCloseTo(5.1, 0);
  });

  it('produces different scores for standing_zoom_in vs guard with same raw numbers', () => {
    const standingScore = calculateTemperatureScore(2, 10, 'standing_zoom_in');
    const guardScore = calculateTemperatureScore(2, 10, 'guard');
    // standing expected = 1.6, ratio = 2/1.6 = 1.25 → 3.75
    // guard expected = 2.67, ratio = 2/2.67 = 0.75 → 2.25
    // Both have same recency: 10 - 10/3 = 6.67 → 4.67
    // standing: 3.75 + 4.67 = 8.42
    // guard: 2.25 + 4.67 = 6.92
    expect(standingScore).toBeGreaterThan(guardScore);
  });

  it('clamps score to 10 maximum', () => {
    const score = calculateTemperatureScore(10, 0, 'guard');
    expect(score).toBe(10);
  });

  it('clamps score to 0 minimum', () => {
    const score = calculateTemperatureScore(0, null, 'standing_zoom_in');
    expect(score).toBe(0);
  });
});

describe('temperatureToColor', () => {
  it('returns gray for score 0', () => {
    expect(temperatureToColor(0)).toBe('#6B7280');
  });

  it('returns blue-ish for score ~2', () => {
    const color = temperatureToColor(2);
    // Between gray (#6B7280) and blue (#3B82F6), closer to blue
    expect(color).not.toBe('#6B7280');
    expect(color).not.toBe('#3B82F6');
  });

  it('returns blue for score 3', () => {
    expect(temperatureToColor(3)).toBe('#3B82F6');
  });

  it('returns orange for score 6', () => {
    expect(temperatureToColor(6)).toBe('#F59E0B');
  });

  it('returns orange-ish for score 5', () => {
    const color = temperatureToColor(5);
    // Between blue and orange
    expect(color).not.toBe('#3B82F6');
    expect(color).not.toBe('#F59E0B');
  });

  it('returns red for score 10', () => {
    expect(temperatureToColor(10)).toBe('#EF4444');
  });

  it('returns red-ish for score 9', () => {
    const color = temperatureToColor(9);
    expect(color).not.toBe('#F59E0B');
    expect(color).not.toBe('#EF4444');
  });
});

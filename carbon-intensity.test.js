// Import the function to test
const { calculatePercentile } = require('./carbon-intensity.15m.js');

describe('calculatePercentile', () => {
  // Simple test data
  const testData = [
    { carbonIntensity: 100 }, // Cleanest
    { carbonIntensity: 200 },
    { carbonIntensity: 300 },
    { carbonIntensity: 400 },
    { carbonIntensity: 500 }  // Dirtiest
  ];

  // Real-world test data from API response
  const realWorldData = [
    { carbonIntensity: 743 },
    { carbonIntensity: 748 },
    { carbonIntensity: 775 },
    { carbonIntensity: 836 },
    { carbonIntensity: 906 },
    { carbonIntensity: 827 },
    { carbonIntensity: 827 },
    { carbonIntensity: 827 },
    { carbonIntensity: 827 },
    { carbonIntensity: 839 },
    { carbonIntensity: 827 },
    { carbonIntensity: 890 },
    { carbonIntensity: 919 },
    { carbonIntensity: 926 },
    { carbonIntensity: 924 },
    { carbonIntensity: 920 },
    { carbonIntensity: 926 },
    { carbonIntensity: 818 },
    { carbonIntensity: 895 },
    { carbonIntensity: 874 },
    { carbonIntensity: 804 },
    { carbonIntensity: 765 },
    { carbonIntensity: 745 },
    { carbonIntensity: 743 }
  ];

  // Original tests
  test('cleanest value should be 0th percentile', () => {
    expect(calculatePercentile(100, testData)).toBe(0); // 100 is the cleanest
  });

  test('dirtiest value should be 100th percentile', () => {
    expect(calculatePercentile(500, testData)).toBe(100); // 500 is the dirtiest
  });

  test('middle value should be 50th percentile', () => {
    expect(calculatePercentile(300, testData)).toBe(50); // 300 is the 50th percentile (3rd out of 5 values)
  });

  test('value between data points should return appropriate percentile', () => {
    expect(calculatePercentile(250, testData)).toBe(40); // 250 is between 200 and 300
  });

  test('value cleaner than all data should return 0th percentile', () => {
    expect(calculatePercentile(50, testData)).toBe(0); // 50 is cleaner than all
  });

  test('value dirtier than all data should return 100th percentile', () => {
    expect(calculatePercentile(600, testData)).toBe(100); // 600 is dirtier than all
  });

  // Edge cases
  test('empty data array should handle gracefully', () => {
    expect(calculatePercentile(100, [])).toBe(0); // No data should return 0 percentile
  });

  test('single value in data array should work', () => {
    expect(calculatePercentile(100, [{ carbonIntensity: 100 }])).toBe(0); // Only value should return 0
  });

  // New tests with real-world data
  test('cleanest real-world value should get correct percentile', () => {
    expect(calculatePercentile(743, realWorldData)).toBe(0); // 743 is the cleanest
  });

  test('dirtiest real-world value should get 0 percentile', () => {
    expect(calculatePercentile(926, realWorldData)).toBe(100); // 926 is the dirtiest
  });

  test('middle real-world value should get correct percentile', () => {
    expect(calculatePercentile(827, realWorldData)).toBe(43.75); // Corrected expected value
  });

  // Real-world edge cases
  test('value cleaner than all real-world data should return 0th percentile', () => {
    expect(calculatePercentile(700, realWorldData)).toBe(0); // 700 is cleaner than all
  });

  test('value dirtier than all real-world data should return 100th percentile', () => {
    expect(calculatePercentile(1000, realWorldData)).toBe(100); // 1000 is dirtier than all
  });

  test('duplicate real-world value should get correct percentile', () => {
    expect(calculatePercentile(827, realWorldData)).toBe(43.75); // Corrected expected value
  });

  test('value between real-world data points should get correct percentile', () => {
    expect(calculatePercentile(744, realWorldData)).toBe(8.33); // Between 743 and 745
  });
});
import { parseNEM12 } from "@/lib/parse";
import { describe, expect, test } from "vitest";

describe("parseNEM12", () => {
  // Test successful parsing of a valid NEM12 file
  test("should parse a valid NEM12 file correctly", () => {
    const validNEM12Content = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,,,20180101123022,
900`;

    const result = parseNEM12(validNEM12Content);

    expect(result).toBeDefined();
    expect(Object.keys(result)).toContain("NMI123456789");
    expect(result["NMI123456789"].intervalLength).toBe(30);
    expect(Object.keys(result["NMI123456789"].intervalValues).length).toBe(48); // 48 intervals for a day with 30-minute intervals
  });

  // Test handling of empty input
  test("should throw error for empty input", () => {
    expect(() => parseNEM12("")).toThrow(
      "Invalid MDFF data: Missing header block"
    );
  });

  // Test handling of invalid header
  test("should throw error for invalid header", () => {
    const invalidHeader = `101,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,`;

    expect(() => parseNEM12(invalidHeader)).toThrow(
      "Invalid MDFF data: Missing header block"
    );
  });

  // Test handling of malformed data records
  test("should handle malformed 300 record", () => {
    const malformedDataRecord = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,A,,,20180101123022,
900`;

    expect(() => parseNEM12(malformedDataRecord)).toThrow(
      "Invalid MDFF data: Invalid interval value at line 3"
    );
  });

  // Test handling of missing end record
  test("should throw error for missing 900 record", () => {
    const missingEndRecord = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,,,20180101123022,`;

    expect(() => parseNEM12(missingEndRecord)).toThrow(
      "Invalid MDFF data: Missing end block"
    );
  });

  // Test handling of multiple NMI records
  test("should correctly parse multiple NMI records", () => {
    const multipleNMIContent = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,,,20180101123022,
200,NMI987654321,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,A,,,20180101123022,
900`;

    const result = parseNEM12(multipleNMIContent);

    expect(Object.keys(result).length).toBe(2);
    expect(result["NMI123456789"]).toBeDefined();
    expect(result["NMI987654321"]).toBeDefined();
    expect(result["NMI123456789"].intervalLength).toBe(30);
    expect(result["NMI987654321"].intervalLength).toBe(30);
  });

  // Test handling of multiple data records for a single NMI
  test("should correctly parse multiple data records for a single NMI", () => {
    const multipleDataRecords = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,,,20180101123022,
300,20180102,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,A,,,20180102123022,
900`;

    const result = parseNEM12(multipleDataRecords);

    expect(Object.keys(result).length).toBe(1);
    expect(result["NMI123456789"]).toBeDefined();

    // We should have 96 interval values (48 for each day)
    const intervalValues = result["NMI123456789"].intervalValues;
    expect(Object.keys(intervalValues).length).toBe(96);

    // Check that we have timestamps from both days
    const timestamps = Object.keys(intervalValues);
    const day1Timestamps = timestamps.filter((ts) =>
      ts.startsWith("2018-01-01")
    );
    const day2Timestamps = timestamps.filter((ts) =>
      ts.startsWith("2018-01-02")
    );
    const day3Timestamps = timestamps.filter((ts) =>
      ts.startsWith("2018-01-03")
    );

    expect(day1Timestamps.length).toBe(47);
    expect(day2Timestamps.length).toBe(48);
    expect(day3Timestamps.length).toBe(1);
  });

  // Test handling of different values in interval data
  test("should correctly handle different values in interval data", () => {
    const differentValues = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1E2,E1,E1,N1,01002,kWh,30,
300,20180101,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,A,,,20180101123022,
900`;

    const result = parseNEM12(differentValues);

    const intervalValues = Object.values(result["NMI123456789"].intervalValues);

    // Check a few specific values
    expect(intervalValues[0]).toBe(0);
    expect(intervalValues[10]).toBe(10);
    expect(intervalValues[20]).toBe(20);
    expect(intervalValues[47]).toBe(47);
  });
});

import { describe, expect, it } from "vitest";
import { parse200Block } from "../../src/lib/parse200Block";

describe("parse200Block", () => {
  it("should parse valid 200 and 300 blocks correctly", () => {
    // Sample NEM12 data with 200 and 300 records
    const sampleData = [
      "200,NMI123456789,E1Q1,,E1,N1,03045,WH,30",
      "300,20220101,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480",
    ];

    const result = parse200Block(sampleData);

    // Expected structure
    expect(result).toHaveProperty("NMI123456789");
    expect(result.NMI123456789).toHaveProperty("intervalLength", 30);
    expect(result.NMI123456789).toHaveProperty("intervalValues");

    // Check a few specific interval values
    const intervalValues = result.NMI123456789.intervalValues;
    expect(Object.keys(intervalValues).length).toBe(48); // 48 intervals for 30-minute data

    // Check first interval (00:30)
    expect(intervalValues["2022-01-01 00:30:00"]).toBe(10);

    // Check last interval (24:00/00:00)
    expect(intervalValues["2022-01-02 00:00:00"]).toBe(480);
  });

  it("should handle multiple 300 blocks for the same NMI", () => {
    const sampleData = [
      "200,NMI123456789,E1,1,E1,N1,METER1,KWH,30,20220101",
      "300,20220101,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480",
      "300,20220102,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240",
    ];

    const result = parse200Block(sampleData);

    // Check that we have data for both days
    expect(result.NMI123456789.intervalValues).toHaveProperty(
      "2022-01-01 00:30:00"
    );
    expect(result.NMI123456789.intervalValues).toHaveProperty(
      "2022-01-02 00:30:00"
    );

    // Check values from first day
    expect(result.NMI123456789.intervalValues["2022-01-01 12:00:00"]).toBe(240);

    // Check values from second day
    expect(result.NMI123456789.intervalValues["2022-01-02 12:00:00"]).toBe(120);
  });

  it("should handle multiple NMIs", () => {
    const sampleData = [
      "200,NMI123456789,E1,1,E1,N1,METER1,KWH,30,20220101",
      "300,20220101,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480",
      "200,NMI987654321,E1,1,E1,N1,METER2,KWH,15,20220101",
      "300,20220101,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,95,100,5,10,15,95,100,5,10,15,95,100,5,10,15,95,100,5,10,15",
    ];

    const result = parse200Block(sampleData);

    // Check that we have data for both NMIs
    expect(result).toHaveProperty("NMI123456789");
    expect(result).toHaveProperty("NMI987654321");

    // Check interval lengths
    expect(result.NMI123456789.intervalLength).toBe(30);
    expect(result.NMI987654321.intervalLength).toBe(15);

    // Check that the second NMI has more intervals (15-minute vs 30-minute)
    expect(Object.keys(result.NMI987654321.intervalValues).length).toBe(96); // 96 intervals for 15-minute data
    expect(Object.keys(result.NMI123456789.intervalValues).length).toBe(48); // 48 intervals for 30-minute data
  });

  it("should throw an error for invalid interval length", () => {
    const invalidIntervalData = [
      "200,NMI123456789,E1,1,E1,N1,METER1,KWH,10,20220101", // 10 is not a valid interval (not 5, 15, or 30)
      "300,20220101,10,20,30,40,50,60,70,80,90,100",
    ];

    expect(() => parse200Block(invalidIntervalData)).toThrow(
      "Invalid MDFF data: Invalid interval length"
    );
  });

  it("should throw an error for missing 200 record", () => {
    const missingHeaderData = [
      "300,20220101,10,20,30,40,50,60,70,80,90,100", // Missing 200 record before 300
    ];

    expect(() => parse200Block(missingHeaderData)).toThrow(
      "Invalid MDFF data: Missing 200 data details record"
    );
  });

  it("should throw an error for invalid interval value", () => {
    const invalidValueData = [
      "200,NMI123456789,E1,1,E1,N1,METER1,KWH,30,20220101",
      "300,20220101,10,20,30,-40,50,60,70,80,90,100", // Negative value is invalid
    ];

    expect(() => parse200Block(invalidValueData)).toThrow(
      "Invalid MDFF data: Invalid interval value"
    );
  });

  it("should throw an error for unrecognized record indicator", () => {
    const invalidRecordData = [
      "200,NMI123456789,E1,1,E1,N1,METER1,KWH,30,20220101",
      "300,20220101,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160,170,180,190,200,210,220,230,240,250,260,270,280,290,300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480",
      "600,INVALID RECORD", // 600 is not a valid record indicator
    ];

    expect(() => parse200Block(invalidRecordData)).toThrow(
      "Invalid MDFF data: Invalid record indicator"
    );
  });
});

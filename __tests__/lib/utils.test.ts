import { describe, expect, it } from "vitest";
import { DataBlockRecord } from "../../src/lib/types";
import {
  createSQLInsertStatementFromDataBlocks,
  getIntervalDateInMs,
} from "../../src/lib/utils";

describe("getIntervalDateInMs", () => {
  it("should convert NEM12 date format to milliseconds correctly", () => {
    // Test with a few different dates
    expect(getIntervalDateInMs("20220101")).toBe(
      new Date("2022/01/01").getTime()
    );
    expect(getIntervalDateInMs("20221231")).toBe(
      new Date("2022/12/31").getTime()
    );
    expect(getIntervalDateInMs("20230415")).toBe(
      new Date("2023/04/15").getTime()
    );
  });

  it("should handle leap years correctly", () => {
    // February 29 in a leap year
    expect(getIntervalDateInMs("20200229")).toBe(
      new Date("2020/02/29").getTime()
    );
  });
});

describe("createSQLInsertStatementFromDataBlocks", () => {
  it("should create a valid SQL insert statement from data blocks", () => {
    // Create a sample data block
    const dataBlock: DataBlockRecord = {
      NMI123456789: {
        intervalLength: 30,
        intervalValues: {
          "2022-01-01 00:30:00": 10,
          "2022-01-01 01:00:00": 20,
        },
      },
    };

    const sql = createSQLInsertStatementFromDataBlocks(dataBlock);

    // Check that the SQL statement is formatted correctly
    expect(sql).toContain(
      'INSERT INTO meter_readings ("nmi", "timestamp", "consumption")'
    );
    expect(sql).toContain("VALUES");
    expect(sql).toContain("('NMI123456789', '2022-01-01 00:30:00', 10.000)");
    expect(sql).toContain("('NMI123456789', '2022-01-01 01:00:00', 20.000)");
    expect(sql).toContain(";");
  });

  it("should handle multiple NMIs in the data blocks", () => {
    // Create a sample data block with multiple NMIs
    const dataBlock: DataBlockRecord = {
      NMI123456789: {
        intervalLength: 30,
        intervalValues: {
          "2022-01-01 00:30:00": 10,
          "2022-01-01 01:00:00": 20,
        },
      },
      NMI987654321: {
        intervalLength: 15,
        intervalValues: {
          "2022-01-01 00:15:00": 5,
          "2022-01-01 00:30:00": 10,
        },
      },
    };

    const sql = createSQLInsertStatementFromDataBlocks(dataBlock);

    // Check that the SQL statement includes both NMIs
    expect(sql).toContain("('NMI123456789', '2022-01-01 00:30:00', 10.000)");
    expect(sql).toContain("('NMI123456789', '2022-01-01 01:00:00', 20.000)");
    expect(sql).toContain("('NMI987654321', '2022-01-01 00:15:00', 5.000)");
    expect(sql).toContain("('NMI987654321', '2022-01-01 00:30:00', 10.000)");
  });
});

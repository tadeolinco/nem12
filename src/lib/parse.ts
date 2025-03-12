import { format } from "date-fns";
import { DataBlockRecord } from "./types";
import { getIntervalDateInMs } from "./utils";

const MINUTES_IN_DAY = 60 * 24;
const MILLISECONDS_IN_MINUTE = 60 * 1000;

export const parseNEM12 = (text: string) => {
  const lines = text.trim().split("\n");
  const headerBlock = lines[0].split(",");

  const header = {
    recordIndicator: headerBlock[0],
    versionHeader: headerBlock[1],
  };

  if (header.recordIndicator !== "100")
    throw new Error("Invalid MDFF data: Missing header block");

  if (header.versionHeader !== "NEM12")
    throw new Error("Invalid MDFF data: Invalid version header");

  const endBlock = lines[lines.length - 1].split(",");
  const end = { recordIndicator: endBlock[0] };

  if (end.recordIndicator !== "900")
    throw new Error("Invalid MDFF data: Missing end block");

  const dataBlocks: DataBlockRecord = {};

  // to hold current nmi the last 200 block is referencing
  let currentNMI: string | null = null;

  // skipping header and end block
  for (let index = 1; index < lines.length - 1; index++) {
    const line = lines[index];
    const chunks = line.split(",");
    const recordIndicator = Number(chunks[0]);

    if (recordIndicator === 200) {
      currentNMI = chunks[1];
      const intervalLength = Number(chunks[8]);
      if (isNaN(intervalLength) || ![5, 15, 30].includes(intervalLength)) {
        throw new Error(
          `Invalid MDFF data: Invalid interval length at line ${index + 1}`
        );
      }
      // setup datablock for that NMI
      if (!(currentNMI in dataBlocks)) {
        dataBlocks[currentNMI] = {
          intervalLength,
          intervalValues: {},
        };
      }
    } else if (recordIndicator === 300) {
      if (currentNMI === null)
        throw new Error(
          `Invalid MDFF data: Missing 200 data details record at ${index + 1}`
        );

      // NEM12 MMDDF has their own date format, must convert to something JS can read
      const blockDateMs = getIntervalDateInMs(chunks[1]);

      const intervalLength = dataBlocks[currentNMI].intervalLength;

      // expected number of values
      const intervalCount = MINUTES_IN_DAY / intervalLength;
      const intervalValues = chunks.slice(2, intervalCount + 2);

      for (
        let intervalIndex = 0;
        intervalIndex < intervalValues.length;
        intervalIndex++
      ) {
        // add 1, since meter reading is end of interval
        // eg. 1st reading is from 00:00 to 00:15, we use 00:015 as the timestamp
        const msDiff =
          (intervalIndex + 1) * intervalLength * MILLISECONDS_IN_MINUTE;
        const intervalDateMs = blockDateMs + msDiff;
        const timestamp = format(
          new Date(intervalDateMs),
          "yyyy-MM-dd HH:mm:ss"
        );
        const newValue = Number(intervalValues[intervalIndex]);
        if (isNaN(newValue) || newValue < 0) {
          throw new Error(
            `Invalid MDFF data: Invalid interval value at line ${
              index + 1
            }, index ${intervalIndex}, value ${intervalValues[intervalIndex]}`
          );
        }
        dataBlocks[currentNMI].intervalValues[timestamp] =
          (dataBlocks[currentNMI].intervalValues[timestamp] ?? 0) + newValue;
      }
    } else if (recordIndicator === 400) {
      // Ignored
    } else if (recordIndicator === 500) {
      // Ignored
    } else {
      // Throw error if record indicator is not recognized
      throw new Error(
        `Invalid MDFF data: Invalid record indicator at line ${index + 1}`
      );
    }
  }

  return dataBlocks;
};

import { parse200Block } from "./parse200Block";
import { DataBlockRecord } from "./types";

export const parseNEM12 = async (text: string): Promise<DataBlockRecord> => {
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

  const blocksToBeParsed: Promise<DataBlockRecord>[] = [];

  const nowSplit = performance.now();
  let blockStartIndex = 1;
  // skipping header and end block
  for (let index = 1; index < lines.length - 1; index++) {
    const line = lines[index];

    if (line.startsWith("200")) {
      if (index !== blockStartIndex) {
        blocksToBeParsed.push(
          parse200Block(lines.slice(blockStartIndex, index))
        );
      }
      blockStartIndex = index;
    }
  }
  blocksToBeParsed.push(parse200Block(lines.slice(blockStartIndex, -1)));

  const endSplit = performance.now();
  console.log(`Time taken to split: ${endSplit - nowSplit} milliseconds`);

  console.log("blocksToBeParsed", blocksToBeParsed.length);
  const nowPromise = performance.now();
  const dataRecordBlocks = await Promise.all(blocksToBeParsed);
  const endPromise = performance.now();
  console.log(`Time taken to parse: ${endPromise - nowPromise} milliseconds`);

  const totalDataBlock: DataBlockRecord = {};

  const nowCompute = performance.now();
  for (const dataBlock of dataRecordBlocks) {
    for (const nmi in dataBlock) {
      if (!(nmi in totalDataBlock)) {
        totalDataBlock[nmi] = dataBlock[nmi];
      } else {
        for (const timestamp in dataBlock[nmi].intervalValues) {
          totalDataBlock[nmi].intervalValues[timestamp] =
            (totalDataBlock[nmi].intervalValues[timestamp] ?? 0) +
            dataBlock[nmi].intervalValues[timestamp];
        }
      }
    }
  }

  const endCompute = performance.now();
  console.log(`Time taken to compute: ${endCompute - nowCompute} milliseconds`);

  return totalDataBlock;
};

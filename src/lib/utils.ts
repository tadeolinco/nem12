import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DataBlockRecord } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIntervalDateInMs(chunk: string) {
  const year = chunk.slice(0, 4);
  const month = chunk.slice(4, 6);
  const day = chunk.slice(6, 8);

  return new Date(`${year}/${month}/${day}`).getTime();
}

export function createSQLInsertStatementFromDataBlocks(
  dataBlocks: DataBlockRecord,
) {
  let sqlInsertStatement = `INSERT INTO meter_readings ("nmi", "timestamp", "consumption")`;
  sqlInsertStatement += `\nVALUES`;
  for (const nmi in dataBlocks) {
    const valuesRow = Object.entries(dataBlocks[nmi].intervalValues).map(
      ([timeStamp, consumption]) => {
        return `('${nmi}', '${timeStamp}', ${consumption.toFixed(3)})`;
      },
    );
    sqlInsertStatement += "\n" + valuesRow.join(",\n");
  }
  sqlInsertStatement += ";";
  return sqlInsertStatement;
}

/**
 * NEM12 Parser Worker
 *
 * Web Worker that handles parsing of NEM12 CSV files in a non-blocking way.
 * Uses generator functions to process data incrementally and report progress.
 */

import { DataBlockRecord, ParserWorkerMessage } from "@/lib/types";
import { createSQLInsertStatementFromDataBlocks } from "@/lib/utils";
import { format } from "date-fns";
import { generateNEM12Blocks } from "../lib/parse-generator";
const worker: Worker = self as unknown as Worker;

worker.onmessage = (event: MessageEvent<string>) => {
  const text = event.data;

  async function parseCSV() {
    try {
      const dataBlock: DataBlockRecord = {};
      const consumptionChartData: Record<string, number | string | null>[] = [];
      let totalConsumption = 0;
      let minTimeStamp = Infinity;
      let maxTimeStamp = -Infinity;
      let minimumIntervalLength: number = Infinity;

      for await (const item of generateNEM12Blocks(text)) {
        for (const nmi in item.block) {
          if (!dataBlock[nmi]) {
            dataBlock[nmi] = {
              intervalLength: item.block[nmi].intervalLength,
              intervalValues: item.block[nmi].intervalValues,
            };
          } else {
            for (const timestamp in item.block[nmi].intervalValues) {
              dataBlock[nmi].intervalValues[timestamp] =
                (dataBlock[nmi].intervalValues[timestamp] ?? 0) +
                item.block[nmi].intervalValues[timestamp];
            }
          }
        }

        worker.postMessage({
          type: "progress",
          progress: item.progress,
        } as ParserWorkerMessage);
      }

      Object.keys(dataBlock).forEach((nmi) => {
        for (const timestamp in dataBlock[nmi].intervalValues) {
          const timestampNumber = new Date(timestamp).getTime();
          minTimeStamp = Math.min(minTimeStamp, timestampNumber);
          maxTimeStamp = Math.max(maxTimeStamp, timestampNumber);
          totalConsumption += dataBlock[nmi].intervalValues[timestamp];
        }

        minimumIntervalLength = Math.min(
          minimumIntervalLength,
          dataBlock[nmi].intervalLength
        );
      });

      let currTimestamp = minTimeStamp;
      while (currTimestamp <= maxTimeStamp) {
        const currTimestampNumber = new Date(currTimestamp).getTime();
        const datetime = format(new Date(currTimestamp), "yyyy-MM-dd HH:mm:ss");

        const row: Record<string, number | string | null> = {
          timestamp: currTimestampNumber,
          name: datetime,
        };

        for (const nmi in dataBlock) {
          const consumption = dataBlock[nmi].intervalValues[datetime];
          row[nmi] = consumption ?? null;
        }

        consumptionChartData.push(row);

        currTimestamp += minimumIntervalLength * 60 * 1000;
      }

      worker.postMessage({
        type: "data",
        data: {
          sqlStatements: createSQLInsertStatementFromDataBlocks(dataBlock),
          consumptionChartData,
          totalConsumption,
          minTimeStamp,
          maxTimeStamp,
          nmiList: Object.keys(dataBlock),
        },
      } as ParserWorkerMessage);
    } catch (err) {
      worker.postMessage({
        type: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      } as ParserWorkerMessage);
    }
  }

  parseCSV();
};

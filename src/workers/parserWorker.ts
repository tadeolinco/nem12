import { DataBlockRecord } from "@/lib/types";
import { generateNEM12Blocks } from "../lib/parse-generator";
const worker: Worker = self as unknown as Worker;

worker.onmessage = (event: MessageEvent<string>) => {
  const text = event.data;

  async function parseCSV() {
    try {
      const dataBlock: DataBlockRecord = {};

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
          type: "data",
          progress: item.progress,
          data: item.progress === 1 ? dataBlock : {},
        });
      }
    } catch (err) {
      worker.postMessage({
        type: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  parseCSV();
};

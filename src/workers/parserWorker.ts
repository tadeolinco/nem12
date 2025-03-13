import { generateNEM12Blocks } from "../lib/parse-generator";
const worker: Worker = self as unknown as Worker;

worker.onmessage = (event: MessageEvent<string>) => {
  const text = event.data;

  async function parseCSV() {
    try {
      for await (const item of generateNEM12Blocks(text)) {
        worker.postMessage({
          type: "data",
          progress: item.progress,
          data: item.block,
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

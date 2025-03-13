"use client";

import { createParserWorker } from "@/lib/create-worker";
import { DataBlockRecord, ParserWorkerMessage } from "@/lib/types";
import { useState } from "react";

export default function Page() {
  const [progress, setProgress] = useState<number | null>(null);
  const [dataBlock, setDataBlock] = useState<DataBlockRecord | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);
    const file = formData.get("file") as File;
    const text = await file.text();

    setProgress(0);
    setDataBlock({});

    const parserWorker = createParserWorker();
    parserWorker.onmessage = (event: MessageEvent<ParserWorkerMessage>) => {
      if (event.data.type === "data") {
        setProgress(event.data.progress);
        const block = event.data.data;
        setDataBlock((dataBlock) => {
          const newDataBlock = { ...dataBlock };

          for (const nmi in block) {
            if (!newDataBlock[nmi]) {
              newDataBlock[nmi] = {
                intervalLength: block[nmi].intervalLength,
                intervalValues: block[nmi].intervalValues,
              };
            } else {
              for (const timestamp in block[nmi].intervalValues) {
                newDataBlock[nmi].intervalValues[timestamp] =
                  (newDataBlock[nmi].intervalValues[timestamp] ?? 0) +
                  block[nmi].intervalValues[timestamp];
              }
            }
          }
          return newDataBlock;
        });
        if (event.data.progress === 1) {
          parserWorker.terminate();
        }
      } else if (event.data.type === "error") {
        console.error("Error:", event.data.error);
        parserWorker.terminate();
      }
    };
    parserWorker.postMessage(text);
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input type="file" name="file" />

        <button type="submit">Parse</button>
      </form>
      {progress !== null && <p>{(progress * 100).toFixed(1)}%</p>}
      <button onClick={() => console.log(dataBlock)}>Log</button>
    </>
  );
}

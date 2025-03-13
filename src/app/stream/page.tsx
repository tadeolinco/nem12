"use client";

import { DataBlockRecord } from "@/lib/types";
import { useState, useTransition } from "react";

export default function Home() {
  const [progress, setProgress] = useState<number | null>(null);
  const [dataBlock, setDataBlock] = useState<DataBlockRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProgress(0);
    setDataBlock({});

    const response = await fetch("/api/parse", {
      method: "POST",
      body: new FormData(event.target as HTMLFormElement),
    });
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    if (reader) {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part) {
              try {
                const { progress, block } = JSON.parse(part) as {
                  progress: number;
                  block: DataBlockRecord;
                };

                setProgress(progress);
                startTransition(() => {
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
                });
              } catch (e) {
                console.error("JSON parse error:", e);
              }
            }
          }
        }
      }
    }
  }

  console.log(isPending);
  return (
    <div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(event);
        }}
        method="POST"
      >
        <input type="file" name="file" />

        <button type="submit">Parse</button>
      </form>
      {progress !== null && <div>{(progress * 100).toFixed(1)}%</div>}
      {dataBlock && (
        <div>
          {Object.entries(dataBlock).map(([nmi]) => (
            <div key={nmi}>
              <h2>{nmi}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

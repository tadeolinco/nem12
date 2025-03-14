"use client";

/**
 * NEM12 CSV Parser
 *
 * Main application page that handles file uploads and processing.
 */

import ConsumptionChart from "@/components/home/ConsumptionChart";
import FileDropPlaceholder from "@/components/home/FileDropPlaceholder";
import SQLInsertStatements from "@/components/home/SQLInsertStatements";
import Summary from "@/components/home/Summary";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createParserWorker } from "@/lib/create-worker";
import { NEM12ProcessedData, ParserWorkerMessage } from "@/lib/types";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function Page() {
  const [progress, setProgress] = useState<number | null>(null);
  const [data, setData] = useState<NEM12ProcessedData | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const canUpload = file === null || data !== null;

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    noClick: true,
    noKeyboard: true,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
    disabled: !canUpload,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFile(file);
        const text = await file.text();

        setProgress(0);
        setData(null);

        const parserWorker = createParserWorker();
        parserWorker.onmessage = (event: MessageEvent<ParserWorkerMessage>) => {
          if (event.data.type === "progress") {
            setProgress(event.data.progress);
          }

          if (event.data.type === "data") {
            setData(event.data.data);
          } else if (event.data.type === "error") {
            toast.error(event.data.error);
            setFile(null);
            setProgress(null);
            setData(null);
            parserWorker.terminate();
          }
        };
        parserWorker.postMessage(text);
      }
    },
  });

  return (
    <>
      <div className="flex h-[80px] items-center justify-between border-b p-4">
        <p className="text-xl font-bold">NEM12 CSV Parser</p>
        {canUpload && file !== null && (
          <Button onClick={() => inputRef.current.click()}>
            Upload new file
          </Button>
        )}
      </div>
      <main
        className="mx-auto w-full max-w-3xl flex-1 px-4"
        {...getRootProps()}
      >
        <input
          className="hidden"
          type="file"
          accept=".csv"
          {...getInputProps()}
        />

        {file === null && (
          <div className="flex h-full items-center justify-center animate-in fade-in">
            <div
              role="button"
              className="cursor-pointer rounded-md border-2 border-dashed p-8"
              onClick={() => {
                inputRef.current.click();
              }}
            >
              <p>Select a file or drag and drop to start processing</p>
            </div>
          </div>
        )}
        {file !== null && (
          <>
            {!data && progress !== null && (
              <div className="flex h-full flex-col items-center justify-center gap-4 animate-in fade-in">
                <p className="text-2xl font-medium">
                  {progress === 1
                    ? "Crunching numbers..."
                    : `${(progress * 100).toFixed(1)}%`}
                </p>
                <Progress value={progress * 100} />
                <p className="text-sm text-gray-500">
                  {progress === 1
                    ? "This might take a while depending on the file size"
                    : "Parsing file..."}
                </p>
              </div>
            )}
            {data && (
              <div className="flex h-full w-full flex-col gap-4 pt-6">
                <Summary data={data} />
                <Tabs defaultValue="charts" className="w-full">
                  <TabsList>
                    <TabsTrigger value="charts">Charts</TabsTrigger>
                    <TabsTrigger value="sql">SQL statements</TabsTrigger>
                  </TabsList>
                  <TabsContent value="charts">
                    <ConsumptionChart data={data} />
                  </TabsContent>
                  <TabsContent value="sql">
                    <SQLInsertStatements data={data} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </>
        )}

        {isDragActive && <FileDropPlaceholder />}
      </main>
    </>
  );
}

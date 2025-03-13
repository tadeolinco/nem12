export type DataBlockRecord = Record<
  string, // nmi
  {
    intervalLength: number;
    intervalValues: Record<
      string, // timestamp
      number // consumption value
    >;
  }
>;

export type ParserWorkerMessage =
  | {
      type: "data";
      progress: number;
      data: DataBlockRecord;
    }
  | {
      type: "error";
      error: string;
    };

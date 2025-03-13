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

export type NEM12ProcessedData = {
  sqlStatements: string;
  consumptionChartData: Record<string, number | string | null>[];
  totalConsumption: number;
  minTimeStamp: number;
  maxTimeStamp: number;
  nmiList: string[];
};

export type ParserWorkerMessage =
  | {
      type: "progress";
      progress: number;
    }
  | {
      type: "data";
      data: NEM12ProcessedData;
    }
  | {
      type: "error";
      error: string;
    };

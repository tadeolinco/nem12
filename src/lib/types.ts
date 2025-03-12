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

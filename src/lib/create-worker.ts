export const createParserWorker = () => {
  return new Worker(new URL("../workers/parserWorker.ts", import.meta.url), {
    type: "module",
  });
};

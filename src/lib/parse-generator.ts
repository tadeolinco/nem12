import { parse200Block } from "./parse200Block";

export async function* generateNEM12Blocks(text: string) {
  const lines = text.trim().split("\n");
  const headerBlock = lines[0].split(",");

  const header = {
    recordIndicator: headerBlock[0],
    versionHeader: headerBlock[1],
  };

  if (header.recordIndicator !== "100")
    throw new Error("Invalid MDFF data: Missing header block");

  if (header.versionHeader !== "NEM12")
    throw new Error("Invalid MDFF data: Invalid version header");

  const endBlock = lines[lines.length - 1].split(",");
  const end = { recordIndicator: endBlock[0] };

  if (end.recordIndicator !== "900")
    throw new Error("Invalid MDFF data: Missing end block");

  let blockStartIndex = 1;
  // skipping header and end block
  for (let index = 1; index < lines.length - 1; index++) {
    const line = lines[index];

    if (line.startsWith("200")) {
      if (index !== blockStartIndex) {
        yield {
          block: parse200Block(lines.slice(blockStartIndex, index)),
          progress: (index - 1) / (lines.length - 2),
        };
      }
      blockStartIndex = index;
    }
  }

  // Process and yield the final block
  yield {
    block: parse200Block(lines.slice(blockStartIndex, lines.length - 1)),
    progress: 1,
  };
}

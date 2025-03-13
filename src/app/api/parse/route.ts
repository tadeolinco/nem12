import { generateNEM12Blocks } from "@/lib/parse-generator";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const text = await file.text();

  const { readable, writable } = new TransformStream();

  const streamNEM12Blocks = async () => {
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    try {
      // Process each block from the generator as it becomes available
      for await (const data of generateNEM12Blocks(text)) {
        const chunk = JSON.stringify(data) + "\n";
        console.log(data.progress);
        await writer.write(encoder.encode(chunk));
      }
    } catch (error) {
      console.error("Error parsing NEM12:", error);
    } finally {
      await writer.close();
    }
  };

  // handle stream in separate async to not block response
  streamNEM12Blocks();

  // Return the readable stream immediately
  return new Response(readable, {
    headers: {
      "Content-Type": "application/json",
      "Transfer-Encoding": "chunked",
    },
  });
}

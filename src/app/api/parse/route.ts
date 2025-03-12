import { NextApiRequest, NextApiResponse } from "next";

export async function POST(request: NextApiRequest, response: NextApiResponse) {
  const formData = request.body;
  const file = formData.get("file") as File;
  const text = await file.text();

  const lines = text.split("\n");
  const headers = lines[0].split(",");
  const data = lines.slice(1).map((line) => {
    return line.split(",");
  });

  return response.status(200).json({ headers, data });
}

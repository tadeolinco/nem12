import { parseNEM12 } from "@/lib/parse";

export default async function Home() {
  async function onSubmit(formData: FormData) {
    "use server";

    try {
      const file = formData.get("file") as File;
      const text = await file.text();

      const now = performance.now();
      const dataBlock = await parseNEM12(text);
      const end = performance.now();

      console.log(`TOTAL Time taken: ${end - now} milliseconds`);
      console.log(dataBlock);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form action={onSubmit} method="POST">
      <input type="file" name="file" />
      <button type="submit">Parse</button>
    </form>
  );
}

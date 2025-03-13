import { parseNEM12 } from "@/lib/parse";
import { parseNEM12 as parseNEM12Sync } from "@/lib/parse-sync";

export default async function Home() {
  async function onSubmit(formData: FormData) {
    "use server";

    try {
      const type = formData.get("type") || "async";
      const file = formData.get("file") as File;
      const text = await file.text();

      const now = performance.now();

      if (type === "async") {
        await parseNEM12(text);
      } else {
        parseNEM12Sync(text);
      }

      const end = performance.now();

      console.log(`TOTAL ${type} Time taken: ${end - now} milliseconds`);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form action={onSubmit} method="POST">
      <input type="file" name="file" />
      <label>
        <input type="radio" name="type" value="async" />
        Async
      </label>
      <label>
        <input type="radio" name="type" value="sync" />
        Sync
      </label>
      <button type="submit">Parse</button>
    </form>
  );
}

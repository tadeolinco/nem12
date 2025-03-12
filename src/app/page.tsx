import { parseNEM12 } from "@/lib/parse";
import { createSQLInsertStatementFromDataBlocks } from "@/lib/utils";

export default async function Home() {
  // async function onSubmit(event: FormEvent<HTMLFormElement>) {
  //   event.preventDefault();

  //   const formData = new FormData(event.currentTarget);
  //   const response = await fetch("/api/parse", {
  //     method: "POST",
  //     body: formData,
  //   });

  //   // Handle response if necessary
  //   const data = await response.json();
  //   // ...
  // }

  const csv = `100,NEM12,201801211010,MYENERGY,ACME
200,NMI123456789,E1,E1,N1,METER123,kWh,30,
300,20180101,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,A,,,20180101123022,
200,NMI987654321,E1,E1,N1,METER456,kWh,30,
300,20180101,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,A,,,20180101123022,
900`;

  const dataBlock = parseNEM12(csv);
  const statement = createSQLInsertStatementFromDataBlocks(dataBlock);

  return (
    <div className="font-mono whitespace-pre">
      {JSON.stringify(dataBlock, null, 2)}
      {"\n"}
      {statement}
    </div>
  );

  // return null;
  // <form action={onSubmit} method="post" encType="multipart/form-data">
  //   <input type="file" name="file" />
  //   <button type="submit">Parse</button>
  // </form>
}

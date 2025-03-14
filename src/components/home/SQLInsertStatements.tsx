import { NEM12ProcessedData } from "@/lib/types";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type SQLInsertStatementsProps = {
  data: NEM12ProcessedData;
};

export default function SQLInsertStatements({
  data,
}: SQLInsertStatementsProps) {
  return (
    <>
      <div className="mb-2 flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            navigator.clipboard.writeText(data.sqlStatements);
            toast.success("SQL statements copied to clipboard");
          }}
        >
          <CopyIcon /> Copy to clipboard
        </Button>
      </div>
      <ScrollArea className="h-[440px] w-full rounded-md border p-4">
        <pre className="font-mono text-xs">{data.sqlStatements}</pre>
      </ScrollArea>
    </>
  );
}

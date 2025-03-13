import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NEM12ProcessedData } from "@/lib/types";
import { format } from "date-fns";

type SummaryProps = {
  data: NEM12ProcessedData;
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 2,
});

export default function Summary({ data }: SummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <p className="text-sm">
              <span className="font-medium">From:</span>{" "}
              {format(new Date(data.minTimeStamp), "dd MMM, yyyy")}
            </p>
            <p className="text-sm">
              <span className="font-medium">To:</span>{" "}
              {format(new Date(data.maxTimeStamp), "dd MMM, yyyy")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Consumption</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            {numberFormatter.format(data.totalConsumption)} kWh
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

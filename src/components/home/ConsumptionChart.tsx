import { NEM12ProcessedData } from "@/lib/types";
import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import Datepicker from "./Datepicker";

type ConsumptionChartProps = {
  data: NEM12ProcessedData;
};

export default function ConsumptionChart({ data }: ConsumptionChartProps) {
  const chartConfig: Record<string, { label: string }> =
    {} satisfies ChartConfig;
  data.nmiList.forEach((nmi) => {
    chartConfig[nmi] = {
      label: nmi,
    };
  });

  const [date, setDate] = useState<Date | undefined>(() => {
    return new Date(data.minTimeStamp);
  });

  const filteredChartData = useMemo(() => {
    return data.consumptionChartData.filter(
      (row: Record<string, number | string | null>) => {
        return isSameDay(
          new Date(row.timestamp as number),
          date ?? new Date(data.minTimeStamp)
        );
      }
    );
  }, [data.consumptionChartData, date, data.minTimeStamp]);

  return (
    <>
      <div className="flex w-full mb-4">
        <Datepicker
          value={date}
          onChange={setDate}
          minDate={startOfDay(new Date(data.minTimeStamp))}
          maxDate={endOfDay(new Date(data.maxTimeStamp))}
        />
      </div>
      <ChartContainer
        key={date?.toISOString()}
        config={chartConfig}
        className="min-h-[200px] w-full"
      >
        <LineChart accessibilityLayer data={filteredChartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="timestamp"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => format(new Date(value), "HH:mm")}
          />
          <YAxis />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(value, payload) => {
                  return format(
                    new Date(payload[0].payload.timestamp),
                    "dd MMM, HH:mm"
                  );
                }}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          {Object.keys(chartConfig).map((key, index) => {
            return (
              <Line
                key={key}
                dataKey={key}
                stroke={`var(--chart-${index + 1})`}
                strokeWidth={2}
              />
            );
          })}
        </LineChart>
      </ChartContainer>
    </>
  );
}

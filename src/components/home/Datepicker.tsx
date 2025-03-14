import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

type DatePickerProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
};

export default function Datepicker(props: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] pl-3 text-left font-normal",
            !props.value && "text-muted-foreground",
          )}
        >
          {props.value ? format(props.value, "PPP") : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={props.value}
          onSelect={(date) => {
            props.onChange(date);
            setIsOpen(false);
          }}
          disabled={(date) => {
            if (props.minDate && date < props.minDate) return true;
            if (props.maxDate && date > props.maxDate) return true;
            return false;
          }}
          initialFocus
          fromDate={props.minDate}
          toDate={props.maxDate}
        />
      </PopoverContent>
    </Popover>
  );
}

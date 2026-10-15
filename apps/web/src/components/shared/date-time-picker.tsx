import { format } from "date-fns";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  className?: string;
  placeholder?: string;
  minDate?: Date;
}

export function DateTimePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date & time",
  minDate = new Date(),
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(value);
  const [time, setTime] = useState<string | null>(
    value ? format(value, "HH:mm") : null,
  );

  useEffect(() => {
    if (value) {
      setDate(value);
      setTime(format(value, "HH:mm"));
    }
  }, [value]);

  // Generate simple time slots (every 30 mins)
  const timeSlots = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? "00" : "30";
    const timeString = `${hour.toString().padStart(2, "0")}:${minute}`;
    return {
      time: timeString,
      label: format(new Date().setHours(hour, parseInt(minute)), "p"), // 12h format label
    };
  });

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      if (time) {
        // If time is already selected, combine immediatey
        const [hours = 0, minutes = 0] = time.split(":").map(Number);
        const combinedDate = new Date(newDate);
        combinedDate.setHours(hours, minutes);
        onChange(combinedDate);
      }
    }
  };

  const handleTimeSelect = (timeStr: string) => {
    setTime(timeStr);
    if (date) {
      const [hours = 0, minutes = 0] = timeStr.split(":").map(Number);
      const combinedDate = new Date(date);
      combinedDate.setHours(hours, minutes);
      onChange(combinedDate);
      setIsOpen(false); // Close on time select
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-14 text-base px-5",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-3 h-5 w-5" />
          {value ? format(value, "PPP 'at' p") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex max-sm:flex-col sm:h-[300px]">
          <div className="p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </div>
          <div className="relative w-full max-sm:h-48 sm:w-[150px] border-l">
            <div className="p-3 border-b text-center font-semibold text-sm">
              Time
            </div>
            <ScrollArea className="h-[250px] w-full">
              <div className="grid gap-1 p-2">
                {timeSlots.map(({ time: timeVal, label }) => (
                  <Button
                    key={timeVal}
                    variant={time === timeVal ? "default" : "ghost"}
                    size="sm"
                    className="w-full justify-center text-xs"
                    onClick={() => handleTimeSelect(timeVal)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

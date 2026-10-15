import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import type { Control, FieldValues, Path } from "react-hook-form";

interface FormFieldWrapperProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  description?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  render?: (field: any) => React.ReactNode;
}

export function FormFieldWrapper<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  className,
  inputClassName,
  labelClassName,
  render,
}: FormFieldWrapperProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("w-full", className)}>
          {label && (
            <FormLabel
              className={cn("text-base font-semibold", labelClassName)}
            >
              {label}
            </FormLabel>
          )}
          <FormControl>
            {render ? (
              render(field)
            ) : (
              <Input
                placeholder={placeholder}
                className={cn("h-14 text-base px-5", inputClassName)}
                {...field}
              />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

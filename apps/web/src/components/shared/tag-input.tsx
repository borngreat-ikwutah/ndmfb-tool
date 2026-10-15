import React, { useState } from "react";
import { X, Tag as TagIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add a tag...",
  maxTags = 5,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const addTag = () => {
    const tag = inputValue.trim().toLowerCase();
    if (!tag) return;

    if (value.includes(tag)) {
      setInputValue("");
      return;
    }

    if (value.length >= maxTags) {
      return;
    }

    onChange([...value, tag]);
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-sm py-1 pl-3 pr-1 gap-1 h-8"
          >
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground ml-1"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={
            value.length >= maxTags
              ? `Max ${maxTags} tags reached`
              : placeholder
          }
          disabled={value.length >= maxTags}
          className="pl-12 h-14 text-base"
        />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {value.length}/{maxTags} tags • Press Enter or comma to add
      </p>
    </div>
  );
}

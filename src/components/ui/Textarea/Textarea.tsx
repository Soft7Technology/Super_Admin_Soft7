import { ReactNode, TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import Field, { describedBy, fieldStyles } from "../Field";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: ReactNode;
  helperText?: ReactNode;
  wrapperClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, wrapperClassName, label, error, helperText, id, rows = 4, ...props }, ref) => {
    const autoId = useId();
    const textareaId = id || autoId;
    return (
      <Field
        id={textareaId}
        label={label}
        required={props.required}
        error={error}
        helperText={helperText}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(textareaId, error, helperText)}
          className={cn(fieldStyles.control, "h-auto py-2.5 leading-relaxed", error && fieldStyles.invalid, className)}
          {...props}
        />
      </Field>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;

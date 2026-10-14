import { ReactNode, SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Field, { describedBy, fieldStyles } from "../Field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: ReactNode;
  error?: ReactNode;
  helperText?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, wrapperClassName, label, error, helperText, options, placeholder, size = "md", id, ...props },
    ref,
  ) => {
    const autoId = useId();
    const selectId = id || autoId;

    return (
      <Field
        id={selectId}
        label={label}
        required={props.required}
        error={error}
        helperText={helperText}
        className={wrapperClassName}
      >
        <div className={fieldStyles.wrap}>
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(selectId, error, helperText)}
            className={cn(
              fieldStyles.control,
              fieldStyles.withRight,
              size !== "md" && fieldStyles[size],
              "appearance-none",
              error && fieldStyles.invalid,
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={cn(fieldStyles.adornment, fieldStyles.adornmentRight)}>
            <ChevronDown size={16} />
          </span>
        </div>
      </Field>
    );
  },
);

Select.displayName = "Select";

export default Select;

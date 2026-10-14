import { InputHTMLAttributes, ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import Field, { describedBy, fieldStyles } from "../Field";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: ReactNode;
  error?: ReactNode;
  helperText?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Class for the outer field wrapper */
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = "md",
      id,
      type = "text",
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id || autoId;

    return (
      <Field
        id={inputId}
        label={label}
        required={props.required}
        error={error}
        helperText={helperText}
        className={wrapperClassName}
      >
        <div className={fieldStyles.wrap}>
          {leftIcon && (
            <span className={cn(fieldStyles.adornment, fieldStyles.adornmentLeft)}>{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, error, helperText)}
            className={cn(
              fieldStyles.control,
              size !== "md" && fieldStyles[size],
              leftIcon && fieldStyles.withLeft,
              rightIcon && fieldStyles.withRight,
              error && fieldStyles.invalid,
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className={cn(fieldStyles.adornment, fieldStyles.adornmentRight)}>{rightIcon}</span>
          )}
        </div>
      </Field>
    );
  },
);

Input.displayName = "Input";

export default Input;

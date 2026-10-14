import { ComponentType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Lift border/shadow on hover */
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({ children, className, hover = false, padding = "md", ...props }: CardProps) {
  return (
    <div
      className={cn(
        styles.card,
        styles[`pad-${padding}`],
        hover && styles.hover,
        props.onClick && styles.interactive,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ComponentType<{ className?: string; size?: number }>;
  /** Full-bleed header with a bottom divider (use with padding="md") */
  divided?: boolean;
}

export function CardHeader({
  title,
  description,
  action,
  icon: Icon,
  divided = false,
  className,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn(styles.header, divided && styles.headerDivided, className)} {...props}>
      <div className={styles.headerMain}>
        {Icon && (
          <span className={styles.headerIcon}>
            <Icon size={16} />
          </span>
        )}
        <div className="min-w-0">
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && <p className={styles.description}>{description}</p>}
          {children}
        </div>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export function CardFooter({ divider = false, className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn(styles.footer, divider && styles.footerDivided, className)} {...props}>
      {children}
    </div>
  );
}

export default Card;

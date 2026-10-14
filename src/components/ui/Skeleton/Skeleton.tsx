import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import styles from "./Skeleton.module.css";

export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
  circle?: boolean;
}

/** Size it with utilities, e.g. <Skeleton className="h-4 w-32" /> */
export default function Skeleton({ circle, className, ...props }: SkeletonProps) {
  return <span aria-hidden className={cn(styles.skeleton, circle && styles.circle, className)} {...props} />;
}

export { Skeleton };

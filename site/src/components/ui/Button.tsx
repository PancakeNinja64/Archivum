import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
};

const variants: Record<Variant, string> = {
  primary: "bg-accent-strong text-white hover:opacity-90",
  secondary: "bg-transparent text-foreground border border-border-strong hover:border-accent-strong/60 hover:bg-surface",
  ghost: "bg-transparent text-muted-foreground hover:text-foreground",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
};

export function Button({ variant = "primary", size = "md", href, children, className = "", ...props }: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-[-0.01em] transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`;
  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto:");
    if (external) return <a href={href} className={classes}>{children}</a>;
    return <Link href={href} className={classes}>{children}</Link>;
  }
  return <button type="button" className={classes} {...props}>{children}</button>;
}

import { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "outline-purple" | "ghost" | "accent" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick,
  type = "button",
  className = "",
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-button transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brand-primary text-black shadow-button hover:brightness-110 hover:scale-105 hover:shadow-button-hover focus:ring-brand-primary/50 font-semibold glow-brand",
    secondary: "bg-brand-secondary text-white shadow-button-purple hover:brightness-110 hover:scale-105 hover:shadow-button-purple-hover focus:ring-brand-secondary/50 font-semibold glow-purple",
    outline: "bg-transparent border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-black focus:ring-brand-primary/50 transition-all duration-300",
    "outline-purple": "bg-transparent border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white focus:ring-brand-secondary/50 transition-all duration-300",
    ghost: "bg-transparent text-text-muted hover:bg-[rgba(219,255,77,0.05)] hover:text-brand-primary focus:ring-brand-primary/50 transition-all duration-300",
    accent: "bg-brand-accent text-white shadow-[0_4px_16px_rgba(139,92,246,0.2)] hover:brightness-110 hover:scale-105 hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] focus:ring-brand-accent/50 font-semibold",
    success: "bg-success text-white shadow-lg hover:brightness-110 hover:scale-105 focus:ring-success/50",
    warning: "bg-warning text-black shadow-lg hover:brightness-110 hover:scale-105 focus:ring-warning/50",
    error: "bg-error text-white shadow-lg hover:brightness-110 hover:scale-105 focus:ring-error/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const widthClass = fullWidth ? "w-full" : "w-fit";

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
        ${loading ? "cursor-wait" : ""}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}

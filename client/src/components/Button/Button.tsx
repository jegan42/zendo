import React from "react";
import "./Button.css";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "danger" | "outline" | "google";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon = null,
    rightIcon = null,
    disabled,
    className,
    ...props
}) => {
    return (
        <button
            className={clsx(
                "btn",
                `btn-${variant}`,
                `btn-${size}`,
                { "btn-loading": loading || disabled },
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {leftIcon && <span className="btn-icon">{leftIcon}</span>}
            <span>{loading ? "Chargement..." : children}</span>
            {rightIcon && <span className="btn-icon">{rightIcon}</span>}
        </button>
    );
};

export default Button;

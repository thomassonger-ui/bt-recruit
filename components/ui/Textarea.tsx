"use client";

import React, { forwardRef, useState } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const textareaId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-foreground"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {label}
          {props.required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={`rounded-lg border px-4 py-2.5 text-sm text-foreground placeholder:text-muted outline-none transition-all duration-200 resize-y min-h-[100px] ${
            error
              ? "border-red-400 bg-red-50"
              : focused
                ? "border-primary bg-card shadow-sm ring-2 ring-primary/20"
                : "border-muted/30 bg-card hover:border-muted/50"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;

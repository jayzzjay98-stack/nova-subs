"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ElectricBorderProps extends React.HTMLAttributes<HTMLDivElement> {
    color?: string;
    width?: number;
    duration?: number;
}

export function ElectricBorder({
    children,
    className,
    color = "#3b82f6",
    width = 2,
    duration = 2,
    ...props
}: ElectricBorderProps) {
    return (
        <div
            className={cn("electric-border-container group", className)}
            style={
                {
                    "--border-color": color,
                    "--border-width": `${width}px`,
                    "--anim-duration": `${duration}s`,
                } as React.CSSProperties
            }
            {...props}
        >
            {/* Static Border (faint) */}
            <div className="electric-border-static" />

            {/* Animated Rotating Border */}
            <div className="electric-border-animated">
                <div className="electric-border-gradient" />
            </div>

            {/* Inner Mask (Background) */}
            <div className="electric-border-mask bg-background/90 backdrop-blur-sm" />

            {/* Content */}
            <div className="electric-border-content">
                {children}
            </div>
        </div>
    );
}

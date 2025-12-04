import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModernNavButtonProps {
    title: string;
    icon: LucideIcon;
    isActive?: boolean;
    className?: string;
    onClick?: () => void;
    size?: 'default' | 'small';
    disabled?: boolean;
}

export function ModernNavButton({
    title,
    icon: Icon,
    isActive,
    className = '',
    onClick,
    size = 'default',
    disabled = false
}: ModernNavButtonProps) {
    return (
        <button
            className={`glowing-nav-btn ${isActive ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
        >
            <span className="glowing-nav-txt">
                <Icon className="glowing-nav-icon" size={size === 'small' ? 14 : 16} />
                {title}
            </span>
        </button>
    );
}

import React from 'react';
import { LucideIcon } from 'lucide-react';
import './ModernNavButton.css';

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
        <div
            className={`modern-nav-button ${isActive ? 'active' : ''} ${size === 'small' ? 'small' : ''} ${disabled ? 'disabled' : ''} ${className}`}
            onClick={!disabled ? onClick : undefined}
            role="button"
            tabIndex={disabled ? -1 : 0}
        >
            <strong>
                <Icon size={size === 'small' ? 14 : 16} />
                {title}
            </strong>
            <div className="container-stars">
                <div className="stars"></div>
            </div>

            <div className="glow">
                <div className="circle"></div>
                <div className="circle"></div>
            </div>
        </div>
    );
}

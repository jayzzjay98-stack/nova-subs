import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StyledButtonProps extends ButtonProps {
    className?: string;
}

export const StyledButton = ({ className, ...props }: StyledButtonProps) => {
    return (
        <Button
            className={cn("bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white", className)}
            {...props}
        />
    );
};

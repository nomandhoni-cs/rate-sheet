import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    };

    return (
        <div
            className={cn(
                "animate-spin rounded-full border-2 border-muted border-t-primary",
                sizeClasses[size],
                className
            )}
        />
    );
}

interface LoadingDotsProps {
    className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
    return (
        <div className={cn("flex space-x-1", className)}>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>
    );
}

interface LoadingPulseProps {
    className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
    return (
        <div className={cn("flex space-x-2", className)}>
            <div className="h-3 w-3 bg-primary rounded-full animate-pulse"></div>
            <div className="h-3 w-3 bg-primary/70 rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="h-3 w-3 bg-primary/40 rounded-full animate-pulse [animation-delay:0.4s]"></div>
        </div>
    );
}

interface LoadingPageProps {
    title?: string;
    description?: string;
    variant?: "spinner" | "dots" | "pulse";
}

export function LoadingPage({
    title = "Loading...",
    description,
    variant = "spinner"
}: LoadingPageProps) {
    const renderLoader = () => {
        switch (variant) {
            case "dots":
                return <LoadingDots className="mb-4" />;
            case "pulse":
                return <LoadingPulse className="mb-4" />;
            default:
                return <LoadingSpinner size="lg" className="mb-4" />;
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background pt-16">
            <div className="text-center">
                <div className="flex justify-center">
                    {renderLoader()}
                </div>
                <h2 className="text-lg font-sans font-medium text-foreground mb-2">{title}</h2>
                {description && (
                    <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
                )}
            </div>
        </div>
    );
}

interface LoadingCardProps {
    className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
    return (
        <div className={cn("animate-pulse", className)}>
            <div className="bg-muted rounded-lg h-32 w-full"></div>
        </div>
    );
}

interface LoadingTableProps {
    rows?: number;
    columns?: number;
}

export function LoadingTable({ rows = 5, columns = 4 }: LoadingTableProps) {
    return (
        <div className="animate-pulse">
            <div className="space-y-3">
                {/* Header */}
                <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: columns }).map((_, i) => (
                        <div key={i} className="h-4 bg-muted rounded"></div>
                    ))}
                </div>
                {/* Rows */}
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-4 gap-4">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div key={colIndex} className="h-4 bg-muted/60 rounded"></div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
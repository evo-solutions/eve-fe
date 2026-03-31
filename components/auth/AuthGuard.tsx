 "use client";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
    children: ReactNode;
    redirectTo?: string;
}

export const AuthGuard = ({ children, redirectTo = "/sign-in" }: AuthGuardProps) => {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push(redirectTo);
        }
    }, [isLoading, isAuthenticated, redirectTo, router]);

    if (isLoading) {
        return null;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};


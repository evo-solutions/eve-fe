"use client";

import { Button } from "antd";
import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
type Theme = "light" | "dark";
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    // Load theme from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("theme") as Theme | null;
        if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
            setThemeState(savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setThemeState(prefersDark ? "dark" : "light");
        }
    }, []);

    // Save theme to localStorage and update html class
    useEffect(() => {
        if (mounted) {
            localStorage.setItem("theme", theme);
            document.documentElement.classList.remove("light", "dark");
            document.documentElement.classList.add(theme);
        }
    }, [theme, mounted]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === "light" ? "dark" : "light"));
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useThemeContext must be used within ThemeProvider");
    }
    return context;
}


export const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeContext();
    const isDark = theme === "dark";

    return (
        <Button
            type="text"
            icon={isDark ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            size="large"
        />
    );
}


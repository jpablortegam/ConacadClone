"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
                <Sun className="size-5" />
            </Button>
        )
    }

    const getCurrentIcon = () => {
        switch (theme) {
            case "dark":
                return <Moon className="size-5" />
            case "light":
                return <Sun className="size-5" />
            case "system":
                return <Monitor className="size-5" />
            default:
                return <Sun className="size-5" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Toggle theme"
                    className="relative overflow-hidden transition-all duration-200 hover:bg-accent"
                >
                    <div className="transition-transform duration-300 hover:scale-110">
                        {getCurrentIcon()}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                    onClick={() => setTheme("light")}

                >
                    <Sun className="size-4 mr-2" />
                    <span>Modo Claro</span>
                    {theme === "light" && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}

                >
                    <Moon className="size-4 mr-2" />
                    <span>Modo Oscuro</span>
                    {theme === "dark" && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}

                >
                    <Monitor className="size-4 mr-2" />
                    <span>Sistema</span>
                    {theme === "system" && (
                        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
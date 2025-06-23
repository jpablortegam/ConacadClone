"use client";

import React from "react";
import { Book, Menu, Sunset, Trees, Zap, Code } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils"; // Asegúrate de que tu proyecto tenga esta utilidad de shadcn

// INTERFACES Y DATOS DE EJEMPLO
interface MenuItem {
    title: string;
    url: string;
    description?: string;
    icon?: React.ReactNode;
    items?: MenuItem[];
}

interface NavbarProps {
    logo?: {
        url: string;
        icon: React.ReactNode;
        title: string;
    };
    menu?: MenuItem[];
    auth?: {
        login: {
            title: string;
            url: string;
        };
        signup: {
            title: string;
            url: string;
        };
    };
}

const defaultMenu: MenuItem[] = [
    {
        title: "Productos",
        url: "#",
        items: [
            {
                title: "Creador de Sitios",
                description: "Construye sitios web impresionantes sin código.",
                icon: <Zap className="size-5 shrink-0" />,
                url: "#",
            },
            {
                title: "Plataforma de Blogs",
                description: "Lanza tu blog personal o corporativo con facilidad.",
                icon: <Book className="size-5 shrink-0" />,
                url: "#",
            },
        ],
    },
    {
        title: "Recursos",
        url: "#",
        items: [
            {
                title: "Centro de Ayuda",
                description: "Encuentra todas las respuestas que necesitas.",
                icon: <Sunset className="size-5 shrink-0" />,
                url: "#",
            },
            {
                title: "Comunidad",
                description: "Únete a nuestra comunidad de desarrolladores y creadores.",
                icon: <Trees className="size-5 shrink-0" />,
                url: "#",
            },
        ],
    },
    {
        title: "Precios",
        url: "#",
    },
    {
        title: "Blog",
        url: "#",
    },
];

// COMPONENTE PRINCIPAL DE LA NAVBAR
const Navbar1 = ({
    logo = {
        url: "/",
        icon: <Code className="size-6 shrink-0" />,
        title: "TuMarca",
    },
    menu = defaultMenu,
    auth = {
        login: { title: "Iniciar Sesión", url: "/login" },
        signup: { title: "Registrarse", url: "/signup" },
    },
}: NavbarProps) => {
    return (
        <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between">
                <div className="flex items-center gap-6">
                    <a href={logo.url} className="flex items-center gap-2">
                        {logo.icon}
                        <span className="hidden font-bold sm:inline-block">
                            {logo.title}
                        </span>
                    </a>
                    <NavigationMenu className="hidden lg:flex">
                        <NavigationMenuList>
                            {menu.map((item) => (
                                <DesktopMenuItem key={item.title} item={item} />
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="hidden items-center gap-2 lg:flex">
                    <Button asChild variant="ghost" size="sm">
                        <a href={auth.login.url}>{auth.login.title}</a>
                    </Button>
                    <Button asChild size="sm">
                        <a href={auth.signup.url}>{auth.signup.title}</a>
                    </Button>
                </div>
                <div className="flex items-center lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="size-5" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-full max-w-sm overflow-y-auto">
                            <SheetHeader>
                                <SheetTitle>
                                    <a href={logo.url} className="flex items-center gap-2">
                                        {logo.icon}
                                        <span className="font-bold">{logo.title}</span>
                                    </a>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-8 p-4 mt-4">
                                <Accordion type="single" collapsible className="w-full flex-col gap-4 flex">
                                    {menu.map((item) => (
                                        <MobileMenuItem key={item.title} item={item} />
                                    ))}
                                </Accordion>
                                <div className="flex flex-col gap-3 border-t pt-6">
                                    <Button asChild variant="outline">
                                        <a href={auth.login.url}>{auth.login.title}</a>
                                    </Button>
                                    <Button asChild>
                                        <a href={auth.signup.url}>{auth.signup.title}</a>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
};

// SUB-COMPONENTES PARA RENDERIZAR MENÚS

const DesktopMenuItem = ({ item }: { item: MenuItem }) => {
    if (item.items) {
        return (
            <NavigationMenuItem>
                <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
                <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {item.items.map((subItem) => (
                            <ListItem
                                key={subItem.title}
                                title={subItem.title}
                                href={subItem.url}
                                icon={subItem.icon}
                            >
                                {subItem.description}
                            </ListItem>
                        ))}
                    </ul>
                </NavigationMenuContent>
            </NavigationMenuItem>
        );
    }

    return (
        <NavigationMenuItem>
            <NavigationMenuLink href={item.url} className={navigationMenuTriggerStyle()}>
                {item.title}
            </NavigationMenuLink>
        </NavigationMenuItem>
    );
};

const MobileMenuItem = ({ item }: { item: MenuItem }) => {
    if (item.items) {
        return (
            <AccordionItem value={item.title} className="border-b-0">
                <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
                    {item.title}
                </AccordionTrigger>
                <AccordionContent className="pt-2 pl-4">
                    <div className="flex flex-col gap-1">
                        {item.items.map((subItem) => (
                            <a
                                key={subItem.title}
                                href={subItem.url}
                                className="flex items-start gap-4 rounded-md p-2 text-sm transition-colors hover:bg-muted"
                            >
                                {subItem.icon && <div className="mt-1 shrink-0">{subItem.icon}</div>}
                                <div className="flex-grow">
                                    <p className="font-semibold text-foreground">{subItem.title}</p>
                                    {subItem.description && <p className="text-muted-foreground">{subItem.description}</p>}
                                </div>
                            </a>
                        ))}
                    </div>
                </AccordionContent>
            </AccordionItem>
        );
    }

    return (
        <a
            href={item.url}
            className="block py-2 text-base font-semibold"
        >
            {item.title}
        </a>
    );
};

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & { icon?: React.ReactNode }
>(({ className, title, children, icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "flex flex-row items-start gap-4 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
                    <div className="flex-grow">
                        <div className="text-sm font-medium leading-none">{title}</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground pt-1">
                            {children}
                        </p>
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";

export default Navbar1;

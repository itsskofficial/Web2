"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutTemplate, Palette } from "lucide-react";

const SessionLayout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { session: string; project: string };
}) => {
  const pathname = usePathname();

  const tabs = [
    {
      name: "Canvas",
      href: `/dashboard/${params.session}/canvas/${params.project}`,
      icon: LayoutTemplate,
      isActive: pathname.includes("/canvas"),
    },
    {
      name: "Style Guide",
      href: `/dashboard/${params.session}/style-guide/${params.project}`,
      icon: Palette,
      isActive: pathname.includes("/style-guide"),
    },
  ];

  return (
    <div className="h-full">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <nav className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/${params.session}`} className="font-bold text-lg">
                    Sketchify
                </Link>
                <div className="flex items-center gap-2">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                                tab.isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                        </Link>
                    ))}
                </div>
            </div>
            {/* UserButton is in the parent layout */}
        </nav>
      </header>
      <main className="pt-16 h-full">{children}</main>
    </div>
  );
};

export default SessionLayout;

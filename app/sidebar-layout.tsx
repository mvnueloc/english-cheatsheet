"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { IconBrandTabler, IconUserBolt } from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";

const links = [
  {
    label: "Inicio",
    href: "/",
    icon: (
      <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
  {
    label: "List of Verbs",
    href: "/verbs",
    icon: (
      <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
  },
];

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "flex h-screen w-screen overflow-hidden bg-gray-100 dark:bg-neutral-900",
      )}>
      <Sidebar
        open={open}
        setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => (
                <SidebarLink
                  key={link.href}
                  link={link}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <ThemeToggle showLabel={open} />
            <SidebarLink
              link={{
                label: "Manu",
                href: "#",
                icon: (
                  <img
                    src="https://avatars.githubusercontent.com/u/128934926?v=4"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <main className="flex min-h-0 min-w-0 flex-1">
        <div className="flex h-full w-full min-h-0 flex-1 flex-col overflow-y-auto bg-white p-4 md:p-10 dark:bg-neutral-900">
          {children}
        </div>
      </main>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white">
        English Cheatsheet
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};

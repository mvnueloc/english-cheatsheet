"use client";

import * as React from "react";
import Link from "next/link";
import { Box, Lock } from "lucide-react";
import { IconCards } from "@tabler/icons-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export function HomeGlowingGrid() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      <GridItem
        area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
        icon={<Box className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="List of Verbs"
        description="List of common English verbs with their conjugations and examples."
        href="/verbs"
      />

      <GridItem
        area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
        icon={
          <IconCards className="h-4 w-4 text-black dark:text-neutral-400" />
        }
        title="Verbs Flash Cards"
        description="Practice verbs with interactive flash cards and filters."
        href="/verbs-flash-card"
      />

      <GridItem
        area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
        icon={<Lock className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="Coming soon"
        description="Locked content."
      />

      <GridItem
        area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
        icon={<Lock className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="Coming soon"
        description="Locked content."
      />

      <GridItem
        area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
        icon={<Lock className="h-4 w-4 text-black dark:text-neutral-400" />}
        title="Coming soon"
        description="Locked content."
      />
    </ul>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  href?: string;
}

const GridItem = ({ area, icon, title, description, href }: GridItemProps) => {
  const content = (
    <div className="relative h-full rounded-2xl border p-2 md:rounded-3xl md:p-3">
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={80}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="border-0.75 relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 md:p-6 dark:shadow-[0px_0px_27px_0px_#2D2D2D]">
        <div className="relative flex flex-1 flex-col justify-between gap-3">
          <div className="w-fit rounded-lg border border-gray-600 p-2">
            {icon}
          </div>
          <div className="space-y-3">
            <h3 className="-tracking-4 pt-0.5 font-sans text-xl/[1.375rem] font-semibold text-balance text-black md:text-2xl/[1.875rem] dark:text-white">
              {title}
            </h3>
            <h2 className="font-sans text-sm/[1.125rem] text-black md:text-base/[1.375rem] dark:text-neutral-400 [&_b]:md:font-semibold [&_strong]:md:font-semibold">
              {description}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <li className={`min-h-[14rem] list-none ${area}`}>
      {href ? (
        <Link
          href={href}
          className="block h-full rounded-2xl transition hover:-translate-y-0.5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
};

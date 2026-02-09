"use client";

import * as React from "react";

import { MotionCarousel } from "@/components/animate-ui/components/community/motion-carousel";
import { FlipCard } from "@/components/animate-ui/components/community/flip-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Flame,
  HelpCircle,
  Leaf,
  Settings,
  Sparkles,
} from "lucide-react";
import type { EmblaOptionsType } from "embla-carousel";

type VerbType = "regular" | "irregular";
type Status = "aprendido" | "aprendiendo" | "desconocido";

type Verb = {
  verb: string;
  past_simple: string;
  past_participle: string;
  type: VerbType;
  future: string;
  meaning?: string;
};

const STATUS_META: Record<
  Status,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    badgeClass: string;
  }
> = {
  aprendido: {
    label: "Aprendido",
    icon: CheckCircle2,
    iconClass: "text-purple-500 dark:text-purple-400",
    badgeClass:
      "border-purple-500/35 text-purple-600 dark:text-purple-300 bg-purple-500/10",
  },
  aprendiendo: {
    label: "Aprendiendo",
    icon: Sparkles,
    iconClass: "text-blue-500 dark:text-blue-400",
    badgeClass:
      "border-blue-500/35 text-blue-600 dark:text-blue-300 bg-blue-500/10",
  },
  desconocido: {
    label: "Desconocido",
    icon: HelpCircle,
    iconClass: "text-amber-500 dark:text-amber-400",
    badgeClass:
      "border-amber-500/35 text-amber-700 dark:text-amber-300 bg-amber-500/10",
  },
};

const TYPE_META: Record<
  VerbType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    badgeClass: string;
  }
> = {
  irregular: {
    label: "Irregular",
    icon: Flame,
    iconClass: "text-red-500 dark:text-red-400",
    badgeClass:
      "border-red-500/35 text-red-600 dark:text-red-300 bg-red-500/10",
  },
  regular: {
    label: "Regular",
    icon: Leaf,
    iconClass: "text-emerald-500 dark:text-emerald-400",
    badgeClass:
      "border-emerald-500/35 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10",
  },
};

const PAGE_SIZE = 40;

const STATUS_LABELS: Record<Status, string> = {
  desconocido: "Desconocidos",
  aprendiendo: "Aprendiendo",
  aprendido: "Aprendidos",
};

const STORAGE_KEY = "english-cheatsheet:verb-status";

const carouselOptions: EmblaOptionsType = {
  loop: true,
  align: "center",
  containScroll: "trimSnaps",
  dragFree: false,
};

export default function VerbsFlashCardPage() {
  const [verbs, setVerbs] = React.useState<Verb[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [offset, setOffset] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const [statusByVerb, setStatusByVerb] = React.useState<
    Record<string, Status>
  >({});
  const [isReady, setIsReady] = React.useState(false);
  const [statusFilters, setStatusFilters] = React.useState<Status[]>([
    "desconocido",
    "aprendiendo",
    "aprendido",
  ]);
  const [typeFilters, setTypeFilters] = React.useState<VerbType[]>([
    "regular",
    "irregular",
  ]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setStatusByVerb(JSON.parse(raw));
      }
    } catch {
      setStatusByVerb({});
    }
    setIsReady(true);
  }, []);

  const loadMore = React.useCallback(
    async (mode: "reset" | "append" = "append") => {
      if (isLoading) return;

      setIsLoading(true);
      setLoadError(null);

      const nextOffset = mode === "reset" ? 0 : offset;

      try {
        const response = await fetch(
          `/api/verbs?offset=${nextOffset}&limit=${PAGE_SIZE}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load verbs");
        }

        const data = (await response.json()) as {
          verbs?: Verb[];
          total?: number;
        };

        const received = Array.isArray(data.verbs) ? data.verbs : [];
        const totalCount = typeof data.total === "number" ? data.total : 0;
        const newOffset = nextOffset + received.length;

        setVerbs((prev) =>
          mode === "reset" ? received : [...prev, ...received],
        );
        setOffset(newOffset);
        setTotal(totalCount);
        setHasMore(newOffset < totalCount);
      } catch {
        setLoadError("No pudimos cargar los verbos. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, offset],
  );

  const didInitialLoad = React.useRef(false);
  React.useEffect(() => {
    if (didInitialLoad.current) return;
    didInitialLoad.current = true;
    void loadMore("reset");
  }, [loadMore]);

  const getStatus = React.useCallback(
    (verb: Verb) => statusByVerb[verb.verb] ?? "desconocido",
    [statusByVerb],
  );

  const filteredVerbs = React.useMemo(() => {
    if (!isReady) return verbs;
    return verbs.filter((verb) => {
      if (typeFilters.length > 0 && !typeFilters.includes(verb.type)) {
        return false;
      }
      const status = getStatus(verb);
      if (statusFilters.length > 0 && !statusFilters.includes(status)) {
        return false;
      }
      return true;
    });
  }, [getStatus, isReady, statusFilters, typeFilters, verbs]);

  const slides = filteredVerbs.map((_, index) => index);

  const handleSlideSelect = React.useCallback(
    (index: number) => {
      if (!hasMore || isLoading) return;
      if (index >= Math.max(0, slides.length - 3)) {
        void loadMore("append");
      }
    },
    [hasMore, isLoading, loadMore, slides.length],
  );

  const toggleStatus = (status: Status) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  };

  const toggleType = (type: VerbType) => {
    setTypeFilters((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Verbs Flash Cards
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Desliza o usa los botones para cambiar de tarjeta. Haz clic para
            voltear.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 self-start">
              <Settings className="size-4" />
              Filtros
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filtros</DialogTitle>
              <DialogDescription>
                Personaliza qué verbos quieres ver en las flashcards.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 md:text-lg">
                  Estado de aprendizaje
                </p>
                <div className="space-y-3">
                  {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
                    <FilterRow
                      key={status}
                      label={STATUS_LABELS[status]}
                      icon={STATUS_META[status].icon}
                      iconClass={STATUS_META[status].iconClass}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={() => toggleStatus(status)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 md:text-lg">
                  Tipo de verbo
                </p>
                <div className="space-y-3">
                  {(Object.keys(TYPE_META) as VerbType[]).map((type) => (
                    <FilterRow
                      key={type}
                      label={TYPE_META[type].label}
                      icon={TYPE_META[type].icon}
                      iconClass={TYPE_META[type].iconClass}
                      checked={typeFilters.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900 md:p-6 h-full">
        {loadError ? (
          <div className="flex min-h-72 flex-col items-center justify-center gap-4 text-center text-sm text-neutral-500 dark:text-neutral-400">
            <p>{loadError}</p>
            <Button
              variant="outline"
              onClick={() => void loadMore("reset")}
              disabled={isLoading}>
              Reintentar
            </Button>
          </div>
        ) : filteredVerbs.length > 0 ? (
          <div className="flex h-full flex-col gap-4">
            <MotionCarousel
              slides={slides}
              options={carouselOptions}
              showControls
              showDots={false}
              controlsPosition="overlay"
              controlsClassName="hidden md:flex px-4 md:px-6"
              buttonClassName="h-11 w-11 md:h-12 md:w-12 bg-neutral-900/80 text-white hover:bg-neutral-900 dark:bg-white/80 dark:text-neutral-900"
              className="mx-auto w-full h-full [--slide-spacing:0rem]"
              slideClassName="basis-full mr-0"
              slideInnerClassName="border-0 bg-transparent p-0 text-base font-normal"
              onSelect={handleSlideSelect}
              renderSlide={(index) => {
                const verb = filteredVerbs[index];
                if (!verb) return null;

                return (
                  <FlipCard
                    className="m-0 h-full w-full"
                    front={<VerbFront verb={verb} />}
                    back={<VerbBack verb={verb} />}
                  />
                );
              }}
            />

            {isLoading && hasMore ? (
              <div className="flex h-full w-full items-stretch justify-center">
                <div className="h-full w-full max-w-4xl">
                  <CardSkeleton />
                </div>
              </div>
            ) : null}

            {!hasMore ? (
              <div className="flex items-center justify-center">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Has llegado al final.
                </p>
              </div>
            ) : null}
          </div>
        ) : isLoading || hasMore ? (
          <div className="flex h-full w-full items-stretch justify-center">
            <div className="h-full w-full max-w-4xl">
              <CardSkeleton />
            </div>
          </div>
        ) : (
          <div className="flex min-h-72 items-center justify-center text-center text-sm text-neutral-500 dark:text-neutral-400">
            No hay verbos para los filtros seleccionados.
          </div>
        )}
      </section>
    </div>
  );
}

type FilterRowProps = Readonly<{
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass?: string;
  checked: boolean;
  onCheckedChange: () => void;
}>;

function FilterRow(props: FilterRowProps) {
  const { label, icon: Icon, iconClass, checked, onCheckedChange } = props;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200/80 bg-white/70 px-4 py-3 dark:border-neutral-800/80 dark:bg-neutral-900/70">
      <div className="flex items-center gap-2">
        <Icon className={cn("size-4", iconClass)} />
        <p className="text-base font-medium text-neutral-900 dark:text-neutral-100 md:text-lg">
          {label}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

type TypeIconProps = Readonly<{ type: VerbType }>;

function TypeIcon(props: TypeIconProps) {
  const { type } = props;
  const Icon = TYPE_META[type].icon;
  return <Icon className={cn("size-4", TYPE_META[type].iconClass)} />;
}

type VerbFrontProps = Readonly<{ verb: Verb }>;

function VerbFront(props: VerbFrontProps) {
  const { verb } = props;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-8 py-6 text-center md:px-16 md:py-10">
      <Badge
        variant="outline"
        className={cn(
          "border px-3 py-1 text-sm font-semibold md:px-4 md:py-1.5 md:text-base gap-2",
          TYPE_META[verb.type].badgeClass,
        )}>
        <TypeIcon type={verb.type} />
        {TYPE_META[verb.type].label}
      </Badge>
      <div className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 md:text-6xl lg:text-7xl">
        {verb.verb}
      </div>
      <p className="text-base text-neutral-500 dark:text-neutral-400 md:text-lg">
        Haz clic para ver el significado y tiempos verbales
      </p>
    </div>
  );
}

type VerbBackProps = Readonly<{ verb: Verb }>;

function VerbBack(props: VerbBackProps) {
  const { verb } = props;
  return (
    <div className="flex h-full w-full flex-col justify-between gap-5 px-8 py-6 text-center md:px-16 md:py-10">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 md:text-sm">
          Significado
        </p>
        <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 md:text-xl">
          {verb.meaning || "Sin significado"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-left md:gap-4">
        <VerbDetail
          label="Pasado simple"
          value={verb.past_simple}
        />
        <VerbDetail
          label="Pasado perfecto"
          value={verb.past_participle}
        />
        <VerbDetail
          label="Futuro"
          value={verb.future}
        />
        <VerbDetail
          label="Tipo"
          value={TYPE_META[verb.type].label}
        />
      </div>

      <div className="flex items-center justify-center">
        <Badge
          variant="outline"
          className={cn(
            "border px-3 py-1 text-sm font-semibold md:px-4 md:py-1.5 md:text-base gap-2",
            TYPE_META[verb.type].badgeClass,
          )}>
          <TypeIcon type={verb.type} />
          {TYPE_META[verb.type].label}
        </Badge>
      </div>
    </div>
  );
}

type VerbDetailProps = Readonly<{ label: string; value: string }>;

function VerbDetail(props: VerbDetailProps) {
  const { label, value } = props;
  return (
    <div className="rounded-lg border border-neutral-200/70 bg-white/70 p-3 text-base text-neutral-700 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-900/70 dark:text-neutral-200 md:p-4">
      <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 md:text-sm">
        {label}
      </p>
      <p className="mt-1 text-base font-semibold text-neutral-900 dark:text-neutral-100 md:text-lg">
        {value}
      </p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex h-full min-h-72 w-full flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-200/80 bg-white/70 px-8 py-6 text-center shadow-sm dark:border-neutral-800/80 dark:bg-neutral-900/70 md:px-16 md:py-10">
      <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-200/80 dark:bg-neutral-800/80 md:h-7" />
      <div className="h-10 w-2/3 animate-pulse rounded-lg bg-neutral-200/80 dark:bg-neutral-800/80 md:h-14" />
      <div className="h-4 w-1/2 animate-pulse rounded-full bg-neutral-200/80 dark:bg-neutral-800/80" />

      <div className="mt-6 grid w-full grid-cols-2 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg border border-neutral-200/70 bg-neutral-100/70 p-3 dark:border-neutral-800/70 dark:bg-neutral-900/70 md:h-20 md:p-4"
          />
        ))}
      </div>
    </div>
  );
}

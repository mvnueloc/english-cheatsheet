"use client";

import * as React from "react";

import verbsData from "@/data/verbs.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/animate-ui/components/radix/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/animate-ui/components/radix/dialog";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Flame,
  Leaf,
  Settings,
} from "lucide-react";

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

const STORAGE_KEY = "english-cheatsheet:verb-status";

const STATUS_META: Record<
  Status,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    badgeClass: string;
    rowBorderClass: string;
  }
> = {
  aprendido: {
    label: "Aprendido",
    icon: CheckCircle2,
    iconClass: "text-purple-500 dark:text-purple-400",
    badgeClass:
      "border-purple-500/35 text-purple-600 dark:text-purple-300 bg-purple-500/10",
    rowBorderClass: "border-l-purple-500/40 dark:border-l-purple-400/45",
  },
  aprendiendo: {
    label: "Aprendiendo",
    icon: Sparkles,
    iconClass: "text-blue-500 dark:text-blue-400",
    badgeClass:
      "border-blue-500/35 text-blue-600 dark:text-blue-300 bg-blue-500/10",
    rowBorderClass: "border-l-blue-500/40 dark:border-l-blue-400/45",
  },
  desconocido: {
    label: "Desconocido",
    icon: HelpCircle,
    iconClass: "text-amber-500 dark:text-amber-400",
    badgeClass:
      "border-amber-500/35 text-amber-700 dark:text-amber-300 bg-amber-500/10",
    rowBorderClass: "border-l-amber-500/40 dark:border-l-amber-400/45",
  },
};

const TYPE_LABELS: Record<VerbType, string> = {
  irregular: "Irregular",
  regular: "Regular",
};

const TYPE_META: Record<
  VerbType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
    chipClass: string;
  }
> = {
  irregular: {
    label: "Irregular",
    icon: Flame,
    iconClass: "text-red-500 dark:text-red-400",
    chipClass: "border-red-500/35 text-red-600 dark:text-red-300 bg-red-500/10",
  },
  regular: {
    label: "Regular",
    icon: Leaf,
    iconClass: "text-emerald-500 dark:text-emerald-400",
    chipClass:
      "border-emerald-500/35 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10",
  },
};

const isStatus = (value: string): value is Status =>
  value === "aprendido" || value === "aprendiendo" || value === "desconocido";

export default function VerbsPage() {
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<VerbType[]>([
    "regular",
    "irregular",
  ]);
  const [statusFilter, setStatusFilter] = React.useState<Status[]>([
    "desconocido",
    "aprendiendo",
    "aprendido",
  ]);
  const [statusByVerb, setStatusByVerb] = React.useState<
    Record<string, Status>
  >({});
  const [isReady, setIsReady] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(60);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

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

  React.useEffect(() => {
    if (!isReady) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusByVerb));
    } catch {
      // noop
    }
  }, [statusByVerb, isReady]);

  const verbs = (verbsData.verbs as Verb[]) ?? [];

  const getStatus = React.useCallback(
    (verb: Verb) => statusByVerb[verb.verb] ?? "desconocido",
    [statusByVerb],
  );

  const filteredVerbs = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return verbs.filter((verb) => {
      if (typeFilter.length > 0 && !typeFilter.includes(verb.type))
        return false;
      const status = getStatus(verb);
      if (statusFilter.length > 0 && !statusFilter.includes(status))
        return false;
      if (!normalizedQuery) return true;
      return [verb.verb, verb.past_simple, verb.past_participle, verb.future]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [verbs, typeFilter, statusFilter, query, getStatus]);

  React.useEffect(() => {
    setVisibleCount(60);
  }, [query, typeFilter, statusFilter]);

  const totalCount = verbs.length;
  const filteredCount = filteredVerbs.length;
  const visibleVerbs = React.useMemo(
    () => filteredVerbs.slice(0, visibleCount),
    [filteredVerbs, visibleCount],
  );
  const hasMore = visibleCount < filteredCount;

  React.useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => prev + 60);
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleStatusChange = (verb: Verb, status: Status) => {
    setStatusByVerb((prev) => ({
      ...prev,
      [verb.verb]: status,
    }));
  };

  const clearProgress = () => {
    setStatusByVerb({});
  };

  const clearFilters = () => {
    setQuery("");
    setTypeFilter(["regular", "irregular"]);
    setStatusFilter(["desconocido", "aprendiendo", "aprendido"]);
  };

  const toggleStatus = (status: Status) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item !== status)
        : [...prev, status],
    );
  };

  const toggleType = (type: VerbType) => {
    setTypeFilter((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type],
    );
  };

  const statusOptions = Object.keys(STATUS_META) as Status[];

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            List of Verbs
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Filtra por tipo, progreso y busca por cualquier forma verbal.
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
                Personaliza qué verbos quieres ver.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-3">
                <p className="text-base font-semibold text-neutral-900 dark:text-neutral-100 md:text-lg">
                  Estado de aprendizaje
                </p>
                <div className="space-y-3">
                  {(Object.keys(STATUS_META) as Status[]).map((status) => (
                    <FilterRow
                      key={status}
                      label={STATUS_META[status].label}
                      icon={STATUS_META[status].icon}
                      iconClass={STATUS_META[status].iconClass}
                      checked={statusFilter.includes(status)}
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
                      checked={typeFilter.includes(type)}
                      onCheckedChange={() => toggleType(type)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={clearFilters}>
                Limpiar filtros
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={clearProgress}>
                Resetear progreso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <label
                htmlFor="verbs-search"
                className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Buscar
              </label>
              <Input
                id="verbs-search"
                placeholder="Ej. go, went, gone, will go"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-neutral-800 dark:bg-transparent md:p-6">
        <div className="-mx-4 overflow-x-auto px-4">
          <Table className="min-w-[720px]">
            <TableCaption>
              Usa los botones de estado para marcar el progreso de cada verbo.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Verbo</TableHead>
                <TableHead>Significado</TableHead>
                <TableHead>Pasado simple</TableHead>
                <TableHead>Participio pasado</TableHead>
                <TableHead>Futuro</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleVerbs.map((verb, index) => {
                const status = getStatus(verb);
                const statusMeta = STATUS_META[status];
                const StatusIcon = statusMeta.icon;
                return (
                  <TableRow
                    key={`${verb.verb}-${index}`}
                    className={cn("border-l-4", statusMeta.rowBorderClass)}>
                    <TableCell className="font-medium text-neutral-900 dark:text-neutral-100">
                      {verb.verb}
                    </TableCell>
                    <TableCell>{verb.meaning ?? "—"}</TableCell>
                    <TableCell>{verb.past_simple}</TableCell>
                    <TableCell>{verb.past_participle}</TableCell>
                    <TableCell>{verb.future}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          verb.type === "irregular"
                            ? "border-red-500/35 text-red-600 dark:text-red-300 bg-red-500/10"
                            : "border-emerald-500/35 text-emerald-600 dark:text-emerald-300 bg-emerald-500/10"
                        }>
                        {TYPE_LABELS[verb.type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border", statusMeta.badgeClass)}>
                        {statusMeta.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Combobox
                          value={status}
                          onValueChange={(value: string | null) => {
                            if (value && isStatus(value)) {
                              handleStatusChange(verb, value);
                            }
                          }}>
                          <ComboboxTrigger className="flex w-full min-w-40 items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs sm:w-auto">
                            <span className="flex items-center gap-2">
                              <StatusIcon
                                className={cn("h-4 w-4", statusMeta.iconClass)}
                              />
                              <span>{statusMeta.label}</span>
                            </span>
                          </ComboboxTrigger>
                          <ComboboxContent>
                            <ComboboxList>
                              {statusOptions.map((option) => {
                                const meta = STATUS_META[option];
                                const OptionIcon = meta.icon;
                                return (
                                  <ComboboxItem
                                    key={option}
                                    value={option}>
                                    <OptionIcon
                                      className={cn("h-4 w-4", meta.iconClass)}
                                    />
                                    <span>{meta.label}</span>
                                  </ComboboxItem>
                                );
                              })}
                            </ComboboxList>
                          </ComboboxContent>
                        </Combobox>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {hasMore && (
          <div className="mt-4 flex justify-center">
            <div
              ref={sentinelRef}
              className="h-8 w-full"
              aria-hidden="true"
            />
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
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
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

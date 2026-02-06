"use client";

import * as React from "react";

import verbsData from "@/data/verbs.json";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxSeparator,
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
  ListFilter,
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
  const [typeFilter, setTypeFilter] = React.useState<VerbType[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<Status[]>([]);
  const [statusByVerb, setStatusByVerb] = React.useState<
    Record<string, Status>
  >({});
  const [isReady, setIsReady] = React.useState(false);

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

  const ALL_TYPES_VALUE = "all-types";
  const ALL_STATUS_VALUE = "all-status";

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

  const totalCount = verbs.length;
  const filteredCount = filteredVerbs.length;

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
    setTypeFilter([]);
    setStatusFilter([]);
  };

  const typeOptions: Array<{ value: VerbType; label: string }> = [
    { value: "irregular", label: "Irregular" },
    { value: "regular", label: "Regular" },
  ];

  const statusOptions: Array<{ value: Status; label: string }> = [
    { value: "aprendido", label: "Aprendido" },
    { value: "aprendiendo", label: "Aprendiendo" },
    { value: "desconocido", label: "Desconocido" },
  ];

  return (
    <div className="flex h-full w-full flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          List of Verbs
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Filtra por tipo, progreso y busca por cualquier forma verbal.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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

            <div className="flex w-full flex-wrap gap-3 lg:w-auto">
              <div className="flex w-full flex-col gap-2 sm:min-w-55 sm:w-auto">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Tipo
                </span>
                <Combobox
                  multiple
                  value={typeFilter}
                  onValueChange={(value: string[]) => {
                    if (value.includes(ALL_TYPES_VALUE)) {
                      setTypeFilter([]);
                      return;
                    }
                    setTypeFilter(
                      value.filter(
                        (item): item is VerbType => item !== ALL_TYPES_VALUE,
                      ),
                    );
                  }}>
                  <ComboboxChips className="min-h-9">
                    {typeFilter.map((value) => {
                      const meta = TYPE_META[value];
                      const Icon = meta.icon;
                      return (
                        <ComboboxChip
                          key={value}
                          className={cn("border", meta.chipClass)}>
                          <Icon className={cn("h-3.5 w-3.5", meta.iconClass)} />
                          {meta.label}
                        </ComboboxChip>
                      );
                    })}
                    <ComboboxChipsInput
                      placeholder={typeFilter.length > 0 ? "" : "Todos"}
                      aria-label="Filtrar por tipo"
                    />
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxItem value={ALL_TYPES_VALUE}>
                        <ListFilter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        <span>Todos</span>
                      </ComboboxItem>
                      <ComboboxSeparator />
                      {typeOptions.map((option) => {
                        const meta = TYPE_META[option.value];
                        const Icon = meta.icon;
                        return (
                          <ComboboxItem
                            key={option.value}
                            value={option.value}>
                            <Icon className={cn("h-4 w-4", meta.iconClass)} />
                            <span>{option.label}</span>
                          </ComboboxItem>
                        );
                      })}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>

              <div className="flex w-full flex-col gap-2 sm:min-w-65 sm:w-auto">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Progreso
                </span>
                <Combobox
                  multiple
                  value={statusFilter}
                  onValueChange={(value: string[]) => {
                    if (value.includes(ALL_STATUS_VALUE)) {
                      setStatusFilter([]);
                      return;
                    }
                    setStatusFilter(
                      value.filter(
                        (item): item is Status => item !== ALL_STATUS_VALUE,
                      ),
                    );
                  }}>
                  <ComboboxChips className="min-h-9">
                    {statusFilter.map((value) => {
                      const meta = STATUS_META[value];
                      const Icon = meta.icon;
                      return (
                        <ComboboxChip
                          key={value}
                          className={cn("border", meta.badgeClass)}>
                          <Icon className={cn("h-3.5 w-3.5", meta.iconClass)} />
                          {meta.label}
                        </ComboboxChip>
                      );
                    })}
                    <ComboboxChipsInput
                      placeholder={statusFilter.length > 0 ? "" : "Todos"}
                      aria-label="Filtrar por progreso"
                    />
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxItem value={ALL_STATUS_VALUE}>
                        <ListFilter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        <span>Todos</span>
                      </ComboboxItem>
                      <ComboboxSeparator />
                      {statusOptions.map((option) => {
                        const meta = STATUS_META[option.value];
                        const Icon = meta.icon;
                        return (
                          <ComboboxItem
                            key={option.value}
                            value={option.value}>
                            <Icon className={cn("h-4 w-4", meta.iconClass)} />
                            <span>{option.label}</span>
                          </ComboboxItem>
                        );
                      })}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </div>

          <div className="flex flex-col flex-wrap items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
              <span>
                Mostrando {filteredCount} de {totalCount} verbos
              </span>
              <Badge variant="outline">Estado guardado localmente</Badge>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={clearFilters}>
                Limpiar filtros
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={clearProgress}>
                Resetear progreso
              </Button>
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
              {filteredVerbs.map((verb, index) => {
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
                                const meta = STATUS_META[option.value];
                                const OptionIcon = meta.icon;
                                return (
                                  <ComboboxItem
                                    key={option.value}
                                    value={option.value}>
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
      </section>
    </div>
  );
}

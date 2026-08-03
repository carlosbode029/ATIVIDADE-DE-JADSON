"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL_VALUE = "__all__";

export type ProductFiltersData = {
  categories: { slug: string; name: string }[];
  teams: { slug: string; name: string }[];
  countries: { code: string; name: string }[];
  leagues: { slug: string; name: string }[];
  seasons: { id: string; label: string }[];
  sizes: string[];
};

const SORT_OPTIONS = [
  { value: "newest", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

export function ProductFilters({ data }: { data: ProductFiltersData }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value && value !== ALL_VALUE) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/produtos?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, time, jogador..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => updateParam("q", e.target.value)}
          className="pl-9"
        />
      </div>

      <FilterSelect
        label="Categoria"
        value={searchParams.get("categoria") ?? ""}
        onChange={(v) => updateParam("categoria", v)}
        options={data.categories.map((c) => ({ value: c.slug, label: c.name }))}
      />
      <FilterSelect
        label="Time"
        value={searchParams.get("time") ?? ""}
        onChange={(v) => updateParam("time", v)}
        options={data.teams.map((t) => ({ value: t.slug, label: t.name }))}
      />
      <FilterSelect
        label="País"
        value={searchParams.get("pais") ?? ""}
        onChange={(v) => updateParam("pais", v)}
        options={data.countries.map((c) => ({ value: c.code, label: c.name }))}
      />
      <FilterSelect
        label="Competição"
        value={searchParams.get("liga") ?? ""}
        onChange={(v) => updateParam("liga", v)}
        options={data.leagues.map((l) => ({ value: l.slug, label: l.name }))}
      />
      <FilterSelect
        label="Temporada"
        value={searchParams.get("temporada") ?? ""}
        onChange={(v) => updateParam("temporada", v)}
        options={data.seasons.map((s) => ({ value: s.id, label: s.label }))}
      />
      <FilterSelect
        label="Tamanho"
        value={searchParams.get("tamanho") ?? ""}
        onChange={(v) => updateParam("tamanho", v)}
        options={data.sizes.map((size) => ({ value: size, label: size }))}
      />
      <FilterSelect
        label="Ordenar por"
        value={searchParams.get("ordenar") ?? "newest"}
        onChange={(v) => updateParam("ordenar", v)}
        options={SORT_OPTIONS}
        allowClear={false}
      />
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allowClear = true,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allowClear?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      <Select value={value || ALL_VALUE} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowClear && <SelectItem value={ALL_VALUE}>Todos</SelectItem>}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

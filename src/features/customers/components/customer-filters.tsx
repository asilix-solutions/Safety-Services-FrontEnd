import React from "react";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import { useTranslation } from "@/providers/i18n-provider";
import { Search } from "lucide-react";
import { CustomerFilters } from "../types";
import { formatCity, formatSector } from "@/domains/customers/helpers";

interface CustomerFiltersProps {
  filters: CustomerFilters;
  onFiltersChange: (filters: CustomerFilters) => void;
  industries: string[];
  cities: string[];
}

export function CustomerFiltersComponent({
  filters,
  onFiltersChange,
  industries,
  cities,
}: CustomerFiltersProps) {
  const { t } = useTranslation();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value as any });
  };

  const handleIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, industry: e.target.value });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, city: e.target.value });
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-xs">
      {/* Search Input with pe-10 / ps-4 */}
      <div className="relative w-full md:w-80">
        <Input
          placeholder={t("common:customers.filter.search_placeholder")}
          value={filters.search}
          onChange={handleSearchChange}
          className="ps-4 pe-10 h-9 text-xs"
        />
        <Search className="absolute end-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto justify-end">
        {/* Status Filter */}
        <Select
          value={filters.status}
          onChange={handleStatusChange}
          className="w-full md:w-36 h-9 text-xs"
        >
          <option value="All">{t("common:customers.filter.status")}</option>
          <option value="Active">{t("common:customers.status.Active")}</option>
          <option value="Inactive">{t("common:customers.status.Inactive")}</option>
        </Select>

        {/* Industry Filter */}
        <Select
          value={filters.industry}
          onChange={handleIndustryChange}
          className="w-full md:w-44 h-9 text-xs"
        >
          <option value="All">{t("common:customers.filter.industry")}</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {formatSector(ind)}
            </option>
          ))}
        </Select>

        {/* City Filter */}
        <Select
          value={filters.city}
          onChange={handleCityChange}
          className="w-full md:w-36 h-9 text-xs"
        >
          <option value="All">{t("common:customers.filter.city")}</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {formatCity(city)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}


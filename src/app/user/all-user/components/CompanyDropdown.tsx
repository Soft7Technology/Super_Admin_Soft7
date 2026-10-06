"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { Company } from "../hooks/useCompanies";

interface CompanyDropdownProps {
  companies: Company[];
  value: string;
  onChange: (companyId: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function CompanyDropdown({
  companies,
  value,
  onChange,
  loading = false,
  error = null,
}: CompanyDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectedCompany = companies.find((company) => company.id === value);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return companies;

    return companies.filter((company) =>
      [company.name, company.email, company.phone, company.businessId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [companies, search]);

  const handleSelect = (companyId: string) => {
    onChange(companyId);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="au-company-dropdown" ref={rootRef}>
      <button
        type="button"
        className={`au-company-dropdown__trigger ${open ? "au-company-dropdown__trigger--open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="au-company-dropdown__trigger-text">
          {loading ? "Loading companies..." : selectedCompany?.name || "Select Company"}
        </span>
        {loading ? (
          <Loader2 size={16} className="au-company-dropdown__loader" />
        ) : (
          <ChevronDown size={16} />
        )}
      </button>

      {open && (
        <div className="au-company-dropdown__menu" role="listbox">
          <div className="au-company-dropdown__search">
            <Search size={15} />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search company..."
              aria-label="Search company"
            />
          </div>

          <button
            type="button"
            className={`au-company-dropdown__option ${
              !value ? "au-company-dropdown__option--selected" : ""
            }`}
            onClick={() => handleSelect("")}
          >
            <span>All Companies</span>
            {!value && <Check size={15} />}
          </button>

          <div className="au-company-dropdown__list">
            {error ? (
              <div className="au-company-dropdown__empty au-company-dropdown__error">
                {error}
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="au-company-dropdown__empty">
                No active company found
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={company.id === value}
                  key={company.id}
                  className={`au-company-dropdown__option ${
                    company.id === value
                      ? "au-company-dropdown__option--selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(company.id)}
                >
                  <span className="au-company-dropdown__option-content">
                    <span className="au-company-dropdown__option-name">
                      {company.name}
                    </span>
                    {company.email && (
                      <span className="au-company-dropdown__option-meta">
                        {company.email}
                      </span>
                    )}
                  </span>
                  {company.id === value && <Check size={15} />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

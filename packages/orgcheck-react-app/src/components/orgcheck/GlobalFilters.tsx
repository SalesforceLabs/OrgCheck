import { useEffect, useState } from 'react';
import { Check, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrgCheck, type OrgFilters } from '@/context/OrgCheckContext';
import { ANY } from '@/lib/navigation';

export default function GlobalFilters() {
  const { filters, filterOptions, filtersReady, applyFilters, refreshFilters } =
    useOrgCheck();
  const [draft, setDraft] = useState<OrgFilters>(filters);
  useEffect(() => {
    setDraft(filters);
  }, [filters]);
  const changed =
    draft.package !== filters.package ||
    draft.sobjectType !== filters.sobjectType ||
    draft.sobjectApiName !== filters.sobjectApiName;
  const originallyChanged =
    filters.package !== ANY ||
    filters.sobjectType !== ANY ||
    filters.sobjectApiName !== ANY;

  return (
    <div className="slds-grid slds-grid_vertical-align-end slds-gutters_xx-small orgcheck-global-filters">
      <div className="slds-col slds-grow">
        <div className="slds-form-element">
          <label className="slds-form-element__label" htmlFor="orgcheck-filter-package">
            Package
          </label>
          <div className="slds-form-element__control">
            <div className="slds-select_container">
              <select
                id="orgcheck-filter-package"
                className="slds-select"
                disabled={!filtersReady}
                value={draft.package}
                onChange={event =>
                  setDraft(current => ({ ...current, package: event.target.value }))
                }
              >
                {filterOptions.packages.map(option => (
                  <option
                    key={`pkg-${option.value || 'none'}`}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="slds-col slds-grow">
        <div className="slds-form-element">
          <label className="slds-form-element__label" htmlFor="orgcheck-filter-type">
            Type
          </label>
          <div className="slds-form-element__control">
            <div className="slds-select_container">
              <select
                id="orgcheck-filter-type"
                className="slds-select"
                disabled={!filtersReady}
                value={draft.sobjectType}
                onChange={event =>
                  setDraft(current => ({ ...current, sobjectType: event.target.value }))
                }
              >
                {filterOptions.types.map(option => (
                  <option key={`type-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="slds-col slds-grow">
        <div className="slds-form-element">
          <label className="slds-form-element__label" htmlFor="orgcheck-filter-object">
            Object
          </label>
          <div className="slds-form-element__control">
            <div className="slds-select_container">
              <select
                id="orgcheck-filter-object"
                className="slds-select"
                disabled={!filtersReady}
                value={draft.sobjectApiName}
                onChange={event =>
                  setDraft(current => ({
                    ...current,
                    sobjectApiName: event.target.value,
                  }))
                }
              >
                {filterOptions.objects.map(option => (
                  <option key={`obj-${option.value}`} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="slds-col slds-grow-none orgcheck-global-filters__actions">
        {changed ? (
          <Button
            size="icon-sm"
            title="Apply these filters"
            aria-label="Apply these filters"
            disabled={!filtersReady}
            onClick={() => void applyFilters(draft)}
          >
            <Check width={14} height={14} />
          </Button>
        ) : null}
        {originallyChanged ? (
          <Button
            size="icon-sm"
            variant="secondary"
            title="Remove all filters"
            aria-label="Remove all filters"
            disabled={!filtersReady}
            onClick={() => {
              const reset = { package: ANY, sobjectType: ANY, sobjectApiName: ANY };
              setDraft(reset);
              void applyFilters(reset);
            }}
          >
            <X width={14} height={14} />
          </Button>
        ) : null}
        <Button
          size="icon-sm"
          variant="secondary"
          title="Refresh the list of objects and packages"
          aria-label="Refresh the list of objects and packages"
          disabled={!filtersReady}
          onClick={() => void refreshFilters()}
        >
          <RefreshCw width={14} height={14} />
        </Button>
      </div>
      {!filtersReady ? (
        <div className="slds-col slds-grow-none">
          <span className="slds-text-body_small slds-text-color_weak">
            Filters not yet available.
          </span>
        </div>
      ) : null}
    </div>
  );
}

import ExtendedDatatable from '@/components/orgcheck/ExtendedDatatable';
import ExportButton from '@/components/orgcheck/ExportButton';
import { FormBooleanToggle } from '@/components/orgcheck/BooleanToggle';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { usePageLoader } from '@/hooks/usePageLoader';
import { allPages, type NavPage } from '@/lib/navigation';
import type { ExportedTable, Table } from '@/lib/orgcheck-bootstrap';
import { asBoolean, asNumber, asRecord, asString } from '@/lib/table-types';

const PAGE: NavPage = allPages().find(page => page.key === '06') as NavPage;

type NestedTable = { hasData?: boolean; nbAllRows?: number } & Table;

export default function ObjectDescription() {
  usePageLoader(PAGE);
  const { isObjectSpecified, tableData, exportData, exportBasenames, showScore } =
    useOrgCheck();
  const object = asRecord(tableData.object);

  if (!isObjectSpecified) {
    return (
      <p className="slds-text-body_regular">
        There is no specific object set in the global filter above.
        <br />
        <br />
        Please set the <b>SObject</b> value in the global filter and hit the apply
        button to see something here.
        <br />
        <br />
        Thank you!
      </p>
    );
  }

  if (!object) return <p className="slds-text-body_regular">Loading object documentation...</p>;

  const sections: { id: string; title: string; table?: NestedTable }[] = [
    { id: 'apexTriggers', title: 'Apex Triggers', table: object.apexTriggers as NestedTable },
    { id: 'workflowRules', title: 'Workflow Rules', table: object.workflowRules as NestedTable },
    { id: 'fieldSets', title: 'Field Sets', table: object.fieldSets as NestedTable },
    { id: 'layouts', title: 'Page Layouts', table: object.layouts as NestedTable },
    { id: 'flexiPages', title: 'Lightning Pages', table: object.flexiPages as NestedTable },
    { id: 'limits', title: 'Limits', table: object.limits as NestedTable },
    { id: 'validationRules', title: 'Validation Rules', table: object.validationRules as NestedTable },
    { id: 'webLinks', title: 'Web Links', table: object.webLinks as NestedTable },
    { id: 'customFields', title: 'Custom Fields', table: object.customFields as NestedTable },
    { id: 'standardFields', title: 'Standard Fields', table: object.standardFields as NestedTable },
    { id: 'recordTypes', title: 'Record Types', table: object.recordTypes as NestedTable },
    { id: 'relationships', title: 'Relationships', table: object.relationships as NestedTable },
  ];

  return (
    <div className="space-y-6">
      <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
        <h2 className="slds-text-heading_large">
          {asString(object.label)} ({asString(object.apiname)})
        </h2>
        <ExportButton
          source={exportData.object as ExportedTable | ExportedTable[]}
          basename={exportBasenames.object}
        />
      </div>
      <nav className="slds-text-body_small">
        {[
          { id: 'dataInformation', title: 'Data Information' },
          ...sections
            .filter(section => section.table?.hasData)
            .map(section => ({
              id: section.id,
              title: `${section.title} (${section.table?.nbAllRows})`,
            })),
        ].map((item, index) => (
          <span key={item.id}>
            {index > 0 ? ' | ' : null}
            <a href={`#${item.id}`}>{item.title}</a>
          </span>
        ))}
      </nav>
      <h3 className="slds-text-heading_medium">General information</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ReadOnlyField label="API Name" value={asString(object.apiname)} />
        <ReadOnlyField label="Object Type" value={asString(object.type)} />
        <ReadOnlyField label="Package" value={asString(object.package)} />
        <ReadOnlyField label="Singular Label" value={asString(object.label)} />
        <ReadOnlyField label="Plural Label" value={asString(object.labelPlural)} />
        <ReadOnlyField label="Description" value={asString(object.description)} />
        <ReadOnlyField label="Key Prefix" value={asString(object.keyPrefix)} />
        <FormBooleanToggle label="Is Custom?" checked={asBoolean(object.isCustom)} readOnly />
        <FormBooleanToggle
          label="Feed Enable?"
          checked={asBoolean(object.isFeedEnabled)}
          readOnly
        />
        <FormBooleanToggle
          label="Most Recent Enabled?"
          checked={asBoolean(object.isMostRecentEnabled)}
          readOnly
        />
        <FormBooleanToggle
          label="Global Search Enabled?"
          checked={asBoolean(object.isSearchable)}
          readOnly
        />
        <ReadOnlyField label="Internal Sharing" value={asString(object.internalSharingModel)} />
        <ReadOnlyField label="External Sharing" value={asString(object.externalSharingModel)} />
      </div>
      <h3 id="dataInformation" className="slds-text-heading_medium">
        Data information
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <ReadOnlyField
          label="Record Count"
          value={String(asNumber(object.recordCount) ?? '')}
        />
        <ReadOnlyField
          label="Last Record Modified"
          value={formatDate(object.lastModifiedRecordDate)}
        />
        <ReadOnlyField
          label="Object Last Modified"
          value={formatDate(object.lastModifiedDate)}
        />
      </div>
      {sections
        .filter(section => section.table?.hasData)
        .map(section => (
          <section key={section.id} id={section.id} className="space-y-2">
            <h3 className="slds-text-heading_medium">{section.title}</h3>
            <ExtendedDatatable
              table={section.table}
              dontUseAllSpace
              showSearch
              showStatistics
              isInfiniteScrolling
              infiniteScrollingInitialNbRows={25}
              infiniteScrollingAdditionalNbRows={100}
              onViewScore={showScore}
            />
          </section>
        ))}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b pb-2">
      <Label>{label}</Label>
      <Input value={value} readOnly />
    </div>
  );
}

function formatDate(value: unknown): string {
  if (typeof value !== 'number' && typeof value !== 'string') return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}

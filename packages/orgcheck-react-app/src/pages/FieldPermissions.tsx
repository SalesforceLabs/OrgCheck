import ExtendedDatatable from '@/components/orgcheck/ExtendedDatatable';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { usePageLoader } from '@/hooks/usePageLoader';
import { allPages, type NavPage } from '@/lib/navigation';
import type { ExportedTable, Table } from '@/lib/orgcheck-bootstrap';

const PAGE: NavPage = allPages().find(page => page.key === '14') as NavPage;

export default function FieldPermissions() {
  usePageLoader(PAGE);
  const { isObjectSpecified, filters, tableData, exportData, exportBasenames } =
    useOrgCheck();

  if (!isObjectSpecified) {
    return (
      <p className="slds-text-body_regular">
        There is no specific object set in the global filter above.
        <br />
        <br />
        Please set the <b>SObject</b> value in the global filter and hit the Apply
        button to see something here.
      </p>
    );
  }

  return (
    <div>
      <h2 className="slds-text-heading_medium slds-m-bottom_small">{filters.sobjectApiName}</h2>
      <p className="slds-text-body_small slds-text-align_right slds-m-bottom_small">
        <b>Legend:</b> R means <i>field can be read</i>, U means{' '}
        <i>field can be updated</i>.
      </p>
      <ExtendedDatatable
        table={tableData.fieldpermissions as Table | undefined}
        emptyMessage="There is no field permission to show."
        showSearch
        showStatistics
        isStickyHeaders
        isInfiniteScrolling
        infiniteScrollingInitialNbRows={25}
        infiniteScrollingAdditionalNbRows={100}
        showExportButton
        exportSource={exportData.fieldpermissions as ExportedTable | ExportedTable[]}
        exportBasename={exportBasenames.fieldpermissions}
      />
    </div>
  );
}

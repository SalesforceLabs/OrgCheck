import ExtendedDatatable from '@/components/orgcheck/ExtendedDatatable';
import ExportButton from '@/components/orgcheck/ExportButton';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { usePageLoader } from '@/hooks/usePageLoader';
import { allPages, type NavPage } from '@/lib/navigation';
import type { ExportedTable, Table } from '@/lib/orgcheck-bootstrap';
import { asRecord } from '@/lib/table-types';

const PAGE: NavPage = allPages().find(page => page.key === '04') as NavPage;

export default function GlobalView() {
  usePageLoader(PAGE);
  const { tableData, exportData, exportBasenames } = useOrgCheck();
  const view = asRecord(tableData.globalview);

  if (!view) {
    return (
      <p className="text-amber-600 text-sm">
        Please wait while the overview is loading...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ExportButton
          source={exportData.globalview as ExportedTable | ExportedTable[]}
          basename={exportBasenames.globalview}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-2 text-lg">Count of ✅ and ❌ per type</h2>
          <ExtendedDatatable
            table={view.statisticsGoodAndBad as Table}
            emptyMessage="There is no statistics to show."
            showSearch
            dontUseAllSpace
          />
        </div>
        <div>
          <h2 className="font-display mb-2 text-lg">
            Count of ❌ per type and reason
          </h2>
          <ExtendedDatatable
            table={view.statisticsReasons as Table}
            emptyMessage="There is no statistics to show."
            showSearch
            dontUseAllSpace
          />
        </div>
      </div>
    </div>
  );
}

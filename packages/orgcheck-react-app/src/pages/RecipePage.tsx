import { useMemo } from 'react';
import { useMatches } from 'react-router';
import ExtendedDatatable from '@/components/orgcheck/ExtendedDatatable';
import { Button } from '@/components/ui/button';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { usePageLoader } from '@/hooks/usePageLoader';
import { allPages } from '@/lib/navigation';
import type { Table, ExportedTable } from '@/lib/orgcheck-bootstrap';

export default function RecipePage() {
  const match = useMatches().at(-1);
  const path = typeof match?.pathname === 'string' ? match.pathname : '/';
  const page = useMemo(
    () => allPages().find(item => item.path === path),
    [path]
  );
  usePageLoader(page);
  const {
    tableData,
    exportData,
    exportBasenames,
    showScore,
    runAllTests,
    recompile,
    isObjectSpecified,
  } = useOrgCheck();

  if (!page) {
    return <p>Unknown page.</p>;
  }

  if (page.requiresObject && !isObjectSpecified) {
    return (
      <p className="slds-text-body_regular">
        There is no specific object set in the global filter above.
        <br />
        <br />
        Please set the <b>SObject</b> value in the global filter and hit the apply
        button to see something here.
      </p>
    );
  }

  const table = page.dataKey ? tableData[page.dataKey] : undefined;
  const extra =
    page.extraAction === 'runAllTests' && table ? (
      <Button variant="outline" onClick={() => void runAllTests()}>
        Run All Tests
      </Button>
    ) : page.extraAction === 'recompile' && table ? (
      <Button variant="outline" onClick={() => void recompile()}>
        Recompile
      </Button>
    ) : null;

  return (
    <div>
      {page.intro ? <p className="slds-text-body_regular slds-m-bottom_small">{page.intro}</p> : null}
      {page.legend ? (
        <p className="slds-text-body_small slds-text-align_right slds-m-bottom_small">
          <b>Legend:</b> {page.legend}
        </p>
      ) : null}
      <ExtendedDatatable
        table={table as Table | undefined}
        emptyMessage={page.emptyMessage}
        showSearch
        showStatistics
        showExportButton
        exportSource={
          page.dataKey
            ? (exportData[page.dataKey] as ExportedTable | ExportedTable[])
            : undefined
        }
        exportBasename={page.dataKey ? exportBasenames[page.dataKey] : undefined}
        isInfiniteScrolling
        infiniteScrollingInitialNbRows={25}
        infiniteScrollingAdditionalNbRows={100}
        isStickyHeaders
        onViewScore={page.showScore ? showScore : undefined}
        extraActions={extra}
      />
    </div>
  );
}

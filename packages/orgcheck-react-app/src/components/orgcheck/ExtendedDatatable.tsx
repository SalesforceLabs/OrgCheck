import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronDown, ChevronsDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ScoreLink from '@/components/orgcheck/ScoreLink';
import DependencyLink from '@/components/orgcheck/DependencyLink';
import DependencyViewer from '@/components/orgcheck/DependencyViewer';
import ExportButton from '@/components/orgcheck/ExportButton';
import BooleanToggle from '@/components/orgcheck/BooleanToggle';
import { TableUtils, type ExportedTable, type Table as OrgTable } from '@/lib/orgcheck-bootstrap';
import {
  asBoolean,
  asNumber,
  asRecord,
  asString,
  type TableCell,
  type TableRowView,
} from '@/lib/table-types';
import { toSalesforceHref } from '@/lib/html';
import { cn } from '@/lib/utils';
import './ExtendedDatatable.css';

type ExtendedDatatableProps = {
  table?: unknown;
  emptyMessage?: string;
  showStatistics?: boolean;
  showSearch?: boolean;
  showExportButton?: boolean;
  exportSource?: ExportedTable | ExportedTable[];
  exportBasename?: string;
  isInfiniteScrolling?: boolean;
  infiniteScrollingInitialNbRows?: number;
  infiniteScrollingAdditionalNbRows?: number;
  isStickyHeaders?: boolean;
  dontUseAllSpace?: boolean;
  showScore?: boolean;
  onViewScore?: (detail: {
    whatId: string;
    whatName: string;
    score: number;
    reasonIds?: number[];
    fields?: string[];
  }) => void;
  extraActions?: React.ReactNode;
};

function cloneTable(table: OrgTable): OrgTable {
  return {
    ...table,
    rows: table.rows.map(row => ({
      ...row,
      cells: row.cells.map(cell => ({ ...cell })),
    })),
  };
}

export default function ExtendedDatatable({
  table,
  emptyMessage = 'No data to show.',
  showStatistics = false,
  showSearch = false,
  showExportButton = false,
  exportSource,
  exportBasename,
  isInfiniteScrolling = false,
  infiniteScrollingInitialNbRows = 25,
  infiniteScrollingAdditionalNbRows = 100,
  isStickyHeaders = false,
  dontUseAllSpace = false,
  onViewScore,
  extraActions,
}: ExtendedDatatableProps) {
  const [working, setWorking] = useState<OrgTable | undefined>();
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(infiniteScrollingInitialNbRows);
  const [dependency, setDependency] = useState<{
    whatId: string;
    whatName: string;
    dependencies: unknown;
  } | null>(null);

  useEffect(() => {
    if (!table || typeof table !== 'object' || !('rows' in (table as object))) {
      setWorking(undefined);
      return;
    }
    const cloned = cloneTable(table as OrgTable);
    TableUtils.sort(cloned, cloned.orderIndex, cloned.orderSort);
    TableUtils.filter(cloned, search);
    setWorking(cloned);
    setVisibleCount(infiniteScrollingInitialNbRows);
  }, [infiniteScrollingInitialNbRows, search, table]);

  const rows: TableRowView[] = useMemo(() => {
    if (!working) return [];
    return working.rows.map((row, rowIndex) => ({
      key: String(rowIndex),
      cssClass: (row.score ?? 0) > 0 ? 'bg-amber-100' : '',
      index: row.index,
      score: row.score,
      name: row.name,
      badFields: row.badFields,
      badReasonIds: row.badReasonIds as unknown as number[],
      isVisible: row.isVisible ?? true,
      cells: (row.cells ?? []).map((cell, cellIndex) => ({
        ...(cell as TableCell),
        key: `${rowIndex}.${cellIndex}`,
      })),
    }));
  }, [working]);

  const visibleRows = rows.filter(row => row.isVisible);
  const displayedRows = isInfiniteScrolling
    ? visibleRows.slice(0, visibleCount)
    : visibleRows;
  const hasMore = isInfiniteScrolling && visibleCount < visibleRows.length;
  const usesDependencies = rows.some(row =>
    row.cells.some(cell => cell.typeofdependencies)
  );

  if (!working) {
    return <p className="slds-text-body_regular slds-text-color_weak">{emptyMessage}</p>;
  }

  const headers = working.definition?.columns ?? [];

  return (
    <div>
      <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center slds-wrap slds-m-bottom_small">
        {showStatistics ? (
          <div className="slds-grid slds-gutters_xx-small slds-wrap">
            <Badge variant={working.nbBadRows ? 'destructive' : 'secondary'}>
              There are {working.nbAllRows} rows
              {working.nbBadRows ? ` including ${working.nbBadRows} bad rows` : ''}.
            </Badge>
            {working.isFilterOn ? (
              <Badge variant={working.nbFilteredRows ? 'secondary' : 'destructive'}>
                {working.nbFilteredRows
                  ? `There are ${working.nbFilteredRows} rows matching your filter.`
                  : 'There is no row matching your filter.'}
              </Badge>
            ) : null}
            {isInfiniteScrolling && hasMore ? (
              <Badge variant="outline">
                You currently see {visibleCount} rows. But you can ask for more!
              </Badge>
            ) : null}
            <Badge variant="outline">
              {working.orderIndex !== undefined
                ? `Table is sorted by field "${headers[working.orderIndex]?.label ?? ''}" in ${working.orderSort === 'asc' ? 'ascending' : 'descending'} order.`
                : 'Table is not sorted yet.'}
            </Badge>
          </div>
        ) : (
          <span />
        )}
        <div className="slds-grid slds-grid_vertical-align-center slds-gutters_xx-small">
          {extraActions}
          {showExportButton ? (
            <ExportButton source={exportSource} basename={exportBasename} />
          ) : null}
        </div>
      </div>
      {showSearch ? (
        <div className="slds-form-element slds-m-bottom_small">
          <label className="slds-form-element__label slds-assistive-text" htmlFor="orgcheck-table-search">
            Search table
          </label>
          <div className="slds-form-element__control">
            <Input
              id="orgcheck-table-search"
              type="search"
              aria-label="Search table"
              placeholder="Search any string field values (more than 2 characters)"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>
        </div>
      ) : null}
      <div
        className={cn(
          'orgcheck-datatable',
          'slds-scrollable',
          'autowidth',
          dontUseAllSpace && 'unsettablewidth',
          isStickyHeaders && 'stickytable'
        )}
      >
        <table className="slds-table slds-table_bordered">
          <thead>
            <tr>
              {headers.map((column, index) => (
                <th
                  key={`${column.label}-${index}`}
                  aria-colindex={index + 1}
                  aria-label={column.label}
                  scope="col"
                  tabIndex={0}
                  className={cn(
                    working.orderIndex === index && 'sorted',
                    working.orderIndex === index &&
                      (working.orderSort === 'asc' ? 'sorted-asc' : 'sorted-desc'),
                    isStickyHeaders && 'sticky',
                    column.orientation === 'vertical' && 'vertical'
                  )}
                  onClick={() => {
                    if (!working) return;
                    const next = cloneTable(working);
                    if (next.orderIndex === index) {
                      next.orderSort = next.orderSort === 'asc' ? 'desc' : 'asc';
                    } else {
                      next.orderIndex = index;
                      next.orderSort = 'asc';
                    }
                    TableUtils.sort(next, next.orderIndex, next.orderSort);
                    TableUtils.filter(next, search);
                    setWorking(next);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.currentTarget.click();
                    }
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map(row => (
              <tr key={row.key} className={row.cssClass}>
                {row.cells.map(cell => (
                  <td
                    key={cell.key}
                    className={cn(
                      'slds-cell-wrap',
                      cell.isbad && 'slds-theme_warning slds-text-title_bold'
                    )}
                  >
                    <CellView
                      cell={cell}
                      row={row}
                      onViewScore={onViewScore}
                      onViewDependency={detail => setDependency(detail)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {working.nbAllRows === 0 ? <p>{emptyMessage}</p> : null}
      {working.isFilteredDataEmpty ? <p>No data to show with this filter.</p> : null}
      {hasMore ? (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setVisibleCount(count =>
                Math.min(count + infiniteScrollingAdditionalNbRows, visibleRows.length)
              )
            }
          >
            <ChevronDown /> More rows
          </Button>
          <Button variant="outline" onClick={() => setVisibleCount(visibleRows.length)}>
            <ChevronsDown /> All rows
          </Button>
        </div>
      ) : null}
      {usesDependencies ? (
        <DependencyViewer
          open={Boolean(dependency)}
          whatId={dependency?.whatId ?? ''}
          whatName={dependency?.whatName ?? ''}
          dependencies={dependency?.dependencies}
          onClose={() => setDependency(null)}
        />
      ) : null}
    </div>
  );
}

function CellView({
  cell,
  row,
  onViewScore,
  onViewDependency,
}: {
  cell: TableCell;
  row: TableRowView;
  onViewScore?: ExtendedDatatableProps['onViewScore'];
  onViewDependency: (detail: {
    whatId: string;
    whatName: string;
    dependencies: unknown;
  }) => void;
}) {
  if (cell.typeofindex) return <>{row.index}</>;
  if (cell.typeofscore) {
    return (
      <ScoreLink
        whatId={asString(cell.data?.id)}
        whatName={asString(cell.data?.name)}
        score={row.score}
        reasonIds={row.badReasonIds}
        fields={row.badFields}
        onView={detail => onViewScore?.(detail)}
      />
    );
  }
  if (cell.typeofdependencies) {
    return (
      <DependencyLink
        whatId={asString(cell.data?.id)}
        whatName={asString(cell.data?.name)}
        dependencies={cell.data?.value}
        onView={onViewDependency}
      />
    );
  }
  if (cell.decoration) return <>{asString(cell.decoration)}</>;
  if (cell.typeofid) return <IdCell data={cell.data} />;
  if (cell.typeofids) return <ListCell values={cell.data?.values} kind="id" />;
  if (cell.typeofpercentage) {
    const value = asNumber(cell.data?.value);
    return value === undefined ? null : <>{(value * 100).toFixed(2)}%</>;
  }
  if (cell.typeofnumeric) {
    const value = asNumber(cell.data?.value);
    return value === undefined ? null : <>{new Intl.NumberFormat().format(value)}</>;
  }
  if (cell.typeofboolean) {
    const editable = cell.editable === true;
    return (
      <div className="slds-text-align_center">
        <BooleanToggle
          checked={asBoolean(cell.data?.value)}
          readOnly={!editable}
          onChange={editable ? cell.onChange : undefined}
        />
      </div>
    );
  }
  if (cell.typeofdatetime) {
    const value = cell.data?.value;
    if (!value) return null;
    const date = new Date(value as string | number);
    return Number.isNaN(date.getTime()) ? null : <>{date.toLocaleString()}</>;
  }
  if (cell.typeoftext) return <>{asString(cell.data?.value)}</>;
  if (cell.typeoftexts) return <ListCell values={cell.data?.values} kind="text" />;
  if (cell.typeofobjects) return <ListCell values={cell.data?.values} kind="text" />;
  return <span>Type we don't have yet for {asString(cell.tostring)}</span>;
}

function IdCell({ data }: { data?: TableCell['data'] }) {
  if (data?.decoration) return <>{asString(data.decoration)}</>;
  const href = toSalesforceHref(asString(data?.value));
  const label = asString(data?.label);
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="external noopener noreferrer"
        className="inline-flex items-center gap-1 underline"
      >
        {label || href}
        <ExternalLink className="size-3" />
      </a>
    );
  }
  return <>{label}</>;
}

function ListCell({
  values,
  kind,
}: {
  values?: unknown[];
  kind: 'id' | 'text';
}) {
  if (!values || values.length === 0) return null;
  return (
    <div>
      <small>
        <i>{values.length} item(s)</i>
      </small>
      {values.map((item, index) => {
        const record = asRecord(item);
        let content: ReactNode;
        if (record?.decoration) {
          content = asString(record.decoration);
        } else if (kind === 'id') {
          content = <IdCell data={asRecord(record?.data) as TableCell['data']} />;
        } else {
          content = asString(record?.data ?? item);
        }
        return (
          <div key={index} className="orgcheck-list-item">
            <span className="orgcheck-list-item__bullet" aria-hidden="true">
              -
            </span>
            <span className="orgcheck-list-item__content">{content}</span>
          </div>
        );
      })}
    </div>
  );
}

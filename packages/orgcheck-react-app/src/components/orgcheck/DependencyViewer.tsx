import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Graphics from '@/components/orgcheck/Graphics';
import ModalCloseButton from '@/components/orgcheck/ModalCloseButton';
import { escapeHtml, toSalesforceHref } from '@/lib/html';
import { asRecord, asString } from '@/lib/table-types';

type DependencyViewerProps = {
  open: boolean;
  whatId: string;
  whatName: string;
  dependencies: unknown;
  onClose: () => void;
};

type TreeNode = {
  id?: string;
  label: string;
  url?: string;
  children?: TreeNode[];
};

const LEGEND = [
  { color: '#2f89a8', name: 'Root' },
  { color: '#3fb9b8', name: '1st level' },
  { color: '#4fb9c8', name: '2nd level' },
  { color: '#5fc9f8', name: '3rd+ level' },
];

export default function DependencyViewer({
  open,
  whatId,
  whatName,
  dependencies,
  onClose,
}: DependencyViewerProps) {
  const tree = useMemo(() => {
    const record = asRecord(dependencies);
    const root: TreeNode = {
      label: whatName,
      children: [
        { id: 'referenced', label: 'Where is it referenced?', children: [] },
        { id: 'using', label: 'What is it using?', children: [] },
      ],
    };
    const existing: Record<string, TreeNode> = {};
    root.children?.forEach(branch => {
      const items = Array.isArray(record?.[branch.id ?? ''])
        ? (record?.[branch.id ?? ''] as unknown[])
        : [];
      items.forEach(item => {
        const row = asRecord(item);
        const typeId = `${branch.id}/${asString(row?.type)}`;
        if (!existing[typeId]) {
          const node: TreeNode = { label: asString(row?.type), children: [] };
          existing[typeId] = node;
          branch.children?.push(node);
        }
        existing[typeId].children?.push({
          id: asString(row?.id),
          label: asString(row?.name),
          url: asString(row?.url),
        });
      });
    });
    return root;
  }, [dependencies, whatName]);

  if (!open) return null;

  return (
    <div>
      <button
        type="button"
        className="slds-backdrop slds-backdrop_open"
        aria-label="Close dependency viewer"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="orgcheck-dependency-title"
        className="slds-modal slds-fade-in-open slds-modal_large"
      >
        <div className="slds-modal__container">
          <ModalCloseButton onClick={onClose} />
          <header className="slds-modal__header">
            <h1 id="orgcheck-dependency-title" className="slds-modal__title slds-hyphenate">
              Dependency viewer: {whatName} ({whatId})
            </h1>
          </header>
          <div className="slds-modal__content slds-p-around_medium">
            <Graphics
              type="hierarchy"
              name={whatName}
              source={tree}
              hierarchyBoxColorLegend={LEGEND}
              hierarchyBoxColorDecorator={depth => Math.min(depth, 3)}
              hierarchyBoxInnerHtmlDecorator={(depth, data) => {
                const node = data as TreeNode;
                if (depth === 0) return `<center><b>${escapeHtml(node.label)}</b></center>`;
                if (depth === 3) {
                  const href = toSalesforceHref(node.url);
                  return `${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">` : ''}<b>${escapeHtml(node.label)}</b><br /><small><code>${escapeHtml(node.id)}</code></small>${href ? '</a>' : ''}`;
                }
                const count = node.children?.length ?? 0;
                return `<center>${escapeHtml(node.label)}<br /><code><small>${count} ${count > 1 ? 'items' : 'item'}</small></code></center>`;
              }}
            />
          </div>
          <footer className="slds-modal__footer">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </footer>
        </div>
      </section>
    </div>
  );
}

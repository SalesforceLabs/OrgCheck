import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableUtils, type ExportedTable } from '@/lib/orgcheck-bootstrap';

type ExportButtonProps = {
  source?: ExportedTable | ExportedTable[];
  basename?: string;
  label?: string;
};

export default function ExportButton({
  source,
  basename = 'Export',
  label = 'Export',
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleClick = () => {
    if (!source) return;
    setExporting(true);
    try {
      const buffer = TableUtils.exportAsXls(source);
      const url = URL.createObjectURL(
        new Blob([buffer], { type: 'application/octet-stream' })
      );
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${basename}.xlsx`;
      anchor.rel = 'noopener noreferrer';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={exporting || !source}
      title={exporting ? 'Exporting...' : label}
    >
      <Download />
      {exporting ? 'Exporting...' : label}
    </Button>
  );
}

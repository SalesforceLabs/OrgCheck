import { Button } from '@/components/ui/button';
import { Search, TriangleAlert } from 'lucide-react';
import { asRecord } from '@/lib/table-types';

type DependencyLinkProps = {
  whatId?: string;
  whatName?: string;
  dependencies?: unknown;
  onView: (detail: {
    whatId: string;
    whatName: string;
    dependencies: unknown;
  }) => void;
};

export default function DependencyLink({
  whatId,
  whatName,
  dependencies,
  onView,
}: DependencyLinkProps) {
  const record = asRecord(dependencies);
  const using = Array.isArray(record?.using) ? record.using : [];
  const referenced = Array.isArray(record?.referenced) ? record.referenced : [];
  const hadError = record?.hadError === true;
  const count = using.length + referenced.length;

  if (count > 0) {
    return (
      <Button
        variant="link"
        size="sm"
        onClick={() =>
          onView({
            whatId: whatId ?? '',
            whatName: whatName ?? '',
            dependencies,
          })
        }
      >
        Dependencies
        <Search />
      </Button>
    );
  }
  if (hadError) {
    return (
      <Button variant="destructive" size="sm" disabled>
        Error
        <TriangleAlert />
      </Button>
    );
  }
  return <span className="text-muted-foreground text-xs">No dependency</span>;
}

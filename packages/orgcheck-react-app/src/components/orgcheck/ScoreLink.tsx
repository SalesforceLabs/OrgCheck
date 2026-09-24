import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react';

type ScoreLinkProps = {
  whatId?: string;
  whatName?: string;
  score?: number;
  reasonIds?: number[];
  fields?: string[];
  onView: (detail: {
    whatId: string;
    whatName: string;
    score: number;
    reasonIds?: number[];
    fields?: string[];
  }) => void;
};

export default function ScoreLink({
  whatId,
  whatName,
  score,
  reasonIds,
  fields,
  onView,
}: ScoreLinkProps) {
  if (!score || score <= 0) return null;
  return (
    <Button
      variant="link"
      size="sm"
      onClick={() =>
        onView({
          whatId: whatId ?? '',
          whatName: whatName ?? '',
          score,
          reasonIds,
          fields,
        })
      }
    >
      {score}
      <MessageSquareText />
    </Button>
  );
}

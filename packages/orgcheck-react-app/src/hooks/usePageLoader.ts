import { useEffect } from 'react';
import { useOrgCheck } from '@/context/OrgCheckContext';
import type { NavPage } from '@/lib/navigation';

export function usePageLoader(page: NavPage | undefined): void {
  const { loadPageData, usage } = useOrgCheck();
  useEffect(() => {
    if (usage.accepted && page) {
      void loadPageData(page);
    }
  }, [loadPageData, page, usage.accepted]);
}

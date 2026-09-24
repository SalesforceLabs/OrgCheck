import { Database, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrgCheck } from '@/context/OrgCheckContext';
import { usePageLoader } from '@/hooks/usePageLoader';
import { allPages, type NavPage } from '@/lib/navigation';
import { escapeHtml } from '@/lib/html';

const PAGE: NavPage = allPages().find(page => page.key === '02') as NavPage;

export default function Cache() {
  usePageLoader(PAGE);
  const { tableData, clearCache, getCacheItem, openModal } = useOrgCheck();
  const items = Array.isArray(tableData.cacheitems)
    ? (tableData.cacheitems as {
        renderKey?: string;
        name: string;
        created?: string;
        isMap?: boolean;
        isArray?: boolean;
        length?: number;
      }[])
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">
          List of cached metadata from the Salesforce org you want to check into
          your Browser persistent cache
        </p>
        <Button variant="destructive" onClick={clearCache}>
          Clear
        </Button>
      </div>
      {items.length === 0 ? (
        <p>There is no cached data to display.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <Card key={item.renderKey ?? item.name}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="size-4" />
                  <span className="truncate">{item.name}</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Show details"
                  onClick={() => {
                    const cacheData = getCacheItem(item.name);
                    let html = '';
                    if (cacheData === null || cacheData === undefined) {
                      html = 'There is no data in the cache for this item.';
                    } else if (cacheData instanceof Map) {
                      html = `<b>Type:</b> Map<br /><br /><b>Size:</b> ${cacheData.size}<br /><br /><b>Content:</b><ul>`;
                      Array.from(cacheData.entries()).forEach((entry, index) => {
                        html += `<li><b>INDEX:</b> ${index}, <b>KEY:</b> ${escapeHtml(entry[0])}, <b>VALUE:</b> ${escapeHtml(JSON.stringify(entry[1]))}</li>`;
                      });
                      html += '</ul>';
                    } else if (Array.isArray(cacheData)) {
                      html = `<b>Type:</b> Array<br /><br /><b>Size:</b> ${cacheData.length}<br /><br /><b>Content:</b><ul>`;
                      cacheData.forEach((value, index) => {
                        html += `<li><b>INDEX:</b> ${index}, <b>VALUE:</b> ${escapeHtml(JSON.stringify(value))}</li>`;
                      });
                      html += '</ul>';
                    } else {
                      html = `<b>Type:</b> ${typeof cacheData}<br /><br /><b>Content:</b><br />${escapeHtml(JSON.stringify(cacheData))}`;
                    }
                    openModal(`Dump of the browser cache for item: ${item.name}`, html);
                  }}
                >
                  <ZoomIn />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-center font-display text-3xl">{item.length ?? 0}</p>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {item.created ? (
                  <Badge variant="outline">{item.created}</Badge>
                ) : null}
                <Badge variant="secondary">
                  {item.isMap ? 'Map' : item.isArray ? 'Array' : 'Object'}
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

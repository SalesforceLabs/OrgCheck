import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export type HierarchyLegendItem = { color: string; name: string };

type GraphicsProps = {
  type: 'hierarchy' | 'pie';
  name: string;
  source?: unknown;
  hierarchyBoxColorLegend?: HierarchyLegendItem[];
  hierarchyBoxColorDecorator?: (depth: number, data: unknown) => number;
  hierarchyBoxInnerHtmlDecorator?: (depth: number, data: unknown) => string;
  hierarchyBoxOnClickDecorator?: (depth: number, data: unknown) => void;
  hierarchyShowLevel?: boolean;
};

export default function Graphics({
  type,
  name,
  source,
  hierarchyBoxColorLegend = [],
  hierarchyBoxColorDecorator = () => 0,
  hierarchyBoxInnerHtmlDecorator = () => '',
  hierarchyBoxOnClickDecorator = () => undefined,
  hierarchyShowLevel = false,
}: GraphicsProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [legend, setLegend] = useState<HierarchyLegendItem[]>(hierarchyBoxColorLegend);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || source === undefined) return;
    host.replaceChildren();
    if (type !== 'hierarchy') return;

    const boxHeight = 40;
    const boxWidth = 200;
    const boxVerticalPadding = 5;
    const boxHorizontalPadding = 50;
    const boxTextPadding = 3;
    setLegend(hierarchyBoxColorLegend);

    type NodeData = Record<string, unknown>;
    const root = d3.hierarchy(source as NodeData);
    let mdepth = 0;
    root.each(node => {
      if (mdepth < node.depth) mdepth = node.depth;
    });
    const WIDTH = boxWidth * (mdepth + 1) + boxHorizontalPadding * mdepth;
    const treeRoot = d3
      .tree<NodeData>()
      .nodeSize([boxHeight + boxVerticalPadding, boxWidth + boxHorizontalPadding])(
      root
    );

    let x0 = Infinity;
    let x1 = -Infinity;
    treeRoot.each(node => {
      if (node.x > x1) x1 = node.x;
      if (node.x < x0) x0 = node.x;
    });

    const svg = d3
      .select(host)
      .append('svg')
      .attr('viewBox', `-75 0 ${WIDTH} ${x1 - x0 + (boxHeight + boxVerticalPadding) * 2}`)
      .attr('xmlns', 'http://www.w3.org/2000/svg');
    const graph = svg
      .append('g')
      .attr('font-family', 'Trebuchet MS,Segoe UI,sans-serif')
      .attr('font-size', 10)
      .attr(
        'transform',
        `translate(${(boxWidth + boxHorizontalPadding) / 2 - boxWidth},${boxHeight + boxVerticalPadding - x0})`
      );

    graph
      .append('g')
      .attr('fill', 'none')
      .attr('stroke', '#2f89a8')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2)
      .selectAll('path')
      .data(treeRoot.links())
      .join('path')
      .attr(
        'd',
        d =>
          `M${d.source.y + boxWidth},${d.source.x}C${d.source.y + 1.25 * boxWidth},${d.source.x} ${d.source.y + boxWidth},${d.target.x} ${d.target.y},${d.target.x}`
      );

    const nodes = graph
      .append('g')
      .selectAll('g')
      .data(treeRoot.descendants())
      .join('g')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .on('click', (_event, d) => hierarchyBoxOnClickDecorator(d.depth, d.data));

    nodes
      .append('rect')
      .attr(
        'fill',
        d =>
          hierarchyBoxColorLegend[hierarchyBoxColorDecorator(d.depth, d.data)]
            ?.color ?? '#2f89a8'
      )
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('x', 0)
      .attr('y', -boxHeight / 2)
      .attr('width', boxWidth)
      .attr('height', boxHeight);

    nodes
      .append('foreignObject')
      .attr('x', boxTextPadding)
      .attr('y', -boxHeight / 2 + boxTextPadding)
      .attr('width', boxWidth - 2 * boxTextPadding)
      .attr('height', boxHeight - 2 * boxTextPadding)
      .append('xhtml:div')
      .style('overflow', 'auto')
      .style('height', '100%')
      .html(d => hierarchyBoxInnerHtmlDecorator(d.depth, d.data));

    if (hierarchyShowLevel) {
      nodes
        .filter(d => d.depth > 0)
        .append('foreignObject')
        .attr('x', -boxHorizontalPadding)
        .attr('y', -15)
        .attr('width', boxHorizontalPadding - boxTextPadding)
        .attr('height', 15)
        .append('xhtml:div')
        .style('text-align', 'right')
        .text(d => `Level #${d.depth}`);
    }
  }, [
    hierarchyBoxColorDecorator,
    hierarchyBoxColorLegend,
    hierarchyBoxInnerHtmlDecorator,
    hierarchyBoxOnClickDecorator,
    hierarchyShowLevel,
    source,
    type,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent>
        {source === undefined ? (
          <p>No data...</p>
        ) : (
          <div ref={hostRef} className="orgcheck-graph overflow-auto" />
        )}
      </CardContent>
      {source !== undefined && type === 'hierarchy' ? (
        <CardFooter className="flex flex-wrap gap-4">
          {legend.map(item => (
            <span key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block size-4 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </span>
          ))}
        </CardFooter>
      ) : null}
    </Card>
  );
}

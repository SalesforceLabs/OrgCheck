import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckGraphics extends LightningElement {

  #apiInitialized = false;
  #api;

  renderedCallback() {
    if (this.#apiInitialized === true) {
      return;
    }
    loadScript(this, OrgCheckStaticRessource + '/js/d3.js')
      .then(() => {
        this.#apiInitialized = true;
        // eslint-disable-next-line no-undef
        this.#api = d3; 
        if (this.name !== undefined && this.dependencies !== undefined) {
          this.drawDependencies();
        } else {
          console.error('Nothing to render');
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  /** 
   * {string} Name of the entity we want to analyze the dependencies
   */
  @api name;

  /**
   * {Any} Dependencies representation
   */
  @api dependencies;

  /**
   * Draw the dependency graph
   */
  drawDependencies() {

    // Some constants
    const BOX_HEIGHT = 40;
    const BOX_WIDTH = 200;
    const BOX_TEXT_PADDING = 3;
    const BOX_VERTICAL_PADDING = 5;
    const BOX_HORIZONTAL_PADDING = 50;
    const FONT_FAMILY = 'Salesforce Sans,Arial,sans-serif';
    const FONT_SIZE = 10;
    const BOX_BGCOLOR = (d) => {
      switch (d?.depth) {
        case 0: return '#2f89a8';
        case 1: return '#3fb9b8';
        case 2: return '#4fb9c8';
        default: return '#5fc9f8';
      }
    }
    const EDGE_BGCOLOR = '#2f89a8';
    const ESCAPE_DATA = (unsafe) => {
      if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
      if (typeof(unsafe) !== 'string') return unsafe;
      return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
  } ;
    const BOX_INNERHTML = (d) => {
      switch (d.depth) {
        case 0: return `<center><b>${ESCAPE_DATA(d.data.label)}</b></center>`;
        case 3: return `<a href="/${d.data.id}" target="_blank"><b>${ESCAPE_DATA(d.data.label)}</b></a>`;
        default: return `<center>${ESCAPE_DATA(d.data.label)}<br /><code><small>${d.children?.length || 0} ${d.children?.length > 1 ? "items": "item"}</small></code></center>`;
      }
    }

    // Hierarchical view of the data
    const data = { 
      label: this.name,
      children: [ 
          { id: 'referenced', label: 'Where is it referenced?', children: [] }, 
          { id: 'using', label: 'What is it using?', children: [] } 
      ]
    };
    const existingTypeNodes = {};
    data.children.forEach(c => {
      this.dependencies[c.id].forEach(d => {
        const typeId = `${c}/${d.type}`;
        if (existingTypeNodes[typeId] === undefined) {
            c.children.push(
              existingTypeNodes[typeId] = 
                { label: d.type, children: [] }
            );
        }
        existingTypeNodes[typeId].children.push(
          { id: `${d.id}`, label: `${d.name}` }
        );
      })
    });
      
    // Gives an idea of how big the tree will be
    const root = this.#api.hierarchy(data);
    let mdepth = 0;
    root.each(d => { if (mdepth < d.depth) mdepth = d.depth });
    root.dx = BOX_HEIGHT + BOX_VERTICAL_PADDING;
    root.dy = BOX_WIDTH + BOX_HORIZONTAL_PADDING;
    const WIDTH = BOX_WIDTH * (mdepth+1) + BOX_HORIZONTAL_PADDING * mdepth;

    // Generate tree
    this.#api.tree().nodeSize([root.dx, root.dy])(root);

    // Define x0 and x1
    let x0 = Infinity;
    let x1 = -x0;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    // Construction of graph
    const graph = this.#api.select(this.template.querySelector('.orgcheck-graph'))
      .append('svg')
      .attr('viewBox', [-75, 0, WIDTH, x1 - x0 + root.dx * 2])
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .append('g')
      .attr('font-family', FONT_FAMILY)
      .attr('font-size', FONT_SIZE)
      .attr('transform', `translate(${root.dy / 2 - BOX_WIDTH},${root.dx - x0})`);

    // Generate NODES
    const nodes = graph.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', function(d) { return `translate(${d.y},${d.x})`; });

    nodes.append('rect')
      .attr('fill', BOX_BGCOLOR)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('x', 0)
      .attr('y', - BOX_HEIGHT / 2)
      .attr('width', BOX_WIDTH)
      .attr('height', BOX_HEIGHT);

    nodes.append('foreignObject')
      .attr('class', 'slds-scrollable')
      .attr('x', BOX_TEXT_PADDING)
      .attr('y', - BOX_HEIGHT / 2 + BOX_TEXT_PADDING)
      .attr('width', (d) => BOX_WIDTH - 2 * BOX_TEXT_PADDING)
      .attr('height', BOX_HEIGHT - 2 * BOX_TEXT_PADDING)
      .append('xhtml').html(BOX_INNERHTML);
      
    // Generate EDGES
    graph.append('g')
      .attr('fill', 'none')
      .attr('stroke', EDGE_BGCOLOR)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2.0)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', (d) => { 
        return `M${d.source.y + BOX_WIDTH},${d.source.x}` +
                `C${d.source.y + 1.25*BOX_WIDTH},${d.source.x}` +
                ` ${d.source.y + 1.0*BOX_WIDTH},${d.target.x}` +
                ` ${d.target.y},${d.target.x}`
      });
  }
}
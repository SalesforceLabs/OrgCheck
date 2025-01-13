import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from "@salesforce/resourceUrl/OrgCheck_SR";
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckGraphics extends LightningElement {

  #apiInitialized = false;
  #api;
  #data;

  /**
   * Called when it's about to render the component
   */
  renderedCallback() {
    
    // Load only if the api is not already initilized
    if (this.#apiInitialized === false) {
      loadScript(this, OrgCheckStaticRessource + '/js/d3.js')
        .then(() => {
          this.#apiInitialized = true;
          // @ts-ignore
          this.#api = d3; 

          // draw graph now
          this.drawGraph();
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  /**
   * Set the data used in the graphic
   * 
   * @param {any} data
   */
  @api set source(data) {
    this.#data = data;
    this.drawGraph();
  }

  /**
   * Get the data used in the graphic
   */
  get source() {
    return this.#data;
  }

  @api boxHeight = 40;
  @api boxWidth = 200;
  @api boxTextPadding = 3;
  @api boxVerticalPadding = 5;
  @api boxHorizontalPadding = 50;
  @api boxColorDecorator = (depth, data) => { console.debug(depth, data); return 'red'; };
  @api boxInnerHtmlDecorator = (depth, data) => { console.debug(depth, data); return ''; };
  @api boxOnClickDecorator = (depth, data) => { console.debug(depth, data); };
  @api edgeColor = '#2f89a8';
  @api fontFamily = 'Salesforce Sans,Arial,sans-serif';
  @api fontSize = 10;
  @api showLevel = false;

  /**
   * Draw the dependency graph
   */
  drawGraph() {

    // If API not loaded yet, then just skip!
    if (this.#apiInitialized === false) {
      console.error('drawGraph was called but the api is not yet loaded!');
      return;
    }

    // If no data to show, then just skip!
    if (this.#data === undefined) {
      console.error('drawGraph was called but, the api has been loaded but there is no data set yet!');
      return;
    }
 
    // Gives an idea of how big the tree will be
    const root = this.#api.hierarchy(this.#data);
    let mdepth = 0;
    root.each(d => { if (mdepth < d.depth) mdepth = d.depth });
    root.dx = this.boxHeight + this.boxVerticalPadding;
    root.dy = this.boxWidth + this.boxHorizontalPadding;
    const WIDTH = this.boxWidth * (mdepth+1) + this.boxHorizontalPadding * mdepth;

    // Generate tree
    this.#api.tree().nodeSize([root.dx, root.dy])(root);

    // Define x0 and x1
    let x0 = Infinity;
    let x1 = -Infinity;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    // Get the main tag 
    const mainTag = this.template.querySelector('.orgcheck-graph');

    // Clean previous graph if needed
    this.#api.select(mainTag).selectAll('*').remove();
    
    // Construction of graph
    const graph = this.#api.select(mainTag)
      .append('svg')
      .attr('viewBox', [-75, 0, WIDTH, x1 - x0 + root.dx * 2])
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .append('g')
      .attr('font-family', this.fontFamily)
      .attr('font-size', this.fontSize)
      .attr('transform', `translate(${root.dy / 2 - this.boxWidth},${root.dx - x0})`);

    // Generate NODES with global click handler
    const nodes = graph.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .on('click', (event) => { const d = event.currentTarget.__data__; this.boxOnClickDecorator(d.depth, d.data); });

    // Add a colored square for each node
    nodes.append('rect')
      .attr('fill', (d) => this.boxColorDecorator(d.depth, d.data))
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('x', 0)
      .attr('y', - this.boxHeight / 2)
      .attr('width', this.boxWidth)
      .attr('height', this.boxHeight);

    // Add the content (in HTML) for each node
    nodes.append('foreignObject')
      .attr('class', 'slds-scrollable')
      .attr('x', this.boxTextPadding)
      .attr('y', - this.boxHeight / 2 + this.boxTextPadding)
      .attr('width', () => this.boxWidth - 2 * this.boxTextPadding)
      .attr('height', this.boxHeight - 2 * this.boxTextPadding)
      .append('xhtml').html((d) => this.boxInnerHtmlDecorator(d.depth, d.data));

    // Generate EDGES
    graph.append('g')
      .attr('fill', 'none')
      .attr('stroke', this.edgeColor)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2.0)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', (d) => `M${d.source.y + this.boxWidth},${d.source.x}` +
                        `C${d.source.y + 1.25*this.boxWidth},${d.source.x}` +
                        ` ${d.source.y + 1.0*this.boxWidth},${d.target.x}` +
                        ` ${d.target.y},${d.target.x}`);

    if (this.showLevel === true) {
      // Add the level of each node
      nodes.filter((d) => d.depth > 0)
        .append('foreignObject')
        .attr('x', -this.boxHorizontalPadding)
        .attr('y', -15)
        .attr('width', this.boxHorizontalPadding - this.boxTextPadding)
        .attr('height', 15)
        .append('xhtml').html((d) => `<div style="text-align: right;">Level #${d.depth}</div>`);
    } 
  }
}
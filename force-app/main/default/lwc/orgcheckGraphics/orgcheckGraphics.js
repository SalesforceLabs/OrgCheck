import { LightningElement, api } from 'lwc';
import OrgCheckStaticRessource from '@salesforce/resourceUrl/OrgCheck_SR';
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

  get containerClass() {
    return `${this.isInline ? 'inline' : 'slds-var-m-around_medium'} orgcheck-graph`;
  }

  @api name;
  @api type;
  @api isInline = false;
  @api fontFamily = 'Salesforce Sans,Arial,sans-serif';
  @api fontSize = 10;

  @api hierarchyBoxHeight = 40;
  @api hierarchyBoxWidth = 200;
  @api hierarchyBoxTextPadding = 3;
  @api hierarchyBoxVerticalPadding = 5;
  @api hierarchyBoxHorizontalPadding = 50;
  @api hierarchyBoxColorDecorator = (depth, data) => { console.debug(depth, data); return 'red'; };
  @api hierarchyBoxInnerHtmlDecorator = (depth, data) => { console.debug(depth, data); return ''; };
  @api hierarchyBoxOnClickDecorator = (depth, data) => { console.debug(depth, data); };
  @api hierarchyEdgeColor = '#2f89a8';
  @api hierarchyShowLevel = false;

  @api pieSize = 30;
  @api pieStrokeWidth = 1;
//  @api pieCategoriesAggregateDecorator = ()
  get isPie() {
    return this.type === 'pie';
  }
  getPieCategories() {
    return this.#data;
  }
  
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
      console.error('drawGraph was called but, the api has been loaded BUT there is no data set yet!');
      return;
    }
 
    switch (this.type) {
      case 'hierarchy':  this._drawHierarchy(); break;
      case 'pie':        this._drawPie();       break;
      default:           console.error('drawGraph was called but, the api has been loaded, there is data, BUT there is no type set!');
    }
  }

  _drawHierarchy() {
    // Gives an idea of how big the tree will be
    const root = this.#api.hierarchy(this.#data);
    let mdepth = 0;
    root.each(d => { if (mdepth < d.depth) mdepth = d.depth });
    root.dx = this.hierarchyBoxHeight + this.hierarchyBoxVerticalPadding;
    root.dy = this.hierarchyBoxWidth + this.hierarchyBoxHorizontalPadding;
    const WIDTH = this.hierarchyBoxWidth * (mdepth+1) + this.hierarchyBoxHorizontalPadding * mdepth;

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
    const mainTag = this.#api.select(this.template.querySelector('.orgcheck-graph'));

    // Clean previous graph if needed
    mainTag.selectAll('*').remove();
    
    // Construction of graph
    const graph = mainTag
      .append('svg')
      .attr('viewBox', [-75, 0, WIDTH, x1 - x0 + root.dx * 2])
      .attr('xmlns', 'http://www.w3.org/2000/svg')
      .append('g')
      .attr('font-family', this.fontFamily)
      .attr('font-size', this.fontSize)
      .attr('transform', `translate(${root.dy / 2 - this.hierarchyBoxWidth},${root.dx - x0})`);

    // Generate NODES with global click handler
    const nodes = graph.append('g')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-width', 3)
      .selectAll('g')
      .data(root.descendants())
      .join('g')
      .attr('transform', (d) => `translate(${d.y},${d.x})`)
      .on('click', (event) => { const d = event.currentTarget.__data__; this.hierarchyBoxOnClickDecorator(d.depth, d.data); });

    // Add a colored square for each node
    nodes.append('rect')
      .attr('fill', (d) => this.hierarchyBoxColorDecorator(d.depth, d.data))
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('x', 0)
      .attr('y', - this.hierarchyBoxHeight / 2)
      .attr('width', this.hierarchyBoxWidth)
      .attr('height', this.hierarchyBoxHeight);

    // Add the content (in HTML) for each node
    nodes.append('foreignObject')
      .attr('class', 'slds-scrollable')
      .attr('x', this.hierarchyBoxTextPadding)
      .attr('y', - this.hierarchyBoxHeight / 2 + this.hierarchyBoxTextPadding)
      .attr('width', () => this.hierarchyBoxWidth - 2 * this.hierarchyBoxTextPadding)
      .attr('height', this.hierarchyBoxHeight - 2 * this.hierarchyBoxTextPadding)
      .append('xhtml').html((d) => this.hierarchyBoxInnerHtmlDecorator(d.depth, d.data));

    // Generate EDGES
    graph.append('g')
      .attr('fill', 'none')
      .attr('stroke', this.hierarchyEdgeColor)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 2.0)
      .selectAll('path')
      .data(root.links())
      .join('path')
      .attr('d', (d) => `M${d.source.y + this.hierarchyBoxWidth},${d.source.x}` +
                        `C${d.source.y + 1.25*this.hierarchyBoxWidth},${d.source.x}` +
                        ` ${d.source.y + 1.0*this.hierarchyBoxWidth},${d.target.x}` +
                        ` ${d.target.y},${d.target.x}`);

    if (this.hierarchyShowLevel === true) {
      // Add the level of each node
      nodes.filter((d) => d.depth > 0)
        .append('foreignObject')
        .attr('x', -this.hierarchyBoxHorizontalPadding)
        .attr('y', -15)
        .attr('width', this.hierarchyBoxHorizontalPadding - this.hierarchyBoxTextPadding)
        .attr('height', 15)
        .append('xhtml').html((d) => `<div style="text-align: right;">Level #${d.depth}</div>`);
    } 
  }

  _drawPie() {
    const values = this.#data.map((d) => d.value);
    const colors = this.#data.map((d) => d.color);
    const radius = this.pieSize / 2;

    // Get the main tag 
    const mainTag = this.#api.select(this.template.querySelector('.orgcheck-graph'));

    // Clean previous graph if needed
    mainTag.selectAll('*').remove();
    
    const arc = this.#api.arc()
      .innerRadius(radius / 2)
      .outerRadius(radius)
      .cornerRadius(8)
      .padAngle(0.06);

    const svg = mainTag
      .append('svg')
      .attr('width', this.pieSize)
      .attr('height', this.pieSize)
      .attr('viewBox', [
        0, 
        -this.pieSize/2 - this.pieStrokeWidth, 
        this.pieSize/2 + this.pieStrokeWidth, 
        this.pieSize + 2*this.pieStrokeWidth
      ]);

    const g = svg.selectAll('g')
      .data(() => [this.#api.pie()(values)])
      .join('g')
      .attr('transform', (d, i) => `translate(${this.pieSize / 2 * (i + 0.5)})`);

    g.append('g')
      .attr('stroke', '#000')
      .attr('stroke-width', `${this.pieStrokeWidth}px`)
      .attr('stroke-linejoin', 'round')
      .selectAll('path')
      .data(arcs => arcs)
      .join('path')
      .attr('fill', (d, i) => colors[i])
      .attr('d', arc);
  }
}
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
    this.hasNoData = data === undefined ;
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
  @api hierarchyBoxColorLegend = [];
  @api hierarchyBoxColorDecorator = (depth, data) => { console.debug('hierarchyBoxColorDecorator', depth, data); return 0; };
  @api hierarchyBoxInnerHtmlDecorator = (depth, data) => { console.debug('hierarchyBoxInnerHtmlDecorator', depth, data); return ''; };
  @api hierarchyBoxOnClickDecorator = (depth, data) => { console.debug('hierarchyBoxOnClickDecorator', depth, data); };
  @api hierarchyEdgeColor = '#2f89a8';
  @api hierarchyShowLevel = false;

  @api pieSize = 30;
  @api pieStrokeWidth = 1;
  @api pieCategoriesDecorator = (data) => { console.debug('pieCategoriesDecorator', data); return []; };

  pieCategories;
  pieTotal;
  hierarchyLegend;
  hasNoData = true;

  get isPie() {
    return this.type === 'pie';
  }

  get isHierarchy() {
    return this.type === 'hierarchy';
  }

  /**
   * Draw the dependency graph
   */
  drawGraph() {

    // If API not loaded yet, then just skip!
    if (this.#apiInitialized === false) {
      return;
    }

    // If no data to show, then just skip!
    if (this.#data === undefined) {
      return;
    }
 
    switch (this.type) {
      case 'hierarchy':  this._drawHierarchy(); break;
      case 'pie':        this._drawPie();       break;
      default:           console.error(`Unsupported type=${this.type}`);
    }
  }

  _drawHierarchy() {
    // If specified from the parent component (via @api), these properties will be typed as string! 
    // Making sure it is considered as a number whatever the case
    const boxHeight = this.hierarchyBoxHeight/1; 
    const boxWidth = this.hierarchyBoxWidth/1;
    const boxVerticalPadding = this.hierarchyBoxVerticalPadding/1;
    const boxHorizontalPadding = this.hierarchyBoxHorizontalPadding/1;
    const boxTextPadding = this.hierarchyBoxTextPadding/1;

    // add the css style to the legend
    this.hierarchyLegend = this.hierarchyBoxColorLegend.map((c) => {
      return {
        name: c.name,
        color: c.color,
        cssStyle: `background-color: ${c.color}`
      };
    });

    // Gives an idea of how big the tree will be
    const root = this.#api.hierarchy(this.#data);
    let mdepth = 0;
    root.each(d => { if (mdepth < d.depth) mdepth = d.depth });
    root.dx = boxHeight + boxVerticalPadding;
    root.dy = boxWidth + boxHorizontalPadding;
    const WIDTH = boxWidth * (mdepth+1) + boxHorizontalPadding * mdepth;

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
      .attr('transform', `translate(${root.dy / 2 - boxWidth},${root.dx - x0})`);

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
      .attr('fill', (d) => this.hierarchyBoxColorLegend[this.hierarchyBoxColorDecorator(d.depth, d.data)]?.color)
      .attr('rx', 6)
      .attr('ry', 6)
      .attr('x', 0)
      .attr('y', - boxHeight / 2)
      .attr('width', boxWidth)
      .attr('height', boxHeight);

    // Add the content (in HTML) for each node
    nodes.append('foreignObject')
      .attr('class', 'slds-scrollable')
      .attr('x', boxTextPadding)
      .attr('y', - boxHeight / 2 + boxTextPadding)
      .attr('width', () => boxWidth - 2 * boxTextPadding)
      .attr('height', boxHeight - 2 * boxTextPadding)
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
      .attr('d', (d) => `M${d.source.y + boxWidth},${d.source.x}` +
                        `C${d.source.y + 1.25*boxWidth},${d.source.x}` +
                        ` ${d.source.y + 1.0*boxWidth},${d.target.x}` +
                        ` ${d.target.y},${d.target.x}`);

    if (this.hierarchyShowLevel === true) {
      // Add the level of each node
      nodes.filter((d) => d.depth > 0)
        .append('foreignObject')
        .attr('x', -boxHorizontalPadding)
        .attr('y', -15)
        .attr('width', boxHorizontalPadding - boxTextPadding)
        .attr('height', 15)
        .append('xhtml').html((d) => `<div style="text-align: right;">Level #${d.depth}</div>`);
    }
  }

  _drawPie() {
    this.pieTotal = 0;
    this.pieCategories = this.pieCategoriesDecorator(this.#data).map((c) => { 
      this.pieTotal += c.value;
      return { 
        name: c.name,
        value: c.value,
        color: c.color,
        cssStyle: `background-color: ${c.color}`
      }; 
    });
    const values = this.pieCategories.map((d) => d.value);
    const colors = this.pieCategories.map((d) => d.color);
    const diameter = this.pieSize / 1; // if size is specified its type will be string! making sure it is considered as a number whatever the case
    const radius = diameter / 2;
    const stroke = this.pieStrokeWidth/1; // same for stroke!

    // Get the main tag 
    const mainTag = this.#api.select(this.template.querySelector('.orgcheck-graph'));

    // Clean previous graph if needed
    mainTag.selectAll('*').remove();
    
    // Draw the pie
    mainTag
      .append('svg')
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('viewBox', [ 0, -radius-stroke, stroke, diameter+2*stroke ])
      .selectAll('g')
      .data(() => [this.#api.pie()(values)])
      .join('g')
      .append('g')
      .attr('stroke', '#000')
      .attr('stroke-width', `${stroke}px`)
      .attr('stroke-linejoin', 'round')
      .selectAll('path')
      .data(arcs => arcs)
      .join('path')
      .attr('fill', (d, i) => colors[i])
      .attr('d', this.#api.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius)
        .cornerRadius(8)
        .padAngle(0.06)
      );
  }
}
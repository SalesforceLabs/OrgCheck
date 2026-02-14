import { LightningElement, api } from 'lwc';
import OrgCheckStaticResource from '@salesforce/resourceUrl/OrgCheck_SR';
// @ts-ignore
import { loadScript } from 'lightning/platformResourceLoader';

export default class OrgcheckGraphics extends LightningElement {

  /**
   * @description Flag to know if the api was intiated
   * @type {boolean}
   * @private
   */ 
  _apiInitialized = false;

  /**
   * @description Excel API used to generate documents
   * @type {any}
   * @private
   */ 
  _api;

  /**
   * @description Data to use to render the graphic
   * @type {any}
   * @private
   */
  _data;

  /**
   * @description Called when it's about to render the component
   * @public
   */
  renderedCallback() {
    
    // Load only if the api is not already initilized
    if (this._apiInitialized === false) {
      loadScript(this, OrgCheckStaticResource + '/js/d3.js')
        .then(() => {
          this._apiInitialized = true;
          // @ts-ignore
          this._api = typeof window !== 'undefined' ? window?.d3 : globalThis?.d3 ?? null;
          // draw graph now
          this._drawGraph();
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }

  /**
   * @description Set the data used in the graphic
   * @param {any} data - Data to use to render the graphic
   * @public
   */
  @api set source(data) {
    this._data = data;
    this.hasNoData = data === undefined ;
    this._drawGraph();
  }

  /**
   * @description Get the data used in the graphic
   * @returns {any} Data used to render the graphic
   * @public
   */
  get source() {
    return this._data;
  }

  /**
   * @description Is the graphics takes the whole horizontal space or not
   * @type {boolean}
   */ 
  @api isInline = false;

  /**
   * @description Container class dependends on the isInline property
   * @type {string}
   * @public
   */ 
  get containerClass() {
    return `${this.isInline ? 'inline' : 'slds-var-m-around_medium'} orgcheck-graph`;
  }

  /**
   * @description Name of the graphic
   * @type {string}
   * @public
   */
  @api name;

  /**
   * @description Type of the graphic can be 'pie' or 'hierarchy'
   * @type {string}
   * @public
   */
  @api type;

  /**
   * @description Returns true if the type is "pie"
   * @returns {boolean} Is it a PIE?
   * @public
   */
  get isPie() {
    return this.type === 'pie';
  }

  /**
   * @description Returns true if the type is "hierarchy"
   * @returns {boolean} Is it a HIERARCHY?
   * @public
   */
  get isHierarchy() {
    return this.type === 'hierarchy';
  }

  /**
   * @description Font to use
   * @type {string}
   * @public
   */
  @api fontFamily = 'Salesforce Sans,Arial,sans-serif';

  /**
   * @description Font size to use
   * @type {string}
   * @public
   */
  @api fontSize = '10';

  /**
   * @description Box height in pixel (in case the graphic is a hierarchical one)
   * @type {string}
   * @public
   */
  @api hierarchyBoxHeight = '40';

  /**
   * @description Box width in pixel (in case the graphic is a hierarchical one)
   * @type {string}
   * @public
   */
  @api hierarchyBoxWidth = '200';

  /**
   * @description Box text padding in pixel (in case the graphic is a hierarchical one)
   * @type {string}
   * @public
   */
  @api hierarchyBoxTextPadding = '3';

  /**
   * @description Box vertical padding in pixel (in case the graphic is a hierarchical one)
   * @type {string}
   * @public
   */
  @api hierarchyBoxVerticalPadding = '5';

  /**
   * @description Box horizontal padding in pixel (in case the graphic is a hierarchical one)
   * @type {string}
   * @public
   */
  @api hierarchyBoxHorizontalPadding = '50';

  /**
   * @description List of color to use in the legend (in case the graphic is a hierarchical one)
   * @type {Array<{name: string, color: string}>}
   * @public
   */
  @api hierarchyBoxColorLegend = [];

  /**
   * @description Decorator function to get the color of the boxes depending on the depth in the hierarchy and data of the node (in case the graphic is a hierarchical one)
   * @type {Function}
   * @public
   */
  @api hierarchyBoxColorDecorator = (depth, data) => { console.debug('hierarchyBoxColorDecorator', depth, data); return 0; };

  /**
   * @description Decorator function to get the inner HTML content of the boxes depending on the depth in the hierarchy and data of the node (in case the graphic is a hierarchical one)
   * @type {Function}
   * @public
   */
  @api hierarchyBoxInnerHtmlDecorator = (depth, data) => { console.debug('hierarchyBoxInnerHtmlDecorator', depth, data); return ''; };

  /**
   * @description Decorator function to get the onclick function depending on the depth in the hierarchy and data of the node (in case the graphic is a hierarchical one)
   * @type {Function}
   * @public
   */
  @api hierarchyBoxOnClickDecorator = (depth, data) => { console.debug('hierarchyBoxOnClickDecorator', depth, data); };

  /**
   * @description Color of the edges (in case the graphic is a hierarchical one)
   * @type {string}
   * @public
   */
  @api hierarchyEdgeColor = '#2f89a8';

  /**
   * @description Do we show the level of the hierarchy (in case the graphic is a hierarchical one)
   * @type {boolean}
   * @public
   */
  @api hierarchyShowLevel = false;

  /**
   * @description Size of the pie in pixel (in case the graphic is a pie one)
   * @type {string}
   * @public
   */
  @api pieSize = '30';

  /**
   * @description Size of the surrounding stroke around the pie in pixel (in case the graphic is a pie one)
   * @type {string}
   * @public
   */
  @api pieStrokeWidth = '1';

  /**
   * @description Decorator function to get the categories depending on the data (in case the graphic is a pie one) and the optional filter
   * @type {Function}
   * @public
   */
  @api pieCategoriesDecorator = (data, filter) => { console.debug('pieCategoriesDecorator', data, filter); return []; };

  /**
   * @description Pie categories to use in legend
   * @type {Array<{name: string, value: number, color: string, cssStyle: string}>}
   * @public
   */
  pieCategories = [];

  /**
   * @description Pie total
   * @type {number}
   * @public
   */
  pieTotal;

  /**
   * @description Hierarchy legends to use
   * @type {Array<{name: string, color: string, cssStyle: string}>}
   * @public
   */
  hierarchyLegend = [];

  /**
   * @description Does this graphic have data?
   * @type {boolean}
   * @public
   */
  hasNoData = true;

  /**
   * @description Draw the graph
   * @private
   */
  _drawGraph() {

    // If API not loaded yet, then just skip!
    if (this._apiInitialized === false) {
      return;
    }

    // If no data to show, then just skip!
    if (this._data === undefined) {
      return;
    }
 
    switch (this.type) {
      case 'hierarchy':  this._drawHierarchy(); break;
      case 'pie':        this._drawPie();       break;
      default:           console.error(`Unsupported type=${this.type}`);
    }
  }

  /**
   * @description Draw the graph as a hierarchy one
   * @private
   */
  _drawHierarchy() {
    // If specified from the parent component (via @api), these properties will be typed as string! 
    // Making sure it is considered as a number whatever the case
    const boxHeight = Number.parseInt(this.hierarchyBoxHeight, 10); 
    const boxWidth = Number.parseInt(this.hierarchyBoxWidth, 10);
    const boxVerticalPadding = Number.parseInt(this.hierarchyBoxVerticalPadding, 10);
    const boxHorizontalPadding = Number.parseInt(this.hierarchyBoxHorizontalPadding, 10);
    const boxTextPadding = Number.parseInt(this.hierarchyBoxTextPadding, 10);

    // add the css style to the legend
    this.hierarchyLegend = this.hierarchyBoxColorLegend.map((c) => {
      return {
        name: c.name,
        color: c.color,
        cssStyle: `background-color: ${c.color}`
      };
    });

    // Gives an idea of how big the tree will be
    const root = this._api.hierarchy(this._data);
    let mdepth = 0;
    root.each(d => { if (mdepth < d.depth) mdepth = d.depth });
    root.dx = boxHeight + boxVerticalPadding;
    root.dy = boxWidth + boxHorizontalPadding;
    const WIDTH = boxWidth * (mdepth+1) + boxHorizontalPadding * mdepth;

    // Generate tree
    this._api.tree().nodeSize([root.dx, root.dy])(root);

    // Define x0 and x1
    let x0 = Infinity;
    let x1 = -Infinity;
    root.each(d => {
        if (d.x > x1) x1 = d.x;
        if (d.x < x0) x0 = d.x;
    });

    // Get the main tag 
    const mainTag = this._api.select(this.template.querySelector('.orgcheck-graph'));

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

  /**
   * @description Draw the graph as a pie one
   * @private
   */
  _drawPie() {
    this.pieTotal = 0;
    this.pieCategories = this._data.map((c) => { 
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
    const diameter = Number.parseInt(this.pieSize, 10); // if size is specified its type will be string! making sure it is considered as a number whatever the case
    const radius = diameter / 2;
    const stroke = Number.parseInt(this.pieStrokeWidth, 10); // same for stroke!

    // Get the main tag 
    const mainTag = this._api.select(this.template.querySelector('.orgcheck-graph'));

    // Clean previous graph if needed
    mainTag.selectAll('*').remove();
    
    // Draw the pie
    mainTag
      .append('svg')
      .attr('width', diameter)
      .attr('height', diameter)
      .attr('viewBox', [ 0, -radius-stroke, stroke, diameter+2*stroke ])
      .selectAll('g')
      .data(() => [this._api.pie()(values)])
      .join('g')
      .append('g')
      .attr('stroke', '#000')
      .attr('stroke-width', `${stroke}px`)
      .attr('stroke-linejoin', 'round')
      .selectAll('path')
      .data(arcs => arcs)
      .join('path')
      .attr('fill', (d, i) => colors[i])
      .attr('d', this._api.arc()
        .innerRadius(radius / 2)
        .outerRadius(radius)
        .cornerRadius(8)
        .padAngle(0.06)
      );
  }
}
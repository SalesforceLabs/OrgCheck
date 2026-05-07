import { LightningElement, api } from 'lwc';

const ESCAPE_DATA = (unsafe) => {
    if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
    if (typeof(unsafe) !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }
  
export default class OrgcheckDependencyViewer extends LightningElement {

    _isShown = false;

    /**
     * @description Register the Escape key handler when the component is mounted.
     */
    connectedCallback() {
        this._boundHandleWindowKeyDown = this._handleWindowKeyDown.bind(this);
        window.addEventListener('keydown', this._boundHandleWindowKeyDown);
    }

    /**
     * @description Cleanup the Escape key handler when the component is unmounted.
     */
    disconnectedCallback() {
        window.removeEventListener('keydown', this._boundHandleWindowKeyDown);
    }

    /**
     * @description CSS Classes for the main dialog dependengin on the _isOpened property
     * @type {string}
     * @public
     */
    get dialogCssClasses() {
        return `slds-modal slds-fade-in-open slds-modal_medium ${this._isShown ? '' : 'slds-hide'}`;
    }

    /**
     * @description CSS Classes for the backdrop dependengin on the _isOpened property
     * @type {string}
     * @public
     */ 
    get backdropCssClasses() {
        return `slds-backdrop ${this._isShown ? 'slds-backdrop_open' : 'slds-backdrop_close'}`;
    }

    /**
     * @description The Salesforce ID of the item
     * @type {string}
     * @public
     */ 
    whatId;

    /**
     * @description The Salesforce ID of the item
     * @type {string}
     * @public
     */ 
    whatName;

    /** 
     * @description Hierarchical view of the dependency data
     * @type {{label: string, children: {id: string, label: string, children: Array<{label: string, children: Array<{id: string, label: string, url: string}>}>}}[]}
     */
    dependencyTreeByType;

    /** 
     * @description Set the legend (color and label) for the dependency graphical view
     * @type {{color: string, name: string}[]}
     * @public
     */ 
    dependencyBoxColorsLegend = [
        { color: '#2f89a8', name: 'Root' },
        { color: '#3fb9b8', name: '1st level' },
        { color: '#4fb9c8', name: '2nd level' },
        { color: '#5fc9f8', name: '3rd+ level' }
    ];

    /**
     * @description Returns the index of the legend from a specific depth
     * @see dependencyBoxColorsLegend
     * @param {number} depth - the depth of the box
     * @returns {number} Index of the legend
     * @public
     */ 
    dependencyBoxColorsDecorator = (depth) => {
        switch (depth) {
            case 0:  return 0; // root
            case 1:  return 1; // 1st level
            case 2:  return 2; // 2nd level
            case 3: 
            default: return 3; // 3rd+ level
        }
    };

    /**
     * @description Returns the HTML code for each box depending on its depth and data
     * @param {number} depth - the depth of the box
     * @param {object} data - the data of the box
     * @returns {string} HTML code for the box
     * @public
     */ 
    dependencyBoxInnerHtmlDecorator = (depth, data) => {
        switch (depth) {
            case 0: return `<center><b>${ESCAPE_DATA(data.label)}</b></center>`;
            case 3: {
                return `${data.url ? `<a href="${data.url}" target="_blank">`: ''}<b>${ESCAPE_DATA(data.label)}</b><br /><small><code>${data.id}</code></small>${data.url ? '</a>' : ''}`;
            }
            default: {
                const nbChildren = data.children?.length ?? 0;
                return `<center>${ESCAPE_DATA(data.label)}<br /><code><small>${nbChildren} ${nbChildren > 1 ? "items": "item"}</small></code></center>`;
            }
        }
    };

    /**
     * @description Set information about the item and its dependencies and then open the modal
     * @param {string} whatId - Salesforce ID of the item
     * @param {string} whatName - Name of the item
     * @param {object} dependencies - Data dependencies of the item
     * @public
     */ 
    @api open(whatId, whatName, dependencies) {

        // close the modal just in case
        this._isShown = false;

        // Set the information about the item ad its dependencies
        this.whatId = whatId;
        this.whatName = whatName;

        // Hierarchical view of the data by type
        this.dependencyTreeByType = { 
            label: whatName,
            children: [ 
                { id: 'referenced', label: 'Where is it referenced?', children: [] }, 
                { id: 'using', label: 'What is it using?', children: [] } 
            ]
        };
        const existingTypeNodes = {};
        this.dependencyTreeByType.children.forEach(c => {
            dependencies[c.id].forEach(d => {
                const typeId = `${c.id}/${d.type}`;
                if (existingTypeNodes[typeId] === undefined) {
                    c.children.push(existingTypeNodes[typeId] = { label: d.type, children: [] });
                }
                existingTypeNodes[typeId].children.push({ id: `${d.id}`, label: `${d.name}`, url: `${d.url}`});
            })
        });

        // Show the modal finally
        this._isShown = true;
    }

    /**
     * @description Close the modal when the user is clicking on the icon
     */ 
    handleClose() {
        this._isShown = false;
    }

    /**
     * @description Close the dependency viewer when the user presses Escape.
     * @param {KeyboardEvent} event - Keyboard event fired on the window
     * @private
     */
    _handleWindowKeyDown(event) {
        if (event.key === 'Escape' && this._isShown === true) {
            this.handleClose();
        }
    }

    /**
     * @description Bound keydown handler reference
     * @type {(event: KeyboardEvent) => void}
     * @private
     */
    _boundHandleWindowKeyDown;
}
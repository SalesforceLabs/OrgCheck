import { LightningElement, api } from 'lwc';
import * as ocapi from './libs/orgcheck-api.js';
import * as ocui from './libs/orgcheck-ui.js';

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
     * @description List of items that are using the item
     * @type {Array<ocapi.DataDependencyItem>}
     * @public
     */ 
    dependencyUsingData;

    /**
     * @description List of items that are used the item
     * @type {Array<ocapi.DataDependencyItem>}
     * @public
     */ 
    dependencyUsedData;

    /** 
     * @description Hierarchical view of the dependency data
     * @type {{label: string, children: Array<{id: string, label: string, children: Array<{label: string, children: Array<{id: string, label: string, url: string}>}>}>}}>}
     */
    dependencyTreeByType;

    /** 
     * @description Set the legend (color and label) for the dependency graphical view
     * @type {Array<{color: string, name: string}>}
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
     * @param {number} depth
     * @returns {number}
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
     * @param {number} depth
     * @param {any} data
     * @returns {string}
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
     * @description Table definition for the tabular view of dependencies
     * @type {ocui.Table}
     * @public
     */ 
    dependencyTableDefinition = {
        columns: [
            { label: '#',     type: ocui.ColumnType.IDX },
            { label: 'Name',  type: ocui.ColumnType.URL, data: { value: 'url', label: 'name' }},
            { label: 'Type',  type: ocui.ColumnType.TXT, data: { value: 'type' }}

        ],
        orderIndex: 1,
        orderSort: ocui.SortOrder.ASC
    };

    /**
     * @description Set information about the item and its dependencies and then open the modal
     * @param {string} whatId
     * @param {string} whatName
     * @param {ocapi.DataDependencies} dependencies
     */ 
    @api open(whatId, whatName, dependencies) {

        // close the modal just in case
        this._isShown = false;

        // Set the information about the item ad its dependencies
        this.whatId = whatId;
        this.whatName = whatName;
        this.dependencyUsingData = dependencies.using ?? [];
        this.dependencyUsedData = dependencies.referenced ?? [];

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
}
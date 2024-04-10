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

    isShown;
    whatId;
    whatName;
    dependencyData;
    dependencyTreeByType;
    dependencyBoxColorsDecorator = (depth) => {
        switch (depth) {
            case 0: return '#2f89a8'; break;
            case 1: return '#3fb9b8'; break;
            case 2: return '#4fb9c8'; break;
            case 3: return '#5fc9f8'; break;
        }
    };
    dependencyBoxInnerHtmlDecorator = (depth, data) => {
        switch (depth) {
            case 0: return `<center><b>${ESCAPE_DATA(data.label)}</b></center>`;
            case 3: {
                if (data.url) return `<a href="${data.url}" target="_blank"><b>${ESCAPE_DATA(data.label)}</b></a>`;
                return `<b>${ESCAPE_DATA(data.label)}</b>`;
            }
            default: {
                const nbChildren = data.children?.length ?? 0;
                return `<center>${ESCAPE_DATA(data.label)}<br /><code><small>${nbChildren} ${nbChildren > 1 ? "items": "item"}</small></code></center>`;
            }
        }
    };
    dependencyColumns = [
        { label: 'Name',  type: 'id',   data: { value: 'name', url: 'url' }, sorted: 'asc'},
        { label: 'Type',  type: 'text', data: { value: 'type' }}
    ];

    @api open(whatId, whatName, dependencies) {
        this.isShown = false;
        this.whatId = whatId;
        this.whatName = whatName;
        this.dependencyData = dependencies;

        // Hierarchical view of the data
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

        this.isShown = true;
    }

    handleClose() {
        this.isShown = false;
    }
}
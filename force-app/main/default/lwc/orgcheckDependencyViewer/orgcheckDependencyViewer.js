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
    whatid;
    whatname;
    dependencyData;
    dependencyTreeByType;
    dependencyBoxColorsDecorator = (d) => {
        switch (d?.depth) {
            case 0: return '#2f89a8'; break;
            case 1: return '#3fb9b8'; break;
            case 2: return '#4fb9c8'; break;
            case 3: return '#5fc9f8'; break;
        }
    };
    dependencyBoxInnerHtmlDecorator = (d) => {
        switch (d?.depth) {
            case 0: return `<center><b>${ESCAPE_DATA(d.data.label)}</b></center>`;
            case 3: {
                if (d.data.url) return `<a href="${d.data.url}" target="_blank"><b>${ESCAPE_DATA(d.data.label)}</b></a>`;
                return `<b>${ESCAPE_DATA(d.data.label)}</b>`;
            }
            default: return `<center>${ESCAPE_DATA(d.data.label)}<br /><code><small>${d.children?.length || 0} ${d.children?.length > 1 ? "items": "item"}</small></code></center>`;
        }
    };
    dependencyColumns = [
        { label: 'Name',  type: 'id',   data: { value: 'name', url: 'url' }, sorted: 'asc'},
        { label: 'Type',  type: 'text', data: { value: 'type' }}
    ];

    @api open(whatid, whatname, dependencies) {
        this.isShown = false;
        this.whatid = whatid;
        this.whatname = whatname;
        this.dependencyData = dependencies;

        // Hierarchical view of the data
        this.dependencyTreeByType = { 
            label: whatname,
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
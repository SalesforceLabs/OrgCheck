import { CellFactory } from "../../../src/ui/orgcheck-ui-table-cell";
import { ColumnType } from "../../../src/ui/orgcheck-ui-table-column";

describe('tests.api.unit.CellFactory', () => {

    describe('Test Cell Factory with only one index column type (see ColumnType.IDX)', () => {

        /** @type {TableColumn} */
        const column = { label: '#', type: ColumnType.IDX };

        /** @type {Array<any>} */
        const data = [ 
            { id: 'uyt' }, 
            { id: 'yuiii' }, 
            { id: 'tttttt' } 
        ];

        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBeUndefined();
                expect(row.typeofindex).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one score column type (see ColumnType.SCR)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Score', type: ColumnType.SCR, data: { value: 'score', id: 'id', name: 'label' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', label: 'Label III' }, 
            { score: undefined, id: 'jjj', label: 'Label JJJ' },
            { score: 2, id: 'kkk', label: 'Label KKK' }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].score);
                expect(row.data.id).toBe(data[i].id);
                expect(row.data.name).toBe(data[i].label);
                expect(row.typeofscore).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one url column type (see ColumnType.URL)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Name', type: ColumnType.URL, data: { value: 'url', label: 'name' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', url: '#.html' }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', url: undefined },
            { score: 2, id: 'kkk', name: undefined, url: '#.html' }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].url);
                expect(row.data.label).toBe(data[i].name);
                expect(row.typeofid).toBeTruthy();
            });
        });
    });
    
    describe('Test Cell Factory with only one numeric column type (see ColumnType.NUM)', () => {

        /** @type {TableColumn} */
        const column = { label: 'API Version', type: ColumnType.NUM, data: { value: 'apiVersion' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', apiVersion: 6 }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', apiVersion: undefined },
            { score: 2, id: 'kkk', name: 'Label KKK', apiVersion: '90' }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].apiVersion);
                expect(row.typeofnumeric).toBeTruthy();
            });
        });
    });
    
    describe('Test Cell Factory with only one text column type (see ColumnType.TXT)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Package', type: ColumnType.TXT, data: { value: 'package' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', package: undefined }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', package: '' },
            { score: 2, id: 'kkk', name: 'Label KKK', package: 'test' }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].package);
                expect(row.typeoftext).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one datatime column type (see ColumnType.DTM)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Created date', type: ColumnType.DTM, data: { value: 'createdDate' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', createdDate: undefined }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', createdDate: Date.now() },
            { score: 2, id: 'kkk', name: 'Label KKK', createdDate: Date.now()-100000 }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].createdDate);
                expect(row.typeofdatetime).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one dependencies column type (see ColumnType.DEP)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Dependencies',  type: ColumnType.DEP, data: { value: 'dependencies', id: 'id', name: 'name' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', dependencyData: {} }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', dependencyData: {} },
            { score: 2, id: 'kkk', name: 'Label KKK', dependencyData: {} }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].dependencies);
                expect(row.data.id).toBe(data[i].id);
                expect(row.data.name).toBe(data[i].name);
                expect(row.typeofdependencies).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one percentage column type (see ColumnType.PRC)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Used (%)', type: ColumnType.PRC, data: { value: 'usedPercentage' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', usedPercentage:  9.89 }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', usedPercentage: 87.01 },
            { score: 2, id: 'kkk', name: 'Label KKK', usedPercentage:  9.00 }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].usedPercentage);
                expect(row.typeofpercentage).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one boolean column type (see ColumnType.CHK)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Is Active', type: ColumnType.CHK, data: { value: 'isActive' }};
        
        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', isActive: false }, 
            { score: 1, id: 'jjj', name: 'Label JJJ', isActive: true },
            { score: 2, id: 'kkk', name: 'Label KKK', isActive: undefined }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.value).toBe(data[i].isActive);
                expect(row.typeofboolean).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one objects column type (see ColumnType.OBJS)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Ip Ranges', type: ColumnType.OBJS, data: { values: 'ipRanges', template: (r) => `${r.description}: from ${r.startAddress} to ${r.endAddress} --> ${r.difference*1} address(es)` }};

        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', ipRanges: [
                { description: 'uuu', startAddress: '1.1.1.1', endAddress: '2.2.2.2', difference: 1000 }
            ]}, 
            { score: 1, id: 'jjj', name: 'Label JJJ', ipRanges: [
                { description: 'uuu', startAddress: '1.1.1.1', endAddress: '2.2.2.2', difference: 2000 },
                { description: 'uuu', startAddress: '5.5.5.5', endAddress: '6.6.6.6', difference: 3000 }
            ]}, 
            { score: 2, id: 'kkk', name: 'Label KKK', ipRanges: []},
            { score: 3, id: 'lll', name: 'Label LLL', ipRanges: undefined}
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(4);
            tableRows.forEach((row/*, i*/) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.values ? Array.isArray(row.data.values) : true).toBeTruthy();
                row.data.values?.forEach((item) => {
                    expect(item).toBeDefined();
                    expect(item.data).toBeDefined();
                    expect(typeof item.data).toBe('string');
                    expect(item.data.length).toBeGreaterThan(10);
                });
                expect(row.typeofobjects).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one texts column type (see ColumnType.TXTS)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Annotations', type: ColumnType.TXTS, data: { values: 'annotations'}};

        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', annotations: [ 'IsTest', 'ReadOnly', 'RemoteAction' ]}, 
            { score: 1, id: 'jjj', name: 'Label JJJ', annotations: [] }, 
            { score: 2, id: 'kkk', name: 'Label KKK', annotations: undefined }
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(3);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.values ? Array.isArray(row.data.values) : true).toBeTruthy();
                row.data.values?.forEach((item, j) => {
                    expect(item).toBeDefined();
                    expect(typeof item.data).toBe('string');
                    expect(item.data).toBe(data[i].annotations[j]);
                });
                expect(row.typeoftexts).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with only one urls column type (see ColumnType.URLS)', () => {

        /** @type {TableColumn} */
        const column = { label: 'Users\' profiles', type: ColumnType.URLS, data: { values: 'assigneeProfileRefs', value: 'url', label: 'name' }};

        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', name: 'Label III', assigneeProfileRefs: [
                { name: 'uuu', url: '#1.html' }
            ]}, 
            { score: 1, id: 'jjj', name: 'Label JJJ', assigneeProfileRefs: [
                { name: 'vvv', url: '#2.html' },
                { name: 'www', url: '#3.html' }
            ]}, 
            { score: 2, id: 'kkk', name: 'Label KKK', assigneeProfileRefs: []},
            { score: 3, id: 'lll', name: 'Label LLL', assigneeProfileRefs: undefined}
        ];
        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return CellFactory.create(column, row);
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(4);
            tableRows.forEach((row, i) => {
                expect(row).toBeDefined();
                expect(row.data).toBeDefined();
                expect(row.data.values ? Array.isArray(row.data.values) : true).toBeTruthy();
                row.data.values?.forEach((item, j) => {
                    expect(item).toBeDefined();
                    expect(item.data).toBeDefined();
                    expect(typeof item.data).toBe('object');
                    expect(item.data.label).toBe(data[i].assigneeProfileRefs[j].name);
                    expect(item.data.value).toBe(data[i].assigneeProfileRefs[j].url);
                });
                expect(row.typeofids).toBeTruthy();
            });
        });
    });

    describe('Test Cell Factory with numeric column types and modifiers (see ColumnType.NUM)', () => {

        /** @type {Array<TableColumnWithModifiers>} */
        const columns = [
            { label: 'Column 1', type: ColumnType.NUM, data: { value: 'propertyA' }, modifier: { minimum: 3, valueBeforeMin: '<3', valueIfEmpty: 'N/A' }},
            { label: 'Column 2', type: ColumnType.NUM, data: { value: 'propertyB' }, modifier: { maximum: 8, valueAfterMax: '>8' }},
            { label: 'Column 3', type: ColumnType.NUM, data: { value: 'propertyC' }, modifier: { minimum: 2, valueBeforeMin: '<2', maximum: 5, valueAfterMax: '>5' }}
        ];

        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', propertyA: 4, propertyB: 6, propertyC: 4 }, // none of the properties will be decorated
            { score: 0, id: 'iii', propertyA: 3, propertyB: 6, propertyC: 4 }, // none of the properties will be decorated -- note: propA = min, not <
            { score: 0, id: 'jjj', propertyA: 2, propertyB: 6, propertyC: 4 }, // propA will be decorated (because < min), not the other props
            { score: 0, id: 'kkk',               propertyB: 6, propertyC: 4 }, // propA will be decorated (because not defined), not the other props
            { score: 0, id: 'lll', propertyA: 4, propertyB: 8, propertyC: 4 }, // none of the properties will be decorated -- note: propB = max, not >
            { score: 0, id: 'mmm', propertyA: 4, propertyB: 9, propertyC: 4 }, // propB will be decorated (because > max), not the other props
            { score: 0, id: 'nnn', propertyA: 4, propertyB: 6, propertyC: 2 }, // none of the properties will be decorated -- note: propC = min, not <
            { score: 0, id: 'ooo', propertyA: 4, propertyB: 6, propertyC: 5 }, // none of the properties will be decorated -- note: propC = max, not >
            { score: 0, id: 'ppp', propertyA: 4, propertyB: 6, propertyC: 6 }, // propC will be decorated (because > max), not the other props
            { score: 0, id: 'qqq', propertyA: 4, propertyB: 6, propertyC: 1 }, // propB will be decorated (because < min), not the other props
        ];

        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return columns.map((column) => {
                    return CellFactory.create(column, row);
                });
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(10);
            tableRows.forEach((row, i) => {
                expect(row[0].data.value).toBe(data[i].propertyA);
                expect(row[1].data.value).toBe(data[i].propertyB);
                expect(row[2].data.value).toBe(data[i].propertyC);

                // i==0: none of the properties will be decorated
                expect(i === 0 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 0 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 0 ? row[2].decoration : undefined).toBeUndefined();

                // i==1: none of the properties will be decorated -- note: propA = min, not <
                expect(i === 1 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 1 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 1 ? row[2].decoration : undefined).toBeUndefined();

                // i==2: propA will be decorated (because < min), not the other props
                expect(i === 2 ? row[0].decoration === columns[0].modifier.valueBeforeMin : true).toBeTruthy();
                expect(i === 2 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 2 ? row[2].decoration : undefined).toBeUndefined();

                // i==3: propA will be decorated (because not defined), not the other props
                expect(i === 3 ? row[0].decoration === columns[0].modifier.valueIfEmpty : true).toBeTruthy();
                expect(i === 3 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 3 ? row[2].decoration : undefined).toBeUndefined();

                // i==4: none of the properties will be decorated -- note: propB = max, not >
                expect(i === 4 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 4 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 4 ? row[2].decoration : undefined).toBeUndefined();

                // i==5: propB will be decorated (because > max), not the other props
                expect(i === 5 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 5 ? row[1].decoration === columns[1].modifier.valueAfterMax : true).toBeTruthy();
                expect(i === 5 ? row[2].decoration : undefined).toBeUndefined();

                // i==6: none of the properties will be decorated -- note: propC = min, not <
                expect(i === 6 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 6 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 6 ? row[2].decoration : undefined).toBeUndefined();

                // i==7: none of the properties will be decorated -- note: propC = max, not >
                expect(i === 7 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 7 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 7 ? row[2].decoration : undefined).toBeUndefined();

                // i==8: propC will be decorated (because > max), not the other props
                expect(i === 8 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 8 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 8 ? row[2].decoration === columns[2].modifier.valueAfterMax : true).toBeTruthy();

                // i==9: propB will be decorated (because < min), not the other props
                expect(i === 9 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 9 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 9 ? row[2].decoration === columns[2].modifier.valueBeforeMin : true).toBeTruthy();
            });
        });
    }); 
    
    describe('Test Cell Factory with textual column types and modifiers (see ColumnType.TXT)', () => {

        /** @type {Array<TableColumnWithModifiers>} */
        const columns = [
            { label: 'Column 1', type: ColumnType.TXT, data: { value: 'propertyA' }, modifier: { maximumLength: 10, valueIfEmpty: 'Empty value for A' }},
            { label: 'Column 2', type: ColumnType.TXT, data: { value: 'propertyB' }, modifier: { maximumLength: 8, preformatted: true }},
            { label: 'Column 3', type: ColumnType.TXT, data: { value: 'propertyC' }, modifier: { valueIfEmpty: 'Empty value for C' }}
        ];

        /** @type {Array<any>} */
        const data = [ 
            { score: 0, id: 'iii', propertyA: 'text',        propertyB: 'text',      propertyC: 'text' },    // none of the properties will be decorated
            { score: 0, id: 'jjj', propertyA: 'text56789A',  propertyB: 'text',      propertyC: 'text' },    // none of the properties will be decorated -- note: propA.length = maximumLength, not >
            { score: 0, id: 'kkk', propertyA: 'text56789Az', propertyB: 'text',      propertyC: 'text' },    // propA will be decorated (because length > max), not the other props
            { score: 0, id: 'lll', propertyA: '',            propertyB: 'text',      propertyC: 'text' },    // propA will be decorated (because length = 0), not the other props
            { score: 0, id: 'mmm', propertyA: undefined,     propertyB: 'text',      propertyC: 'text' },    // propA will be decorated (because undefined), not the other props
            { score: 0, id: 'nnn', propertyA: 'text',        propertyB: 'text5678',  propertyC: 'text' },    // none of the properties will be decorated -- note: propB.length = maximumLength, not >
            { score: 0, id: 'ooo', propertyA: 'text',        propertyB: 'text5678x', propertyC: 'text' },    // propB will be decorated (because length > max), not the other props
            { score: 0, id: 'iii', propertyA: 'text',        propertyB: 'text',      propertyC: '' },        // propC will be decorated (because length = 0), not the other props
            { score: 0, id: 'iii', propertyA: 'text',        propertyB: 'text',      propertyC: undefined }, // propC will be decorated (because undefined), not the other props
        ];

        it('checks if create method works fine', () => {
            const tableRows = data.map((row) => {
                return columns.map((column) => {
                    return CellFactory.create(column, row);
                });
            });
            expect(tableRows).not.toBeNull();
            expect(tableRows.length).toBe(9);
            tableRows.forEach((row, i) => {
                expect(row[0].data.value).toBe(data[i].propertyA);
                expect(row[1].data.value).toBe(data[i].propertyB);
                expect(row[1].isPreformatted).toBeTruthy();
                expect(row[2].data.value).toBe(data[i].propertyC);
                // i==0: none of the properties will be decorated
                expect(i === 0 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 0 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 0 ? row[2].decoration : undefined).toBeUndefined();
                        
                // i==1: none of the properties will be decorated -- note: propA.length = maximumLength, not >
                expect(i === 1 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 1 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 1 ? row[2].decoration : undefined).toBeUndefined();

                // i==2: propA will be decorated (because length > max), not the other props
                expect(i === 2 ? row[0].decoration === 'text56789A' : true).toBeTruthy(); // and not text56789Az which is 11-character long
                expect(i === 2 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 2 ? row[2].decoration : undefined).toBeUndefined();

                // i==3: propA will be decorated (because length = 0), not the other props
                expect(i === 3 ? row[0].decoration === columns[0].modifier.valueIfEmpty : true).toBeTruthy();
                expect(i === 3 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 3 ? row[2].decoration : undefined).toBeUndefined();

                // i==4: propA will be decorated (because undefined), not the other props
                expect(i === 4 ? row[0].decoration === columns[0].modifier.valueIfEmpty : true).toBeTruthy();
                expect(i === 4 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 4 ? row[2].decoration : undefined).toBeUndefined();

                // i==5: none of the properties will be decorated -- note: propB.length = maximumLength, not >
                expect(i === 5 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 5 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 5 ? row[2].decoration : undefined).toBeUndefined();

                // i==6: propB will be decorated (because length > max), not the other props
                expect(i === 6 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 6 ? row[1].decoration === 'text5678' : true).toBeTruthy(); // and not text5678x which is 9-character long
                expect(i === 6 ? row[2].decoration : undefined).toBeUndefined();

                // i==7: propC will be decorated (because length = 0), not the other props
                expect(i === 7 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 7 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 7 ? row[2].decoration === columns[2].modifier.valueIfEmpty : true).toBeTruthy();

                // i==8: propC will be decorated (because undefined), not the other props
                expect(i === 8 ? row[0].decoration : undefined).toBeUndefined();
                expect(i === 8 ? row[1].decoration : undefined).toBeUndefined();
                expect(i === 8 ? row[2].decoration === columns[2].modifier.valueIfEmpty : true).toBeTruthy();
            });
        });
    });
});
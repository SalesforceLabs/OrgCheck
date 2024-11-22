import { OrgCheckDataDependencies } from '../api/core/orgcheck-api-data-dependencies';

const APEX_TYPE = 'ApexClass';
const CUSTOMFIELD_TYPE = 'CustomField';
const CUSTOMLABEL_TYPE = 'CustomLabel';
const LAYOUT_TYPE = 'Layout';
const APEXCLASS_001   = { id: 'Id001', name: 'apexclass-001',   type: APEX_TYPE,        url: '#' };
const APEXCLASS_002   = { id: 'Id002', name: 'apexclass-002',   type: APEX_TYPE,        url: '#' };
const APEXCLASS_003   = { id: 'Id003', name: 'apexclass-003',   type: APEX_TYPE,        url: '#' };
const CUSTOMFIELD_001 = { id: 'Id004', name: 'customfield-004', type: CUSTOMFIELD_TYPE, url: '#' };
const CUSTOMFIELD_002 = { id: 'Id005', name: 'customfield-005', type: CUSTOMFIELD_TYPE, url: '#' };
const LAYOUT_001      = { id: 'Id006', name: 'layout-006',      type: LAYOUT_TYPE,      url: '#' };
const LAYOUT_002      = { id: 'Id007', name: 'layout-007',      type: LAYOUT_TYPE,      url: '#' };
const LAYOUT_003      = { id: 'Id008', name: 'layout-008',      type: LAYOUT_TYPE,      url: '#' };
const LAYOUT_004      = { id: 'Id009', name: 'layout-009',      type: LAYOUT_TYPE,      url: '#' };

const CREATE_DEPENDENCY_RELATIONSHIP = (item, refItem) => { return { 
  id: item.id, name: item.name,  type: item.type,  url: item.url,
  refId: refItem.id, refName: refItem.name, refType: refItem.type, refUrl: refItem.url 
}}

/*
  -- Let's build a commun use case for dependencies relationships called RELATIONSHIP_001 --
  APEXCLASS_001   { uses: [ APEXCLASS_002, CUSTOMFIELD_001 ], referenced: [ APEXCLASS_003, CUSTOMFIELD_002 ] }
  APEXCLASS_002   { uses: [ APEXCLASS_003 ],                  referenced: [ APEXCLASS_001 ] }
  APEXCLASS_003   { uses: [ APEXCLASS_001 ],                  referenced: [ APEXCLASS_002 ] }
  CUSTOMFIELD_001 { uses: [ CUSTOMFIELD_002 ],                referenced: [ APEXCLASS_001 ] }
  CUSTOMFIELD_002 { uses: [ APEXCLASS_001 ],                  referenced: [ CUSTOMFIELD_001 ] }
*/
const RELATIONSHIP_001 = [ 
  CREATE_DEPENDENCY_RELATIONSHIP(APEXCLASS_001, APEXCLASS_002), // apex class 001 references apex class 002
  CREATE_DEPENDENCY_RELATIONSHIP(APEXCLASS_001, CUSTOMFIELD_001), // apex class 001 references custom field 001
  CREATE_DEPENDENCY_RELATIONSHIP(APEXCLASS_003, APEXCLASS_001), // apex class 001 is referenced by apex class 003
  CREATE_DEPENDENCY_RELATIONSHIP(CUSTOMFIELD_002, APEXCLASS_001), // apex class 001 is referenced by custom field 002
  CREATE_DEPENDENCY_RELATIONSHIP(APEXCLASS_002, APEXCLASS_003), // apex class 002 references apex class 003
  CREATE_DEPENDENCY_RELATIONSHIP(CUSTOMFIELD_001, CUSTOMFIELD_002) // custom field 001 references custom field 002
]

/*
  -- Let's build a use case to cover ticket #465 called RELATIONSHIP_002 --
  CUSTOMFIELD_001 { uses: [], referenced: [ LAYOUT_001, LAYOUT_002, LAYOUT_003, LAYOUT_004, APEXCLASS_001 ] }
*/
const RELATIONSHIP_002 = [ 
  CREATE_DEPENDENCY_RELATIONSHIP(LAYOUT_001, CUSTOMFIELD_001), // custom field 001 referenced by page layout 1
  CREATE_DEPENDENCY_RELATIONSHIP(LAYOUT_002, CUSTOMFIELD_001), // custom field 001 referenced by page layout 2
  CREATE_DEPENDENCY_RELATIONSHIP(LAYOUT_003, CUSTOMFIELD_001), // custom field 001 referenced by page layout 3
  CREATE_DEPENDENCY_RELATIONSHIP(LAYOUT_004, CUSTOMFIELD_001), // custom field 001 referenced by page layout 4
  CREATE_DEPENDENCY_RELATIONSHIP(APEXCLASS_001, CUSTOMFIELD_001), // custom field 001 referenced by apex class 1
]

describe('api.core.OrgCheckDataDependencies', () => {

  describe('Using a predefined set of relationship (001), make sure the using, referenced and refByTypes properties for Apex Class 001 are well defined', () => {

    // In the relationShip 001, ApexClass001 uses ApexClass002 and CustomField001 and is referenced in ApexClass003 and CustomField002.
    const dataDep = new OrgCheckDataDependencies(RELATIONSHIP_001, APEXCLASS_001.id);
    
    it('checks if using property is well defined', () => {
      const using = dataDep.using;
      expect(using).not.toBeNull(); // should be a valid instance
      expect(using).toHaveLength(2); // ApexClass001 uses ApexClass002 and CustomField001
      expect(using).toEqual(expect.arrayContaining([ APEXCLASS_002 ])); // ApexClass002 is used by ApexClass001
      expect(using).toEqual(expect.arrayContaining([ CUSTOMFIELD_001 ])); // CustomField001 is used by ApexClass001
    });

    it('checks if referenced property is well defined', () => {
      const referenced = dataDep.referenced;
      expect(referenced).not.toBeNull(); // should be a valid instance
      expect(referenced).toHaveLength(2); // ApexClass001 is referenced by ApexClass003 and CustomField002
      expect(referenced).toEqual(expect.arrayContaining([ APEXCLASS_003 ])); // ApexClass001 is referenced by ApexClass003
      expect(referenced).toEqual(expect.arrayContaining([ CUSTOMFIELD_002 ])); // ApexClass001 is referenced by CustomField002
    });

    it('checks if reference by types property is well defined', () => {
      const refByTypes = dataDep.referencedByTypes;
      expect(refByTypes).not.toBeNull(); // should be a valid instance
      expect(refByTypes).toHaveProperty(APEX_TYPE); // We should have ApexClass references list
      expect(refByTypes[APEX_TYPE]).toBe(1); // ApexClass001 is referenced by only one Apex Class
      expect(refByTypes).toHaveProperty(CUSTOMFIELD_TYPE); // We should have Custom Field references list
      expect(refByTypes[CUSTOMFIELD_TYPE]).toBe(1); // ApexClass001 is referenced by only one Custom Field
      expect(refByTypes).not.toHaveProperty(CUSTOMLABEL_TYPE); // We should NOT have Custom Label references list  
    });
  });

  describe('Using a predefined set of relationship (001), make sure the using, referenced and refByTypes properties for Apex Class 002 are well defined', () => {

    // In the relationShip 001, ApexClass002 uses ApexClass003 and is referenced in ApexClass001.
    const dataDep = new OrgCheckDataDependencies(RELATIONSHIP_001, APEXCLASS_002.id);

    it('checks if using property is well defined', () => {
      const using = dataDep.using;
      expect(using).not.toBeNull(); // should be a valid instance
      expect(using).toHaveLength(1); // ApexClass002 uses ApexClass003
      expect(using).toEqual(expect.arrayContaining([ APEXCLASS_003 ])); // ApexClass003 is used by ApexClass002
    });

    it('checks if referenced property is well defined', () => {
      const referenced = dataDep.referenced;
      expect(referenced).not.toBeNull(); // should be a valid instance
      expect(referenced).toHaveLength(1); // ApexClass002 is referenced by ApexClass001
      expect(referenced).toEqual(expect.arrayContaining([ APEXCLASS_001 ])); // ApexClass002 is referenced by ApexClass001
    });

    it('checks if reference by types property is well defined', () => {
      const refByTypes = dataDep.referencedByTypes;
      expect(refByTypes).not.toBeNull(); // should be a valid instance
      expect(refByTypes).toHaveProperty(APEX_TYPE); // We should have ApexClass references list
      expect(refByTypes[APEX_TYPE]).toBe(1); // ApexClass001 is referenced by only one Apex Class
      expect(refByTypes).not.toHaveProperty(CUSTOMFIELD_TYPE); // We should NOT have Custom Field references list
      expect(refByTypes).not.toHaveProperty(CUSTOMLABEL_TYPE); // We should NOT have Custom Label references list
    });
  });

  describe('Using a predefined set of relationship (001), make sure the using, referenced and refByTypes properties for Custom Field 001 are well defined', () => {

    // In the relationShip 001, CustomField001 uses CustomField002 and is referenced in ApexClass001.
    const dataDep = new OrgCheckDataDependencies(RELATIONSHIP_001, CUSTOMFIELD_001.id);

    it('checks if using property is well defined', () => {
      const using = dataDep.using;
      expect(using).not.toBeNull(); // should be a valid instance
      expect(using).toHaveLength(1); // CustomField001 uses CustomField002
      expect(using).toEqual(expect.arrayContaining([ CUSTOMFIELD_002 ])); // CustomField001 is used by CustomField002
    });

    it('checks if referenced property is well defined', () => {
      const referenced = dataDep.referenced;
      expect(referenced).not.toBeNull(); // should be a valid instance
      expect(referenced).toHaveLength(1); // CustomField001 is referenced in ApexClass001
      expect(referenced).toEqual(expect.arrayContaining([ APEXCLASS_001 ])); // CustomField001 is referenced by ApexClass001
    });

    it('checks if reference by types property is well defined', () => {
      const refByTypes = dataDep.referencedByTypes;
      expect(refByTypes).not.toBeNull(); // should be a valid instance
      expect(refByTypes).toHaveProperty(APEX_TYPE); // We should have ApexClass references list
      expect(refByTypes[APEX_TYPE]).toBe(1); // ApexClass001 is referenced by only one Apex Class
      expect(refByTypes).not.toHaveProperty(CUSTOMFIELD_TYPE); // We should NOT have Custom Field references list (the nuance is that this custom field uses custom field but is not referenced by custom field!!)
      expect(refByTypes).not.toHaveProperty(CUSTOMLABEL_TYPE); // We should NOT have Custom Label references list
    });
  });

  describe('Using a predefined set of relationship (002), make sure the using, referenced and refByTypes properties for Custom Field 001 are well defined', () => {

    // In the relationShip 002, CustomField001 uses nothing and is referenced in 4 page layouts and in ApexClass001.
    const dataDep = new OrgCheckDataDependencies(RELATIONSHIP_002, CUSTOMFIELD_001.id);

    it('checks if using property is well defined', () => {
      const using = dataDep.using;
      expect(using).not.toBeNull(); // should be a valid instance
      expect(using).toHaveLength(0); // CustomField001 uses nothing
    });

    it('checks if referenced property is well defined', () => {
      const referenced = dataDep.referenced;
      expect(referenced).not.toBeNull(); // should be a valid instance
      expect(referenced).toHaveLength(5); // CustomField001 is referenced in 4 pagelayouts and in 1 ApexClass001
      expect(referenced).toEqual(expect.arrayContaining([ APEXCLASS_001 ])); // CustomField001 is referenced by ApexClass001
      expect(referenced).toEqual(expect.arrayContaining([ LAYOUT_001, LAYOUT_002, LAYOUT_003, LAYOUT_004 ])); // CustomField001 is referenced by 4 page layouts
    });

    it('checks if reference by types property is well defined', () => {
      const refByTypes = dataDep.referencedByTypes;
      expect(refByTypes).not.toBeNull(); // should be a valid instance
      expect(refByTypes).toHaveProperty(APEX_TYPE); // We should have ApexClass references list
      expect(refByTypes[APEX_TYPE]).toBe(1); // CustomField001 is referenced by only one Apex Class
      expect(refByTypes).toHaveProperty(LAYOUT_TYPE); // We should have Layout references list
      expect(refByTypes[LAYOUT_TYPE]).toBe(4); // CustomField001 is referenced by 4 page layouts
      expect(refByTypes).not.toHaveProperty(CUSTOMFIELD_TYPE); // We should NOT have Custom Field references list
      expect(refByTypes).not.toHaveProperty(CUSTOMLABEL_TYPE); // We should NOT have Custom Label references list
    });
  });
});
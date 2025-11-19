import { SFDC_ApexClass, SFDC_ApexTrigger, SFDC_CustomLabel, SFDC_Field, SFDC_Flow, 
    SFDC_Group, SFDC_LightningAuraComponent, SFDC_LightningPage, SFDC_LightningWebComponent, 
    SFDC_Limit, SFDC_Object, SFDC_ObjectRelationShip, SFDC_PermissionSet, SFDC_PermissionSetLicense, 
    SFDC_Profile, SFDC_ProfilePasswordPolicy, SFDC_ProfileRestrictions, SFDC_RecordType, 
    SFDC_User, SFDC_UserRole, SFDC_ValidationRule, SFDC_VisualForceComponent, 
    SFDC_VisualForcePage, SFDC_WebLink, SFDC_Workflow } from '../libs/orgcheck-api';

describe('c-orgcheck-app', () => {

    describe('Should have correct table definitions', () => {

        it('Should have correct table definition for limits', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Limit());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'id', 'score', 'label', 'type', 'max', 'used', 'usedPercentage', 'remaining' ];
            // Calculate the expected fields that are not in the object (should be empty!)
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for validation rules', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ValidationRule());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'id', 'score', 'name', 'url', 'package', 'objectRef', 'isActive', 
                'errorDisplayField', 'errorMessage', 'description', 'createdDate', 'lastModifiedDate' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'objectId' ].sort());
        });

        it('Should have correct table definition for validation rules (in object)', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ValidationRule());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'id', 'score', 'name', 'url', 'package', 'isActive', 
                'errorDisplayField', 'errorMessage', 'description', 'createdDate', 'lastModifiedDate',
                'objectRef' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 'objectId' ].sort());
        });

        it('Should have correct table definition for web links', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_WebLink());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'id', 'score', 'url', 'name', 'hardCodedURLs', 'hardCodedIDs', 'type',
                'behavior', 'package', 'createdDate', 'lastModifiedDate', 'description', 'objectRef', 'dependencies' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 'objectId' ].sort());
        });

        it('Should have correct table definition for record types', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_RecordType());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'developerName', 'isActive', 'isAvailable',
                'isDefault', 'isMaster', 'objectRef', 'package' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 'objectId' ].sort());
        });

        it('Should have correct table definition for relationships', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ObjectRelationShip());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'name', 'fieldName', 'childObject', 'isCascadeDelete', 'isRestrictedDelete' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([]);
        });

        it('Should have correct table definition for fields', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Field());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 
                // For standard field table definition
                    'score', 'id', 'name', 'url', 'label', 'package', 'objectRef', 'type', 
                    'length', 'isUnique', 'isEncrypted', 'isExternalId', 'isIndexed', 'isRestrictedPicklist', 
                    'tooltip', 'formula', 'hardCodedURLs', 'hardCodedIDs', 'defaultValue', 'dependencies', 'createdDate',
                    'lastModifiedDate', 'description', 
                // For custom fields table definition
                    'score', 'id', 'name', 'url', 'label', 'package', 'type', 
                    'length', 'isUnique', 'isEncrypted', 'isExternalId', 'isIndexed', 'isRestrictedPicklist', 
                    'tooltip', 'formula', 'hardCodedURLs', 'hardCodedIDs', 'defaultValue', 'dependencies', 'createdDate',
                    'lastModifiedDate', 'description'
            ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'objectId', 'isCustom' ].sort());
        });

        it('Should have correct table definition for custom labels', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_CustomLabel());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'package', 'label', 'category', 'language', 
                'isProtected', 'dependencies', 'createdDate', 'lastModifiedDate', 'value' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for aura cmps', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_LightningAuraComponent());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'package', 'dependencies', 
                'createdDate', 'lastModifiedDate', 'description' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for flexi pages', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_LightningPage ());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'type', 'package', 'objectRef', 'dependencies', 
                'createdDate', 'lastModifiedDate', 'description', 'isAttachmentRelatedListIncluded',
                'isRelatedListFromPageLayoutIncluded', 'nbComponents', 'nbFields', 'nbRelatedLists' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'objectId' ].sort());
        });

        it('Should have correct table definition for flexi pages (in object)', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_LightningPage ());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'type', 'package', 'dependencies', 
                'createdDate', 'lastModifiedDate', 'description', 'isAttachmentRelatedListIncluded',
                'isRelatedListFromPageLayoutIncluded', 'nbComponents', 'nbFields', 'nbRelatedLists' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'objectId', 'objectRef' ].sort());
        });

        it('Should have correct table definition for LWC', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_LightningWebComponent ());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'package', 'dependencies',
                'createdDate', 'lastModifiedDate', 'description' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for permission sets', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_PermissionSet());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'isGroup', 'isCustom', 'nbFieldPermissions', 
                'nbObjectPermissions', 'importantPermissions', 'license', 'package', 'memberCounts', 'createdDate', 
                'lastModifiedDate', 'description', 'allIncludingGroupsAreEmpty', 'permissionSetGroupRefs',
                'permissionSetRefs', 'isAdminLike' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'type', 'groupId', 'permissionSetGroupIds', 'permissionSetIds' ].sort());
        });

        it('Should have correct table definition for permission set licenses', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_PermissionSetLicense());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'totalCount', 'usedCount', 'usedPercentage', 
                'remainingCount', 'distinctActiveAssigneeCount', 'permissionSetRefs', 'status', 'expirationDate', 
                'isAvailableForIntegrations', 'createdDate', 'lastModifiedDate' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'permissionSetIds' ].sort());
        });

        it('Should have correct table definition for profiles', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Profile());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'isCustom', 'nbFieldPermissions', 'isAdminLike',
                'nbObjectPermissions', 'importantPermissions', 'license', 'package', 'memberCounts', 'createdDate',
                'lastModifiedDate', 'description'
            ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'type' ].sort());
        });

        it('Should have correct table definition for profile restrictions', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ProfileRestrictions());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'profileRef', 'ipRanges', 'loginHours' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'profileId' ].sort());
        });

        it('Should have correct table definition for profile password policies', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ProfilePasswordPolicy());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'profileName', 'passwordExpiration', 'passwordHistory', 'minimumPasswordLength', 
                'passwordComplexity', 'passwordQuestion', 'maxLoginAttempts', 'lockoutInterval', 'minimumPasswordLifetime', 
                'obscure' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for public groups and queues', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Group());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 
                // For public groups table definition
                     'score', 'id', 'name', 'url', 'developerName', 'includeBosses', 
                    'nbDirectMembers', 'directGroupRefs', 'directUserRefs', 'includeSubordinates',
                // For Queues table definition
                    'score', 'id', 'name', 'url', 'developerName', 'includeBosses', 
                    'nbDirectMembers', 'directGroupRefs', 'directUserRefs', 'includeSubordinates'
            ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'directGroupIds', 'directUserIds', 'isQueue', 'type', 'relatedId', 'isPublicGroup' ].sort());
        });

        it('Should have correct table definition for users', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_User());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'url', 'score', 'id', 'name', 'onLightningExperience', 'lastLogin', 'numberFailedLogins', 'isAdminLike',
                'lastPasswordChange', 'aggregateImportantPermissions', 'profileRef', 'permissionSetRefs', 'hasMfaByPass', 'nbDirectLoginWithMFA', 
                'nbDirectLoginWithoutMFA', 'nbSSOLogin', 'hasDebugMode' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'profileId', 'permissionSetIds' ].sort());
        });

        it('Should have correct table definition for Visualforce Pages', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_VisualForcePage);
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'package', 'isMobileReady',
                'hardCodedURLs', 'hardCodedIDs', 'dependencies', 'createdDate', 'lastModifiedDate', 'description' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for Visualforce Components', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_VisualForceComponent);
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'package', 'hardCodedURLs',
                'hardCodedIDs', 'dependencies', 'createdDate', 'lastModifiedDate', 'description' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition for apex classes', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ApexClass);
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 
                // For Apex Class table definition
                    'score', 'id', 'name', 'url', 'apiVersion', 'package', 'isClass', 'isAbstract',
                    'isInterface', 'isEnum', 'isSchedulable', 'specifiedAccess', 'interfaces', 'extends', 'length', 
                    'hardCodedURLs', 'hardCodedIDs', 'methodsCount', 'innerClassesCount', 'annotations', 'specifiedSharing',
                    'isScheduled', 'coverage', 'relatedTestClassRefs', 'dependencies', 'createdDate', 'lastModifiedDate',
                // For Apex Uncompiled Class table definition
                    'score', 'id', 'name', 'url', 'apiVersion', 'package', 'length', 'coverage', 'relatedTestClassRefs', 
                    'dependencies', 'createdDate', 'lastModifiedDate',
                // For Apex Test Class table definition
                    'score', 'id', 'name', 'url', 'apiVersion', 'package', 'length', 'hardCodedURLs', 'hardCodedIDs', 
                    'nbSystemAsserts', 'methodsCount', 'lastTestRunDate', 'testMethodsRunTime', 'testPassedButLongMethods', 
                    'testFailedMethods', 'innerClassesCount', 'specifiedSharing', 'relatedClassRefs', 'dependencies', 
                    'createdDate', 'lastModifiedDate', 'isTestSeeAllData'
            ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'isTest', 'needsRecompilation', 'relatedClassIds', 'relatedTestClassIds' ].sort());
        });

        it('Should have correct table definition for apex triggers', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ApexTrigger());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'package', 'length', 'hardCodedURLs',
                'hardCodedIDs', 'objectRef', 'isActive', 'hasSOQL', 'hasDML', 'beforeInsert', 'afterInsert', 'beforeUpdate',
                'afterUpdate', 'beforeDelete', 'afterDelete', 'afterUndelete', 'dependencies', 'createdDate', 'lastModifiedDate' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'objectId' ].sort());
        });


        it('Should have correct table definition for apex triggers (in object)', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_ApexTrigger());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'package', 'length', 'hardCodedURLs',
                'hardCodedIDs', 'isActive', 'hasSOQL', 'hasDML', 'beforeInsert', 'afterInsert', 'beforeUpdate',
                'afterUpdate', 'beforeDelete', 'afterDelete', 'afterUndelete', 'dependencies', 'createdDate', 'lastModifiedDate' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'objectId', 'objectRef' ].sort());
        });

        it('Should have correct table definition for OWDs', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Object());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'label', 'name', 'package', 'internalSharingModel', 'externalSharingModel' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
        });

        it('Should have correct table definition for flows', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Flow());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'apiVersion', 'type', 'createdDate',
                'lastModifiedDate', 'description', 'versionsCount', 'currentVersionRef', 'isVersionActive',
                'isLatestCurrentVersion', 'dependencies' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds', 
                'currentVersionId', 'isProcessBuilder' ].sort());
        });

        it('Should have correct table definition for workflows', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_Workflow());
            // Properties used in the app in the corresponding TableDefintion
            const expectedProperties = [ 'score', 'id', 'name', 'url', 'isActive', 'hasAction', 'actions',
                'emptyTimeTriggers', 'futureActions', 'createdDate', 'lastModifiedDate', 'description' ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds' ].sort());
        });

        it('Should have correct table definition and box decorators for roles', () => {
            // Properties defined for each row of the Table
            const objectProperties = Object.keys(new SFDC_UserRole());
            // Properties used in the app in the corresponding TableDefintion and Box Decoartors
            const expectedProperties = [ 
                // In TableDefinition
                    'score', 'id', 'name', 'url', 'apiname', 'activeMembersCount', 'level',
                    'parentRef', 
                // In Box Decorators
                    'hasActiveMembers', 'name', 'apiname', 'id', 'activeMembersCount', 
                    'activeMemberRefs', 'parentRef'
            ];
            // Calculate the expected fields that are not in the object
            expect(expectedProperties.filter((p) => objectProperties.includes(p) === false)).toStrictEqual([]);
            // Calculate the fields that are in the object but not in the expected properties
            expect(objectProperties.filter((p) => expectedProperties.includes(p) === false).sort()).toStrictEqual([ 'badFields', 'badReasonIds',
                'parentId', 'hasParent', 'activeMemberIds' ].sort());
        });
    });
});
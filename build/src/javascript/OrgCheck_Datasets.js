/**
 * Datasets module
 */
OrgCheck.Datasets = {

    /**
     * Dataset representation
     * @param setup JSON configuration including:
     *              <ol>
     *                <li><code>name</code>: Technical name of this dataset (used in controller)</li>
     *                <li><code>keyCache</code>: Key used when caching the data in localStorage</li>
     *                <li><code>isCachable</code>: Should we cache the data or not?</li>
     *                <li><code>retriever</code>: Retreiver function with success and error callback methods</li>
     *              </ol>
     */
    Dataset: function(setup) {
        const THAT = this;
        this.getName = () => { return setup.name };
        this.getKeyCache = () => { return setup.keyCache };
        this.isCachable = () => { return setup.isCachable === true };
        this.getRetriever = () => { return (s, e) => { setup.retriever(THAT, s, e) } };
    },

    /**
     * Datasets collection representation
     */
    Collection: function() {

        /**
         * This is a collection of datasets
         */
        const private_datasets_collection = {};

        /**
         * Add a dataset in the internal list
         * @param dataset Object of type OrgCheck.Datasets.Dataset
         */
        this.addDataset = (dataset) => {
            private_datasets_collection[dataset.getName()] = dataset;
        };

        /**
         * Is this dataset name part of the list?
         * @param name of the dataset
         * @return true or false
         */
        this.hasDataset = (name) => {
            return private_datasets_collection.hasOwnProperty(name);
        };

        /**
         * Return the dataset item
         * @param name of the dataset
         * @return the dataset item
         */
        this.getDataset = (name) => {
            return private_datasets_collection[name];
        };

    },

    /**
     * @param handlers Map of handlers to use inside this handler:
     *                 <ol>
     *                   <li><code>SalesforceHandler</code>: Salesforce Handler</li>
     *                   <li><code>MetadataCacheHandler</code>: Metadata Cache Handler</li>
     *                   <li><code>PreferenceCacheHandler</code>: Preference Cache Handler</li>
     *                   <li><code>MapHandler</code>: Map Handler</li>
     *                   <li><code>ArrayHandler</code>: Array Handler</li>
     *                   <li><code>DateHandler</code>: Date Handler</li>
     *                 </ol>
     */
    Handler: function(handlers) {

        /**
         * Salesforce handler that will let us do queries etc...
         */
         const SALESFORCE_HANDLER = handlers.SalesforceHandler;
        
        /**
         * Metadata Cache handler to use for perfomance
         */
        const METADATA_CACHE_HANDLER = handlers.MetadataCacheHandler;
    
        /**
         * Preference Cache handler to use for perfomance
         */
        const PREFERENCE_CACHE_HANDLER = handlers.PreferenceCacheHandler;

         /**
         * Map handler for output data
         */
        const MAP_HANDLER = handlers.MapHandler;

        /**
         * Array handler
         */
        const ARRAY_HANDLER = handlers.ArrayHandler;

        /**
         * Date handler
         */
        const DATE_HANDLER = handlers.DateHandler;

         /**
         * collections of datasets
         */
        const private_datasets = new OrgCheck.Datasets.Collection();

        /**
         * Is the collection has a given dataset?
         * @param name of the dataset
         * @return true or false
         */
        this.hasDataset = (name) => {
            return private_datasets.hasDataset(name);
        };

        /**
         * Return the dataset item
         * @param name of the dataset
         * @return the dataset item
         */
        this.getDataset = (name) => {
            return private_datasets.getDataset(name);
        };

        /**
         * Run a list of datasets given their names
         * @param datasets Array of string representing the datasets you wan to run
         * @param dependencies Flag to say if you want us to calculate the dependencies for the ids retrieved from datasets
         * @param decorators List of decorators:
         *                 <ol>
         *                   <li><code>startDatasetDecorator</code>: Starting decorator for a given dataset name</li>
         *                   <li><code>successDatasetDecorator</code>: Success decorator for a given dataset name</li>
         *                   <li><code>errorDatasetDecorator</code>: Error decorator for a given dataset name</li>
         *                   <li><code>startMappingDecorator</code>: Starting decorator for the mapping phase</li>
         *                   <li><code>successMappingDecorator</code>: Success decorator for mapping phase</li>
         *                   <li><code>errorMappingDecorator</code>: Error decorator for mapping phase</li>
         *                   <li><code>startDependenciesDecorator</code>: Starting decorator for dependencies phase</li>
         *                   <li><code>successDependenciesDecorator</code>: Success decorator for dependencies phase</li>
         *                   <li><code>errorDependenciesDecorator</code>: Error decorator for dependencies phase</li>
         *                   <li><code>successFinalDecorator</code>: Final end decorator</li>
         *                   <li><code>errorFinalDecorator</code>: Final error decorator</li>
         *                 </ol>
         * @return a list of promises
         */
        this.runDatasets = (datasets, dependencies, decorators) => {
            const onLoadPromises = [];
            const errors = [];
            datasets.forEach(ds => {
                decorators.startDatasetDecorator(ds);
                const dataset = private_datasets.getDataset(ds);
                onLoadPromises.push(new Promise((s, e) => { 
                    try {
                        if (dataset.isCachable() === true) {
                            const data = METADATA_CACHE_HANDLER.getItem(dataset.getKeyCache());
                            if (data) { decorators.successDatasetDecorator(ds); s(data); return; }
                        }
                        dataset.getRetriever()(
                            (data) => { 
                                decorators.successDatasetDecorator(ds); 
                                if (dataset.isCachable() === true) {
                                    METADATA_CACHE_HANDLER.setItem(dataset.getKeyCache(), data);
                                }
                                s(data); 
                            }, 
                            (error) => { decorators.errorDatasetDecorator(ds, error); e(error); }
                        );
                    } catch (error) { decorators.errorDatasetDecorator(ds, error); e(error); } 
                }));
            });
            Promise.all(onLoadPromises)
                .then((results) => {
                    decorators.startMappingDecorator();
                    const map = MAP_HANDLER.newMap();
                    let keys = [];
                    results.forEach((result, index) => {
                        MAP_HANDLER.setValue(map, datasets[index], result);
                        keys = ARRAY_HANDLER.concat(keys, MAP_HANDLER.keys(result));
                    });
                    decorators.successMappingDecorator();
                    return { m: map, k: keys };
                })
                .catch((error) => {
                    decorators.errorMappingDecorator(error);
                    decorators.errorFinalDecorator(error);
                })
                .then((data) => {
                    if (data) {
                        if (dependencies === true) {
                            decorators.startDependenciesDecorator();
                            SALESFORCE_HANDLER.dependencyApi(
                                data.k,
                                (dep) => {
                                    decorators.successDependenciesDecorator();
                                    data.m['dependencies'] = dep || {};
                                    decorators.successFinalDecorator(data.m);
                                },
                                (error) => {
                                    decorators.errorDependenciesDecorator(error);
                                    decorators.errorFinalDecorator(error);
                                }
                            );
                        } else {
                            decorators.successFinalDecorator(data.m);
                        }
                    }
                })
                .catch((error) => { decorators.errorFinalDecorator(error); });
        }

        /**
         * ======================================================================
         * Add Objects dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'objects', 
            isCachable: true, 
            keyCache: 'Objects', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.describeGlobal()
                    .on('record', (r) => {
                        if (!r.keyPrefix) return;
                        const item = {
                            id: r.name,
                            label: r.label,
                            developerName: r.name,
                            package: SALESFORCE_HANDLER.splitDeveloperName(r.name).package,
                            isStandardObject: (r.custom === false),
                            isCustomSetting: (r.customSetting === true),
                            isCustomObject: (r.name.endsWith('__c')),
                            isExternalObject: (r.name.endsWith('__x')),
                            isCustomMetadataType: (r.name.endsWith('__mdt')),
                            isPlatformEvent: (r.name.endsWith('__e')),
                            isBigObject: (r.name.endsWith('__b')),
                            isKnowledgeArticle: (r.name.endsWith('__ka'))
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('error', (error) => reject(error))
                    .on('end', () => resolve(records))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Custom Fields dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'customFields', 
            isCachable: true, 
            keyCache: 'CustomFields', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, EntityDefinition.QualifiedApiName, EntityDefinitionId, '+
                                    'DeveloperName, NamespacePrefix, Description, CreatedDate, '+
                                    'LastModifiedDate '+
                                'FROM CustomField '+
                                'WHERE ManageableState = \'unmanaged\' ', 
                        tooling: true 
                    }])
                    .on('record', (r) => {
                        if (!r.EntityDefinition) return;
                        const item = { 
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            objectId: SALESFORCE_HANDLER.salesforceIdFormat(r.EntityDefinitionId),
                            objectDeveloperName: r.EntityDefinition?.QualifiedApiName,
                            fieldName: r.DeveloperName,
                            developerName: r.DeveloperName,
                            package: r.NamespacePrefix,
                            fullName: r.DeveloperName,
                            description: r.Description,
                            createdDate: r.CreatedDate, 
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Active Users dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'users', 
            isCachable: true, 
            keyCache: 'Users', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, SmallPhotoUrl, Profile.Id, Profile.Name, '+
                                    'LastLoginDate, LastPasswordChangeDate, NumberOfFailedLogins, '+
                                    'UserPreferencesLightningExperiencePreferred, '+
                                    '(SELECT PermissionSet.Id, PermissionSet.Name, '+
                                        'PermissionSet.PermissionsApiEnabled, '+
                                        'PermissionSet.PermissionsViewSetup, '+
                                        'PermissionSet.PermissionsModifyAllData, '+
                                        'PermissionSet.PermissionsViewAllData, '+
                                        'PermissionSet.IsOwnedByProfile '+
                                        'FROM PermissionSetAssignments '+
                                        'ORDER BY PermissionSet.Name) '+
                                'FROM User '+
                                'WHERE Profile.Id != NULL ' + // we do not want the Automated Process users!
                                'AND IsActive = true ', // we only want active users
                    }])
                    .on('record', (r) => {
                        let item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            photourl: r.SmallPhotoUrl,
                            lastLogin: DATE_HANDLER.datetimeFormat(r.LastLoginDate),
                            neverLogged: (!r.LastLoginDate ? true : false),
                            numberFailedLogins: r.NumberOfFailedLogins,
                            lastPasswordChange: DATE_HANDLER.datetimeFormat(r.LastPasswordChangeDate),
                            onLightningExperience: r.UserPreferencesLightningExperiencePreferred,
                            profile: {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(r.Profile.Id),
                                name: r.Profile.Name
                            },
                            permissionSets: [],
                            permissions: {
                                apiEnabled: false,
                                viewSetup: false,
                                modifyAllData: false,
                                viewAllData: false
                            }
                        };
                        if (r.PermissionSetAssignments && r.PermissionSetAssignments.records) {
                            for (let i=0; i<r.PermissionSetAssignments.records.length; i++) {
                                let assignment = r.PermissionSetAssignments.records[i];
                                if (assignment.PermissionSet.PermissionsApiEnabled === true) item.permissions.apiEnabled = true;
                                if (assignment.PermissionSet.PermissionsViewSetup === true) item.permissions.viewSetup = true;
                                if (assignment.PermissionSet.PermissionsModifyAllData === true) item.permissions.modifyAllData = true;
                                if (assignment.PermissionSet.PermissionsViewAllData === true) item.permissions.viewAllData = true;
                                if (assignment.PermissionSet.IsOwnedByProfile == false) {
                                    item.permissionSets.push({
                                        id: SALESFORCE_HANDLER.salesforceIdFormat(assignment.PermissionSet.Id),
                                        name: assignment.PermissionSet.Name
                                    });
                                }
                            }
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));
    
        /**
         * ======================================================================
         * Add the Object CRUDs dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'objectCRUDs', 
            isCachable: true, 
            keyCache: 'ObjectCRUDs', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT ParentId, Parent.Profile.Name, Parent.Label, Parent.IsOwnedByProfile, SobjectType, '+
                                    'PermissionsRead, PermissionsCreate, PermissionsEdit, PermissionsDelete, '+
                                    'PermissionsViewAllRecords, PermissionsModifyAllRecords '+
                                'FROM ObjectPermissions '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: r.ParentId + r.SobjectType,
                            sobject: r.SobjectType,
                            type: (r.Parent.IsOwnedByProfile ? 'profile' : 'permissionSet'),
                            parent: { 
                                id: (r.Parent.IsOwnedByProfile ? r.Parent.ProfileId : r.ParentId), 
                                name: (r.Parent.IsOwnedByProfile ? r.Parent.Profile.Name : r.Parent.Label) 
                            },
                            permissions: {
                                create: r.PermissionsCreate,
                                read: r.PermissionsRead,
                                update: r.PermissionsEdit,
                                delete: r.PermissionsDelete,
                                viewAll: r.PermissionsViewAllRecords,
                                modifyAll: r.PermissionsModifyAllRecords
                            }
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));
        
        /**
         * ======================================================================
         * Add the Profiles dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'profiles', 
            isCachable: true, 
            keyCache: 'Profiles', 
            retriever: (me, resolve, reject) => {
                const profileIds = [];
                const profiles = {};
                SALESFORCE_HANDLER.query([{
                        string: 'SELECT ProfileId, Profile.UserType, NamespacePrefix, '+
                                    '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 101) '+
                                'FROM PermissionSet '+ // oh yes we are not mistaken!
                                'WHERE isOwnedByProfile = TRUE'
                    }])
                    .on('record', (r) => {
                        const profileId = SALESFORCE_HANDLER.salesforceIdFormat(r.ProfileId);
                        profileIds.push(profileId);
                        profiles[profileId] = r;
                    })
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        SALESFORCE_HANDLER.readMetadataAtScale({ type: 'Profile', ids: profileIds, byPasses: [ 'UNKNOWN_EXCEPTION' ] })
                            .on('record', (r) => {
                                const profileId = SALESFORCE_HANDLER.salesforceIdFormat(r.Id);
                                const profileSoql = profiles[profileId];
                                if (!profileSoql) return;
                                const memberCounts = (profileSoql.Assignments && profileSoql.Assignments.records) ? profileSoql.Assignments.records.length : 0;
                                const item = {
                                    id: profileId,
                                    name: r.Name,
                                    loginIpRanges: r.Metadata.loginIpRanges,
                                    description: r.Description,
                                    license: r.Metadata.userLicense,
                                    userType: profileSoql.Profile.UserType,
                                    isCustom: r.Metadata.custom,
                                    isUnusedCustom: r.Metadata.custom && memberCounts == 0,
                                    isUndescribedCustom: r.Metadata.custom && !r.Description,
                                    package: profileSoql.NamespacePrefix,
                                    membersCount: memberCounts,
                                    hasMembers: memberCounts > 0,
                                    createdDate: r.CreatedDate, 
                                    lastModifiedDate: r.LastModifiedDate
                                }
                                if (r.Metadata.loginHours) {
                                    const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
                                    days.forEach(d => {
                                        const c1 = r.Metadata.loginHours[d + 'Start'];
                                        const c2 = r.Metadata.loginHours[d + 'End'];
                                        if (!item.loginHours) item.loginHours = {};
                                        item.loginHours[d] = {
                                            from: (('0' + Math.floor(c1 / 60)).slice(-2) + ':' + ('0' + (c1 % 60)).slice(-2)),
                                            to:   (('0' + Math.floor(c2 / 60)).slice(-2) + ':' + ('0' + (c2 % 60)).slice(-2))
                                        };
                                    });
                                }
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('end', () => resolve(records))
                            .on('error', (error) => reject(error))
                            .run();
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Permission Sets dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'permissionSets', 
            isCachable: true, 
            keyCache: 'PermissionSets', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                const psgByName1 = {};
                const psgByName2 = {};
                SALESFORCE_HANDLER.query([{
                        string: 'SELECT Id, Name, Description, IsCustom, License.Name, NamespacePrefix, Type, '+
                                    'CreatedDate, LastModifiedDate, '+
                                    '(SELECT Id FROM Assignments WHERE Assignee.IsActive = TRUE LIMIT 1) '+ // just to see if used
                                'FROM PermissionSet '+
                                'WHERE IsOwnedByProfile = FALSE' 
                    }, {
                        byPasses: [ 'INVALID_TYPE' ],
                        string: 'SELECT Id, DeveloperName, Description, NamespacePrefix, Status, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM PermissionSetGroup ' 
                    }])
                    .on('record', (r, i) => {
                        if (i === 0) {
                            const hasMembers = (r.Assignments && r.Assignments.records) ? r.Assignments.records.length > 0 : false;
                            const item = {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                name: r.Name,
                                description: r.Description,
                                hasLicense: (r.License ? 'yes' : 'no'),
                                license: (r.License ? r.License.Name : ''),
                                isCustom: r.IsCustom,
                                isUndescribedCustom: r.IsCustom && !r.Description,
                                package: r.NamespacePrefix,
                                isUnusedCustom: r.IsCustom && !hasMembers,
                                hasMembers: hasMembers,
                                isGroup: (r.Type === 'Group'),     // other values can be 'Regular', 'Standard', 'Session
                                createdDate: r.CreatedDate, 
                                lastModifiedDate: r.LastModifiedDate
                            };
                            if (item.isGroup === true) psgByName1[item.package+'--'+item.name] = item;
                            MAP_HANDLER.setValue(records, item.id, item);
                        } else {
                            const item = {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                name: r.DeveloperName,
                                description: r.Description,
                                package: r.NamespacePrefix,
                                createdDate: r.CreatedDate, 
                                lastModifiedDate: r.LastModifiedDate
                            }
                            psgByName2[item.package+'--'+item.name] = item;
                        }
                    })
                    .on('end', () => {
                        for (const [key, value] of Object.entries(psgByName1)) if (psgByName2[key]) {
                            value.groupId = psgByName2[key].id;
                            value.description = psgByName2[key].description;
                            value.isUndescribedCustom = value.isCustom && !value.description;
                            MAP_HANDLER.setValue(records, value.id, value);
                        };
                        resolve(records);
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Permission Set Assignments dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'permissionSetAssignments', 
            isCachable: true, 
            keyCache: 'PermissionSetAssignments', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, AssigneeId, Assignee.ProfileId, PermissionSetId '+
                                'FROM PermissionSetAssignment '+
                                'WHERE Assignee.IsActive = TRUE '+
                                'AND PermissionSet.IsOwnedByProfile = FALSE '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            assigneeId: SALESFORCE_HANDLER.salesforceIdFormat(r.AssigneeId),
                            assigneeProfileId: SALESFORCE_HANDLER.salesforceIdFormat(r.Assignee.ProfileId),
                            permissionSetId: SALESFORCE_HANDLER.salesforceIdFormat(r.PermissionSetId)
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Role dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'roles', 
            isCachable: true, 
            keyCache: 'Roles', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                const ROOT_ID = '###root###';
                SALESFORCE_HANDLER.query([{ 
                        string:  'SELECT Id, DeveloperName, Name, ParentRoleId, PortalType, '+
                                    '(SELECT Id, Name, Username, Email, Phone, '+
                                        'SmallPhotoUrl, IsActive FROM Users)'+
                                ' FROM UserRole '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            developerName: r.DeveloperName,
                            parentId: r.ParentRoleId ? SALESFORCE_HANDLER.salesforceIdFormat(r.ParentRoleId) : ROOT_ID,
                            hasParent: r.ParentRoleId ? true : false,
                            activeMembersCount: 0,
                            activeMembers: [],
                            hasActiveMembers: false,
                            inactiveMembersCount: 0,
                            hasInactiveMembers: false,
                            isExternal: (r.PortalType !== 'None') ? true : false
                        };
                        if (r.Users && r.Users.records) for (let i=0; i<r.Users.records.length; i++) {
                            let user = r.Users.records[i];
                            if (user.IsActive) {
                                item.activeMembers.push({
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(user.Id),
                                    name: user.Name,
                                    username: user.Username,
                                    email: user.Email,
                                    telephone: user.Phone,
                                    photourl: user.SmallPhotoUrl,
                                    isActive: user.IsActive
                                });
                            } else {
                                item.inactiveMembersCount++;
                            }
                        }
                        item.activeMembersCount = item.activeMembers.length;
                        item.hasActiveMembers = item.activeMembers.length > 0;
                        item.hasInactiveMembers = item.inactiveMembersCount > 0;
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => {
                        records[ROOT_ID] = {
                            id: ROOT_ID,
                            name: 'Role Hierarchy',
                            developerName: ROOT_ID,
                            parentId: null
                        };
                        resolve(records);
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Public Groups dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'publicGroups', 
            isCachable: true, 
            keyCache: 'PublicGroups', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, DeveloperName, DoesIncludeBosses, Type, RelatedId, Related.Name, '+
                                    '(SELECT UserOrGroupId From GroupMembers)'+
                                'FROM Group' 
                    }])
                    .on('record', (r) => {
                        const item = { id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id) };
                        switch (r.Type) {
                            case 'Regular':              item.type = 'publicGroup'; break;
                            case 'Role':                 item.type = 'role';        break;
                            case 'Queue':                item.type = 'queue';       break;
                            case 'RoleAndSubordinates':  item.type = 'roleAndSub';  break;
                            // case 'AllCustomerPortal':
                            // case 'Organization':
                            // case 'PRMOrganization':
                            default: item.type = 'technical';
                        }
                        if (item.type === 'role' || item.type === 'roleAndSub') {
                            item.relatedId = SALESFORCE_HANDLER.salesforceIdFormat(r.RelatedId);
                        } else {
                            item.developerName = r.DeveloperName;
                            item.name = r.Name;
                            item.includeBosses = r.DoesIncludeBosses;
                            item.directMembersCount = 0;
                            item.directUsers = [];
                            item.directGroups = [];                            
                        }
                        if (r.GroupMembers && r.GroupMembers.records) {
                            for (let i=0; i<r.GroupMembers.records.length; i++) {
                                item.directMembersCount++;
                                const member_id = SALESFORCE_HANDLER.salesforceIdFormat(r.GroupMembers.records[i].UserOrGroupId);
                                const member_is_a_user = member_id.startsWith('005');
                                (member_is_a_user === true ? item.directUsers : item.directGroups).push({ id: member_id });    
                            }
                        }
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Workflow Rules dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'workflows', 
            isCachable: true, 
            keyCache: 'Workflows', 
            retriever: (me, resolve, reject) => {
                const workflowRuleIds = [];
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id FROM WorkflowRule', 
                        tooling: true 
                    }])
                    .on('record', (r) => workflowRuleIds.push(r.Id))
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        SALESFORCE_HANDLER.readMetadataAtScale({ type: 'WorkflowRule', ids: workflowRuleIds, byPasses: [ 'UNKNOWN_EXCEPTION' ] })
                            .on('record', (r) => {
                                const item =  {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.FullName,
                                    description: r.Metadata.description,
                                    actions: r.Metadata.actions,
                                    futureActions: r.Metadata.workflowTimeTriggers,
                                    isActive: r.Metadata.active,
                                    createdDate: r.CreatedDate,
                                    lastModifiedDate: r.LastModifiedDate,
                                    noAction: true
                                };
                                if (!item.actions) item.actions = [];
                                if (!item.futureActions) item.futureActions = [];
                                item.noAction = (item.actions.length == 0 && item.futureActions.length == 0);
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('end', () => resolve(records))
                            .on('error', (error) => reject(error))
                            .run();
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Flow dataset
         * ======================================================================
         */
        private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'flows', 
            isCachable: true, 
            keyCache: 'Flows', 
            retriever: (me, resolve, reject) => {
                const flowIds = [];
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id FROM Flow', 
                        tooling: true 
                    }])
                    .on('record', (r) => flowIds.push(r.Id))
                    .on('end', () => {
                        const records = MAP_HANDLER.newMap();
                        SALESFORCE_HANDLER.readMetadataAtScale({ type: 'Flow', ids: flowIds, byPasses: [ 'UNKNOWN_EXCEPTION' ] })
                            .on('record', (r) => {
                                const item =  {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                                    name: r.FullName,
                                    definitionId: SALESFORCE_HANDLER.salesforceIdFormat(r.DefinitionId),
                                    definitionName: r.MasterLabel,
                                    version: r.VersionNumber,
                                    dmlCreates: r.Metadata.recordCreates?.length || 0,
                                    dmlDeletes: r.Metadata.recordDeletes?.length || 0,
                                    dmlUpdates: r.Metadata.recordUpdates?.length || 0,
                                    isActive: r.Status === 'Active',
                                    description: r.Description,
                                    type: r.ProcessType,
                                    createdDate: r.CreatedDate,
                                    lastModifiedDate: r.LastModifiedDate
                                };
                                r.Metadata.processMetadataValues?.forEach(m => {
                                    if (m.name === 'ObjectType') item.sobject = m.value.stringValue;
                                    if (m.name === 'TriggerType') item.triggerType = m.value.stringValue;
                                });
                                MAP_HANDLER.setValue(records, item.id, item);
                            })
                            .on('end', () => resolve(records))
                            .on('error', (error) => reject(error))
                            .run();
                    })
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Custom Labels dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'customLabels', 
            isCachable: true, 
            keyCache: 'CustomLabels', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        string: 'SELECT Id, Name, NamespacePrefix, Category, IsProtected, Language, MasterLabel, Value '+
                                'FROM ExternalString '+
                                'WHERE ManageableState = \'unmanaged\' ',
                        tooling: true
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            masterLabel: r.MasterLabel,
                            namespace: r.NamespacePrefix,
                            category: r.Category,
                            protected: r.IsProtected,
                            language: r.Language,
                            value: r.Value
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Lightning Pages dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'auraPages', 
            isCachable: true, 
            keyCache: 'LightningPages', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, MasterLabel, EntityDefinition.DeveloperName, '+
                                    'Type, NamespacePrefix, Description, ' +
                                    'CreatedDate, LastModifiedDate '+
                                'FROM FlexiPage '+
                                'WHERE ManageableState = \'unmanaged\' '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.MasterLabel,
                            entityName: r.EntityDefinition ? r.EntityDefinition.DeveloperName : '',
                            type: r.Type,
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Lightning Components dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'auraComponents', 
            isCachable: true, 
            keyCache: 'AuraComponents', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM AuraDefinitionBundle '+
                                'WHERE ManageableState = \'unmanaged\' '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.MasterLabel,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                    };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();
            }
        }));

        /**
         * ======================================================================
         * Add the Visual Force pages dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'vfPages', 
            isCachable: true, 
            keyCache: 'VisualforcePages', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, IsAvailableInTouch, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM ApexPage '+
                                'WHERE ManageableState = \'unmanaged\''
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description, 
                            mobile: r.IsAvailableInTouch,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                    };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

        /**
         * ======================================================================
         * Add the Visual Force components dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'vfComponents', 
            isCachable: true, 
            keyCache: 'VisualforceComponents', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, Description, '+
                                    'CreatedDate, LastModifiedDate '+
                                'FROM ApexComponent '+
                                'WHERE ManageableState = \'unmanaged\' '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.Name,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));
        
        /**
         * ======================================================================
         * Add the Lightning Web Components dataset
         * ======================================================================
         */
         private_datasets.addDataset(new OrgCheck.Datasets.Dataset({
            name: 'lwComponents', 
            isCachable: true, 
            keyCache: 'LightningWebComponents', 
            retriever: (me, resolve, reject) => {
                const records = MAP_HANDLER.newMap();
                SALESFORCE_HANDLER.query([{ 
                        tooling: true, 
                        string: 'SELECT Id, MasterLabel, ApiVersion, NamespacePrefix, Description, '+ 
                                    'CreatedDate, LastModifiedDate '+
                                'FROM LightningComponentBundle '+
                                'WHERE ManageableState = \'unmanaged\' '
                    }])
                    .on('record', (r) => {
                        const item = {
                            id: SALESFORCE_HANDLER.salesforceIdFormat(r.Id),
                            name: r.MasterLabel,
                            apiVersion: r.ApiVersion,
                            isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: r.ApiVersion }),
                            namespace: r.NamespacePrefix,
                            description: r.Description,
                            createdDate: r.CreatedDate,
                            lastModifiedDate: r.LastModifiedDate
                        };
                        MAP_HANDLER.setValue(records, item.id, item);
                    })
                    .on('end', () => resolve(records))
                    .on('error', (error) => reject(error))
                    .run();                
            }
        }));

/*

 



    // ========================================================================
    // APEX CLASSES (UNIT TEST AND OTHERS)
    // ------------------------------------------------------------------------
    // Get the list of Apex Classes in Salesforce (metadata, using tooling API)
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'apexClasses',
        keycache: 'ApexClasses',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'AsyncApexJob': [ 'ApexClassId' ]
                },
                onError: reject,
                onEnd: () => {
                    const cache = this.keycache;
                    const value = SALESFORCE_HANDLER.getMetadataInCache(cache);
                    if (value) resolve(value);
                    const classesMap = {};
                    const relatedTestClassesMap = {};
                    const classesCoverageMap = {};
                    const schedulableMap = {};
                    const REGEX_ISINTERFACE = new RegExp("(?:public|global)\\s+(?:interface)\\s+\\w+\\s*\\{", 'i');
                    const REGEX_ISENUM = new RegExp("(?:public|global)\\s+(?:enum)\\s+\\w+\\s*\\{", 'i');
                    const REGEX_ISTESTSEEALLDATA = new RegExp("@IsTest\\(.*SeeAllData=true.*\\)", 'i');
                    const REGEX_TESTNBASSERTS = new RegExp("System.assert(?:Equals|NotEquals|)\\(", 'ig');
                    SALESFORCE_HANDLER.doSalesforceQueries({
                        queries: [{
                            string: 'SELECT ApexClassOrTriggerId, ApexTestClassId '+
                                    'FROM ApexCodeCoverage',
                            tooling: true
                        }, {
                            string: 'SELECT ApexClassorTriggerId, NumLinesCovered, '+
                                        'NumLinesUncovered, Coverage '+
                                    'FROM ApexCodeCoverageAggregate',
                            tooling: true
                        }, { 
                            string: 'SELECT Id, Name, ApiVersion, NamespacePrefix, '+
                                        'Body, LengthWithoutComments, SymbolTable, '+
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM ApexClass '+
                                    'WHERE ManageableState = \'unmanaged\' ',
                            tooling: true
                        }, {
                            string: 'SELECT ApexClassId '+
                                    'FROM AsyncApexJob '+
                                    'WHERE JobType = \'ScheduledApex\' ',
                            tooling: false
                        }], 
                        onEachRecord: function(v, index) {
                            switch (index) {
                                case 0: {
                                    // ApexCodeCoverage records
                                    const i = SALESFORCE_HANDLER.salesforceIdFormat(v.ApexClassOrTriggerId);
                                    const t = SALESFORCE_HANDLER.salesforceIdFormat(v.ApexTestClassId);
                                    const item = relatedTestClassesMap[i] || new Set();
                                    item.add(t);
                                    relatedTestClassesMap[i] = item;
                                    break;
                                }
                                case 1: {
                                    // ApexCodeCoverageAggregate records
                                    const item =  {
                                        id: SALESFORCE_HANDLER.salesforceIdFormat(v.ApexClassOrTriggerId),
                                        covered: v.NumLinesCovered,
                                        uncovered: v.NumLinesUncovered,
                                        coverage: (v.NumLinesCovered / (v.NumLinesCovered + v.NumLinesUncovered))
                                    };
                                    classesCoverageMap[item.id] = item;
                                    break; 
                                }
                                case 2: {
                                    // ApexClasses records
                                    const item =  {
                                        id: SALESFORCE_HANDLER.salesforceIdFormat(v.Id),
                                        name: v.Name,
                                        apiVersion: v.ApiVersion,
                                        isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: v.ApiVersion }),
                                        namespace: v.NamespacePrefix,
                                        isTest: false,
                                        isAbstract: false,
                                        isClass: true,
                                        isEnum: false,
                                        isInterface: false,
                                        isSharingMissing: false,
                                        length: v.LengthWithoutComments,
                                        needsRecompilation: (!v.SymbolTable ? true : false),
                                        coverage: 0, // by default no coverage!
                                        createdDate: v.CreatedDate,
                                        lastModifiedDate: v.LastModifiedDate
                                    };
                                    if (v.Body) {
                                        item.isInterface = v.Body.match(REGEX_ISINTERFACE) !== null;
                                        item.isEnum = v.Body.match(REGEX_ISENUM) !== null;
                                        item.isClass = (item.isInterface === false && item.isEnum === false);
                                    }
                                    if (v.SymbolTable) {
                                        item.innerClassesCount = v.SymbolTable.innerClasses.length || 0;
                                        item.interfaces = v.SymbolTable.interfaces;
                                        item.methodsCount = v.SymbolTable.methods.length || 0;
                                        if (v.SymbolTable.tableDeclaration) {
                                            item.annotations = v.SymbolTable.tableDeclaration.annotations;
                                            if (v.SymbolTable.tableDeclaration.modifiers) {
                                                v.SymbolTable.tableDeclaration.modifiers.forEach(m => {
                                                    switch (m) {
                                                        case 'with sharing':      item.specifiedSharing = 'with';      break;
                                                        case 'without sharing':   item.specifiedSharing = 'without';   break;
                                                        case 'inherited sharing': item.specifiedSharing = 'inherited'; break;
                                                        case 'public':            item.specifiedAccess  = 'public';    break;
                                                        case 'global':            item.specifiedAccess  = 'global';    break;
                                                        case 'abstract':          item.isAbstract       = true;        break;
                                                        case 'testMethod':        item.isTest           = true;        break;
                                                    }
                                                });
                                            };
                                        }
                                    }
                                    if (item.isEnum === true || item.isInterface === true) item.specifiedSharing = 'n/a';
                                    if (item.isTest === false && item.isClass === true && !item.specifiedSharing) {
                                        item.isSharingMissing = true;
                                    }
                                    if (item.isTest === true) {
                                        item.isTestSeeAllData = v.Body.match(REGEX_ISTESTSEEALLDATA) !== null;
                                        item.nbSystemAsserts = v.Body.match(REGEX_TESTNBASSERTS)?.length || 0;
                                    }
                                    classesMap[item.id] = item;
                                    break;
                                }
                                default: {
                                    schedulableMap[SALESFORCE_HANDLER.salesforceIdFormat(v.ApexClassId)] = true;
                                }
                            }
                        }, 
                        onEnd: function(records, size) { 
                            for (const [key, value] of Object.entries(classesMap)) {
                                if (classesCoverageMap[key]) value.coverage = classesCoverageMap[key].coverage;
                                if (relatedTestClassesMap[key]) value.relatedTestClasses = Array.from(relatedTestClassesMap[key]);
                                if (schedulableMap[key]) value.isScheduled = true;
                            }
                            SALESFORCE_HANDLER.setMetadataInCache(cache, classesMap);
                            resolve(classesMap);
                        },
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // APEX TRIGGERS
    // ------------------------------------------------------------------------
    // Get the list of Apex Triggers in Salesforce (metadata, using tooling API)
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'apexTriggers',
        keycache: 'ApexTriggers',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, Name, ApiVersion, Status, '+
                                        'NamespacePrefix, Body, '+
                                        'UsageBeforeInsert, UsageAfterInsert, '+
                                        'UsageBeforeUpdate, UsageAfterUpdate, '+
                                        'UsageBeforeDelete, UsageAfterDelete, '+
                                        'UsageAfterUndelete, UsageIsBulk, '+
                                        'LengthWithoutComments, '+
                                        'EntityDefinition.QualifiedApiName, '+
                                        'CreatedDate, LastModifiedDate '+
                                    'FROM ApexTrigger '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            if (v.EntityDefinition) {
                                const item = {
                                    id: SALESFORCE_HANDLER.salesforceIdFormat(v.Id),
                                    name: v.Name,
                                    apiVersion: v.ApiVersion,
                                    isApiVersionOld: SALESFORCE_HANDLER.isVersionOld({ apiVersion: v.ApiVersion }),
                                    namespace: v.NamespacePrefix,
                                    length: v.LengthWithoutComments,
                                    isActive: (v.Status === 'Active' ? true : false),
                                    beforeInsert: v.UsageBeforeInsert,
                                    afterInsert: v.UsageAfterInsert,
                                    beforeUpdate: v.UsageBeforeUpdate,
                                    afterUpdate: v.UsageAfterUpdate,
                                    beforeDelete: v.UsageBeforeDelete,
                                    afterDelete: v.UsageAfterDelete,
                                    afterUndelete: v.UsageAfterUndelete,
                                    sobject: v.EntityDefinition.QualifiedApiName,
                                    hasSOQL: false,
                                    hasDML: false,
                                    createdDate: v.CreatedDate,
                                    lastModifiedDate: v.LastModifiedDate
                                };
                                if (v.Body) {
                                    item.hasSOQL = v.Body.match("\\[\\s*(?:SELECT|FIND)") !== null; 
                                    item.hasDML = v.Body.match("(?:insert|update|delete)\\s*(?:\\w+|\\(|\\[)") !== null; 
                                }
                                return item;
                            }
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
    */


     }
}


/*

    // ========================================================================
    // PACKAGES
    // ------------------------------------------------------------------------
    // List of Packages in Salesforce (metadata, using tooling API). 
    // This includes the installed packages (with type="Installed"). And 
    // also the local packages (with type="Local").
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'packages',
        keycache: 'Packages',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Organization': [ 'NamespacePrefix' ]
                },
                onError: reject,
                onEnd: () => {
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, SubscriberPackage.NamespacePrefix, SubscriberPackage.Name '+
                                    'FROM InstalledSubscriberPackage ' 
                        }, { 
                            tooling: false,
                            string: 'SELECT NamespacePrefix '+
                                    'FROM Organization '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            if (i == 0) {
                                return { 
                                    id: v.Id, 
                                    name: v.SubscriberPackage.Name,
                                    namespace: v.SubscriberPackage.NamespacePrefix,
                                    type: 'Installed'
                                };
                            } else {
                                return { 
                                    id: v.NamespacePrefix, 
                                    name: v.NamespacePrefix,
                                    namespace: v.NamespacePrefix, 
                                    type: 'Local'
                                };
                            }
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));



    // ========================================================================
    // CUSTOM SETTINGS
    // ------------------------------------------------------------------------
    // Get the list of Custom Settings in Salesforce (metadata, using tooling API)
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'customSettings',
        keycache: 'CustomSettings',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT DurableId, QualifiedApiName, NamespacePrefix '+
                                    'FROM EntityDefinition '+
                                    'WHERE IsCustomSetting = true ' + 
                                    'AND NamespacePrefix = NULL '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(v.DurableId),
                                name: v.QualifiedApiName,
                                namespace: v.NamespacePrefix
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));



    // ========================================================================
    // STATIC RESOURCES
    // ------------------------------------------------------------------------
    // Get the list of Static Resources in Salesforce (metadata, using tooling API)
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'stResources',
        keycache: 'StaticResources',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                },
                onError: reject,
                onEnd: () => {
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: true, 
                            string: 'SELECT Id, Name, NamespacePrefix '+
                                    'FROM StaticResource '+
                                    'WHERE ManageableState = \'unmanaged\' '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return {
                                id: SALESFORCE_HANDLER.salesforceIdFormat(v.Id),
                                name: v.Name,
                                namespace: v.NamespacePrefix
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));                    






    // ========================================================================
    // REPORTS
    // ------------------------------------------------------------------------
    // Get the list of failed reports in Salesforce 
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'reports',
        keycache: 'Reports',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Report' : [ 'Id', 'Name', 'NamespacePrefix', 'DeveloperName', 
                                 'FolderName', 'Format', 'Description' ]
                },
                onError: reject,
                onEnd: () => {
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, Name, NamespacePrefix, DeveloperName, FolderName, Format, Description '+
                                    'FROM Report '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return { 
                                id: v.Id,
                                name: v.Name,
                                package: v.NamespacePrefix,
                                developerName: v.DeveloperName,
                                folder: { name: v.FolderName },
                                format: v.Format,
                                description: v.Description
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // DASHBOARDS
    // ------------------------------------------------------------------------
    // Get the list of failed dashboards in Salesforce 
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'dashboards',
        keycache: 'Dashboards',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'Dashboard': [ 'Id', 'Title', 'NamespacePrefix', 'DeveloperName', 
                                   'FolderId', 'FolderName', 'Description' ]
                },
                onError: reject,
                onEnd: () => {
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT Id, Title, NamespacePrefix, DeveloperName, FolderId, FolderName, Description '+
                                    'FROM Dashboard '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return { 
                                id: v.Id,
                                name: v.Title,
                                package: v.NamespacePrefix,
                                developerName: v.DeveloperName,
                                folder: { id: v.FolderId, name: v.FolderName },
                                description: v.Description
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));

    // ========================================================================
    // BATCHES
    // ------------------------------------------------------------------------
    // Get the list of failed batches and scheduled jobs in Salesforce 
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'batchesApexJobs',
        keycache: 'BatchesApexJobs',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'AsyncApexJob': [ 'JobType', 'ApexClassId', 'MethodName', 'Status', 
                                      'ExtendedStatus', 'Id', 'NumberOfErrors', 'CreatedDate' ]
                },
                onError: reject,
                onEnd: () => {
                    let artificial_id = 0;
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT JobType, ApexClass.Name, MethodName, Status, ExtendedStatus, COUNT(Id) ids, SUM(NumberOfErrors) errors '+
                                    'FROM AsyncApexJob '+
                                    'WHERE CreatedDate >= YESTERDAY '+
                                    'AND ((Status = \'Completed\' AND ExtendedStatus <> NULL) '+
                                    'OR Status = \'Failed\') '+
                                    'GROUP BY JobType, ApexClass.Name, MethodName, Status, ExtendedStatus '+
                                    'LIMIT 10000 '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            const apexClass = (v.ApexClass ? v.ApexClass.Name : 'anonymous')+(v.MethodName ? ('.'+v.MethodName) : '');
                            return { 
                                id: 'APXJOBS-'+artificial_id++,
                                type: v.JobType,
                                context: apexClass,
                                status: v.Status,
                                message: v.ExtendedStatus,
                                numIds: v.ids,
                                numErrors: v.errors
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'batchesScheduledJobs',
        keycache: 'BatchesScheduledJobs',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    'CronTrigger': [ 'CreatedById', 'CreatedDate', 'CronExpression', 
                                     'CronJobDetailId', 'EndTime', 'Id', 'LastModifiedById', 
                                     'NextFireTime', 'OwnerId', 'PreviousFireTime', 
                                     'StartTime', 'State', 'TimesTriggered', 'TimeZoneSidKey' ]
                },
                onError: reject,
                onEnd: () => {
                    let artificial_id = 0;
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: [ { 
                            tooling: false, 
                            string: 'SELECT CreatedById, CreatedDate, CronExpression, '+
                                        'CronJobDetailId, CronJobDetail.JobType, CronJobDetail.Name, '+
                                        'EndTime, Id, LastModifiedById, NextFireTime, OwnerId, '+
                                        'PreviousFireTime, StartTime, State, TimesTriggered, '+
                                        'TimeZoneSidKey '+
                                    'FROM CronTrigger '+
                                    'WHERE State <> \'COMPLETE\' ' +
                                    'LIMIT 10000 '
                        } ],
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            let jobTypeLabel = '';
                            switch (v.CronJobDetail.JobType) {
                                case '1': jobTypeLabel = 'Data Export'; break;
                                case '3': jobTypeLabel = 'Dashboard Refresh'; break;
                                case '4': jobTypeLabel = 'Reporting Snapshot'; break;
                                case '6': jobTypeLabel = 'Scheduled Flow'; break;
                                case '7': jobTypeLabel = 'Scheduled Apex'; break;
                                case '8': jobTypeLabel = 'Report Run'; break;
                                case '9': jobTypeLabel = 'Batch Job'; break;
                                case 'A': jobTypeLabel = 'Reporting Notification'; break;
                                default:  return; // skip if type is not supported
                            }
                            return { 
                                id: 'SCHJOBS-'+artificial_id++,
                                name: v.CronJobDetail.Name,
                                type: jobTypeLabel,
                                status: v.State,
                                userid: SALESFORCE_HANDLER.salesforceIdFormat(v.OwnerId),
                                start: v.StartTime,
                                end: v.EndTime,
                                timezone: v.TimeZoneSidKey
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));



    // ========================================================================
    // ORG WIDE DEFAULTS
    // ------------------------------------------------------------------------
    // Get the list of all org wide default in this org
    // ========================================================================
    SALESFORCE_HANDLER.addDataset(new OrgCheck.Dataset({
        name: 'orgWideDefaults',
        keycache: 'OrgWideDefaults',
        retriever: function(me, resolve, reject) {
            SALESFORCE_HANDLER.doSecureSobjectReadEnforcement({
                sobjects: {
                    // Example of enforcement for REST SOQL only (not tooling api)
                    // 'User': [ 'Id', 'FirstName', 'LastName' ]
                    /*'EntityDefinition': [ 'DurableId', 'QualifiedApiName', 'MasterLabel', 
                                          'ExternalSharingModel', 'InternalSharingModel',
                                          'NamespacePrefix', 'IsCustomSetting',
                                          'IsApexTriggerable', 'IsCompactLayoutable' ]*/
              /*  },
                onError: reject,
                onEnd: () => {
                    // We have some issue calling the Bulk API with jsforce
                    // As EntityDefinition does not accept querMore, we will trick the system
                    const MAX_COUNT_ENTITYDEF = 600;
                    const BATCH_SIZE = 200;
                    const NUM_LOOP = MAX_COUNT_ENTITYDEF/BATCH_SIZE;
                    const entityDefQueries = [];
                    for (let i=0; i<NUM_LOOP; i++) {
                        entityDefQueries.push({
                            rest: true,
                            string: 'SELECT DurableId, QualifiedApiName, MasterLabel, ExternalSharingModel, InternalSharingModel, '+
                                        'NamespacePrefix '+
                                    'FROM EntityDefinition '+
                                    'WHERE IsCustomSetting = false '+
                                    'AND IsApexTriggerable = true '+
                                    'AND IsCompactLayoutable = true '+
                                    'LIMIT ' + BATCH_SIZE + ' '+
                                    'OFFSET ' + (BATCH_SIZE*i),
                            queryMore: false
                        });
                    }
                    SALESFORCE_HANDLER.doSalesforceQueriesWithCache({
                        mnemonic: this.keycache, 
                        queries: entityDefQueries,
                        onEachRecordFromAPI: function(v, i, l, ts) {
                            return { 
                                id: v.DurableId,
                                name: v.QualifiedApiName,
                                label: v.MasterLabel,
                                package: v.NamespacePrefix,
                                external: v.ExternalSharingModel,
                                internal: v.InternalSharingModel
                            };
                        }, 
                        onEndFromCache: resolve,
                        onError: reject
                    });
                }
            });
        }
    }));*/
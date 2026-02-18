export const JsForceMock = {
  Connection: class JsForceConnectionMock {
    /** @type {number} */
    nbRecordsSoFarForCustomQueryMore: number = 0;

    async queryMore(url: string): Promise<{ records: Array<any>; done: boolean; nextRecordsUrl?: string }> {
      const matchRemaining: any | null = url.match("#Remaining=(?<remaining>[0-9]*)#");
      const remaining = Number.parseInt(matchRemaining?.groups.remaining);
      const matchFields: any = url.match("#Fields=(?<fields>.*)#");
      const fields: any[]= matchFields?.groups.fields.split(',').map((f: string) => f.trim());
      const records: any = [];
      for (let i = 0; i < remaining; i++) {
        const record: any = {};
        fields.forEach(field => record[field] = `${field}-${i}`);
        records.push(record);
      }
      return {
        records: records,
        done: true
      }
    }

    async query(string: string): Promise<{ records: Array<any>; done: boolean; nextRecordsUrl?: string }> {

      // If the Query contains a wait instruction, we wait the specified time before returning the result. This is useful to test the timeout of the API calls.
      const matchWait: any = string.match("#Wait=(?<wait>[0-9]*)#");
      if (matchWait) {
        await new Promise((resolve) => setTimeout(resolve, Number.parseInt(matchWait?.groups.wait)));
        // and we continuen after that pause!
      }

      // If the Query contains an error instruction, we throw an error with the specified message. This is useful to test the error handling of the API calls.
      const matchError: any = string.match("#Error=(?<message>.*)#");
      if (matchError) {
        throw new Error(matchError?.groups.message);
        // and we stop there!
      }

      // If the Query contains a Records instruction, we should return that amount of recrods
      const matchNbRecords: any = string.match("#Records=(?<nb>[0-9]*)#");
      const nbTotalRecords = Number.parseInt(matchNbRecords?.groups?.nb ?? '0'); // If not specified, we return 0 records

      // We need the list of fields to return (hoping there is no subqueries!)
      const fields: string[] = string.match("SELECT (?<fields>.*) FROM ")?.groups?.fields.split(',').map((f) => f.trim()) ?? [];

      // If the query contains a not queryMore instruction, we get the max records before the error blows
      const matchNoSupportQueryMore: any = string.match("#NoSupportQueryMore,max=(?<nb>[0-9]*)#"); 
      if (matchNoSupportQueryMore) {
        const maxBeforeError = Number.parseInt(matchNoSupportQueryMore?.groups?.nb ?? '0'); // If not specified, we consider that there is no max 

        // If the query contains a LMIT statement
        const matchLimit: any = string.match(" LIMIT (?<size>[0-9]*)");
        const maxNbRecords = Number.parseInt(matchLimit?.groups?.size ?? '0'); // If not specified, we should consider that there is no limit
        if (matchLimit && maxNbRecords > maxBeforeError) {
            throw new Error('This entity does not support query more');
        }

        let realSize;
        if (this.nbRecordsSoFarForCustomQueryMore + maxNbRecords > nbTotalRecords) {
          realSize = nbTotalRecords - this.nbRecordsSoFarForCustomQueryMore;
          this.nbRecordsSoFarForCustomQueryMore = 0;
        } else {
          realSize = maxNbRecords;
          this.nbRecordsSoFarForCustomQueryMore += maxNbRecords;
        }
        const records: any[] = [];
        for (let i = 0; i < realSize; i++) {
          const record: any = {};
          fields?.forEach(field => record[field] = `${field}-${i}`);
          records.push(record);
        }
        return {
          records: records,
          done: true
        }
      }

      const matchSupportQueryMore = string.match("#SupportQueryMore,batchSize=(?<size>[0-9]*)#");
      const batchSize = Number.parseInt(matchSupportQueryMore?.groups?.size ?? '2000');
      const currentBatchSize = nbTotalRecords > batchSize ? batchSize : nbTotalRecords;
      const remaining = nbTotalRecords - currentBatchSize;
      const records: any = [];
      for (let i = 0; i < currentBatchSize; i++) {
        const record: any = {};
        fields?.forEach(field => record[field] = `${field}-${i}`);
        records.push(record);
      }
      return {
        records: records,
        done: remaining <= 0,
        nextRecordsUrl: `/next #Remaining=${remaining}# #SupportQueryMore,batchSize=${batchSize}# #Fields=${fields?.join(',')}#`
      }
    }

    async request(httpRequest: any) {
      if (httpRequest?.url?.startsWith('/limits/recordCount')) {
        return 0;
      }
      if (httpRequest?.url?.startsWith('/tooling/composite') || httpRequest?.url?.startsWith('/composite')) {
        const body = JSON.parse(httpRequest.body);
        return { 
          compositeResponse: body.compositeRequest.map((c: any) => {
            const parts = c.url.split('/');
            const type = parts[6];
            const member = parts[7];
            return { 
              httpStatusCode: 200, 
              body: { 
                type: type, 
                name: member, 
                a: 'a', b: 'b', c: 'c' 
              } 
            }
          })
        };
      }
      console.error(httpRequest);
    }

    async describeGlobal() {
      return { sobjects: [] }
    }

    async describe() {
      return {
        "activateable": false,
        "associateEntityType": null,
        "associateParentEntity": null,
        "createable": true,
        "custom": false,
        "customSetting": false,
        "deepCloneable": false,
        "deletable": true,
        "deprecatedAndHidden": false,
        "feedEnabled": false,
        "hasSubtypes": false,
        "isInterface": false,
        "isSubtype": false,
        "keyPrefix": "001",
        "label": "Account",
        "labelPlural": "Accounts",
        "layoutable": true,
        "mergeable": true,
        "mruEnabled": true,
        "name": "Account",
        "queryable": true,
        "replicateable": true,
        "retrieveable": true,
        "searchable": true,
        "triggerable": true,
        "undeletable": true,
        "updateable": true
      }
    }

    get tooling() { return this; }
 
    metadata = {
      list: async (requests: any[]): Promise<any[]> => {
        const matchNbMembers: any = requests[0].type.match("#Members=(?<nb>[0-9]*)#");
        const nbTotalMembers = Number.parseInt(matchNbMembers?.groups?.nb ?? '0'); // If not specified, we return 0 records
        const members: any[] = [];
        for (let i = 0; i<nbTotalMembers; i++ ) {
          members.push({ fullName: `member${i}` });
        }
        return members;
      },
      read: async (type: string, members: string[]) => {
        const matchNbMembers: any = type.match("#Members=(?<nb>[0-9]*)#");
        const nbTotalMembers = Number.parseInt(matchNbMembers?.groups?.nb ?? '0'); // If not specified, we return 0 records
        const allMembers: {fullName: string, a: string, b: string, c: string}[] = [];
        for (let i = 0; i<nbTotalMembers; i++ ) {
          allMembers.push({ fullName: `member${i}`, a: `a${i}`, b: `b${i}`, c: `c${i}` });
        }
        return allMembers?.filter((r) => members?.includes(r.fullName)) ?? [];
      }
    }
  }
}
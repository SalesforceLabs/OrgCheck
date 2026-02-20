export const jsforce: any = jest.mock('jsforce');

let nbRecordsSoFarForCustomQueryMore = 0;

const __queryMock = jest.fn(async function (soql: string) {

  // If the Query contains a wait instruction, we wait the specified time before returning the result. This is useful to test the timeout of the API calls.
  const matchWait: any = soql.match("#Wait=(?<wait>[0-9]*)#");
  const step1_sleep = new Promise((resolve) => setTimeout(resolve, matchWait ? Number.parseInt(matchWait?.groups.wait) : 0));

  // If the Query contains an error instruction, we throw an error with the specified message. This is useful to test the error handling of the API calls.
  const matchError: any = soql.match("#Error=(?<message>.*)#");
  const step2_error = new Promise((resolve, reject) => matchError ? reject(matchError?.groups.message) : resolve('ok'));

  // If the Query contains a Records instruction, we should return that amount of recrods
  const matchNbRecords: any = soql.match("#Records=(?<nb>[0-9]*)#");
  const nbTotalRecords = Number.parseInt(matchNbRecords?.groups?.nb ?? '0'); // If not specified, we return 0 records

  // We need the list of fields to return (hoping there is no subqueries!)
  const fields: string[] = soql.match("SELECT (?<fields>.*) FROM ")?.groups?.fields.split(',').map((f) => f.trim()) ?? [];

  // If the query contains a not queryMore instruction, we get the max records before the error blows
  const matchNoSupportQueryMore: any = soql.match("#NoSupportQueryMore,max=(?<nb>[0-9]*)#"); 
  const step3_return = new Promise((resolve, reject) => {
    if (matchNoSupportQueryMore) {
      const maxBeforeError = Number.parseInt(matchNoSupportQueryMore?.groups?.nb ?? '0'); // If not specified, we consider that there is no max 

      // If the query contains a LMIT statement
      const matchLimit: any = soql.match(" LIMIT (?<size>[0-9]*)");
      const maxNbRecords = Number.parseInt(matchLimit?.groups?.size ?? '0'); // If not specified, we should consider that there is no limit
      if (matchLimit && maxNbRecords > maxBeforeError) {
          reject('This entity does not support query more');
          return;
      }
      let realSize: number;
      if (nbRecordsSoFarForCustomQueryMore + maxNbRecords > nbTotalRecords) {
        realSize = nbTotalRecords - nbRecordsSoFarForCustomQueryMore;
        nbRecordsSoFarForCustomQueryMore = 0;
      } else {
        realSize = maxNbRecords;
        nbRecordsSoFarForCustomQueryMore += maxNbRecords;
      }
      const records: any[] = [];
      for (let i = 0; i < realSize; i++) {
        const record: any = {};
        fields?.forEach(field => record[field] = `${field}-${i}`);
        records.push(record);
      }
      resolve({
        records: records,
        done: true
      });
      return;
    }
    const matchSupportQueryMore = soql.match("#SupportQueryMore,batchSize=(?<size>[0-9]*)#");
    const batchSize = Number.parseInt(matchSupportQueryMore?.groups?.size ?? '2000');
    const currentBatchSize = nbTotalRecords > batchSize ? batchSize : nbTotalRecords;
    const remaining = nbTotalRecords - currentBatchSize;
    const records: any = [];
    for (let i = 0; i < currentBatchSize; i++) {
      const record: any = {};
      fields?.forEach(field => record[field] = `${field}-${i}`);
      records.push(record);
    }
    resolve({
      records: records,
      done: remaining <= 0,
      nextRecordsUrl: `/next #Remaining=${remaining}# #SupportQueryMore,batchSize=${batchSize}# #Fields=${fields?.join(',')}#`
    });
  })
  
  await step1_sleep;
  await step2_error;
  return await step3_return;
});

const __queryMoreMock = jest.fn(async function (locator: string) {
  const matchRemaining: any | null = locator.match("#Remaining=(?<remaining>[0-9]*)#");
  const remaining = Number.parseInt(matchRemaining?.groups.remaining);
  const matchFields: any = locator.match("#Fields=(?<fields>.*)#");
  const fields: any[]= matchFields?.groups.fields.split(',').map((f: string) => f.trim());
  const records: any = [];
  for (let i = 0; i < remaining; i++) {
    const record: any = {};
    fields.forEach(field => record[field] = `${field}-${i}`);
    records.push(record);
  }
  return Promise.resolve({
    records: records,
    totalSize: records.length,
    totalFetched: records.length
  });
});

const __requestMock = jest.fn(async function (httpRequest) {
  if (httpRequest?.url?.startsWith('/limits/recordCount')) {
    return Promise.resolve(0);
  }
  if (httpRequest?.url?.startsWith('/tooling/composite') || httpRequest?.url?.startsWith('/composite')) {
    const body = JSON.parse(httpRequest.body);
    return Promise.resolve({ 
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
    });
  }
  return Promise.reject('Request not supported')
});

const __describeGlobalMock = jest.fn(async function () {
  return Promise.resolve({ sobjects: [] });
});

const __describeMock = jest.fn(async function (type: string) {
  return Promise.resolve({
    "keyPrefix": "001",
    "label": `${type}`,
    "labelPlural": `${type}s`,
    "name": "Account",
  });
});

const __metadata_listMock = jest.fn(function (requests: any[]) {
  const matchNbMembers: any = requests[0].type.match("#Members=(?<nb>[0-9]*)#");
  const nbTotalMembers = Number.parseInt(matchNbMembers?.groups?.nb ?? '0'); // If not specified, we return 0 records
  const members: any[] = [];
  for (let i = 0; i<nbTotalMembers; i++ ) {
    members.push({ fullName: `member${i}` });
  }
  return Promise.resolve(members);
});

const __metadata_readMock = jest.fn(function (type: string, members: string[]) {
  const matchNbMembers: any = type.match("#Members=(?<nb>[0-9]*)#");
  const nbTotalMembers = Number.parseInt(matchNbMembers?.groups?.nb ?? '0'); // If not specified, we return 0 records
  const allMembers: {fullName: string, a: string, b: string, c: string}[] = [];
  for (let i = 0; i<nbTotalMembers; i++ ) {
    allMembers.push({ fullName: `member${i}`, a: `a${i}`, b: `b${i}`, c: `c${i}` });
  }
  return Promise.resolve(allMembers?.filter((r) => members?.includes(r.fullName)) ?? []);
});

jsforce.Connection = jest.fn().mockImplementation(() => {
  return {
      query: __queryMock,
      queryMore: __queryMoreMock,
      request: __requestMock,
      describeGlobal: __describeGlobalMock,
      describeMock: __describeMock,
      metadata: {
        list: __metadata_listMock,
        read: __metadata_readMock
      },
      tooling: {
        query: __queryMock,
        queryMore: __queryMoreMock,
        request: __requestMock
      }
  };
});

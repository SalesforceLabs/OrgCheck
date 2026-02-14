import { DatasetRunInformation } from "../../src/api/core/orgcheck-api-dataset-runinformation";
import { DatasetManagerIntf } from "../../src/api/core/orgcheck-api-datasetmanager";

export class DatasetManagerMock_DoingNothing implements DatasetManagerIntf {
  async run(_datasets: Array<string | DatasetRunInformation>): Promise<Map<string, any>> { return new Map(); }
  clean(_datasets: Array<string | DatasetRunInformation>): void { }
}
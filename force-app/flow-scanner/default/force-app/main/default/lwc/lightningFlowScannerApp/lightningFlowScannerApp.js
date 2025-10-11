import { LightningElement, api, track } from "lwc";
import { loadScript } from "lightning/platformResourceLoader";
import LFSStaticRessource from "@salesforce/resourceUrl/LFS_SR";

export default class lightningFlowScannerApp extends LightningElement {
  @api accessToken;
  @api userId;
  @track activeTab = 1;
  @track records = [];
  @track err;
  @track selectedFlowRecord = null;
  @track flowMetadata = null;
  @track flowName;
  @track scanResult;
  @track numberOfRules;
  @track rules = [];
  @track rulesConfig = null;
  @track isLoading = false;
  @track currentFlowIndex = 0;
  @track nextRecordsUrl;
  @track hasMoreRecords = false;
  conn;
  scriptLoaded = false;

  get isTab1Active() {
    return this.activeTab === 1;
  }

  get isTab2Active() {
    return this.activeTab === 2;
  }

  get isTab3Active() {
    return this.activeTab === 3;
  }

  get FlowsClass() {
    return this.activeTab === 1 ? "active" : "";
  }

  get AnalysisClass() {
    return this.activeTab === 2 ? "active" : "";
  }

  get ConfigClass() {
    return this.activeTab === 3 ? "active" : "";
  }

  async connectedCallback() {
    try {
      await Promise.all([
        loadScript(this, LFSStaticRessource + "/jsforce.js"),
        loadScript(this, LFSStaticRessource + "/LFS.js")
      ]);

      this.scriptLoaded = true;

      if (!window.lightningflowscanner) {
        console.error("lightningflowscanner not loaded correctly");
        return;
      }

      this.rules = window.lightningflowscanner
        .getRules()
        .map((rule, index) => ({
          id: `rule-${index}`,
          name: rule.name,
          description: rule.description,
          severity: rule.severity,
          category: rule.category,
          isActive: true
        }));

      this.rulesConfig = {
        rules: this.rules.reduce((acc, rule) => {
          acc[rule.name] = { severity: rule.severity };
          return acc;
        }, {})
      };

      if (!window.jsforce) {
        console.error("jsforce not loaded correctly");
        return;
      }

      const SF_API_VERSION = "60.0";
      this.conn = new window.jsforce.Connection({
        accessToken: this.accessToken,
        version: SF_API_VERSION,
        maxRequest: "10000"
      });

      await this.fetchFlows();
    } catch (error) {
      this.err = error.message;
      console.error("Error in connectedCallback:", error);
    }
  }

  async fetchFlows(searchTerm = "") {
    try {
      this.isLoading = true;
      let query = `SELECT Id, DeveloperName, ActiveVersionId, LatestVersionId, ActiveVersion.Status, ActiveVersion.MasterLabel, ActiveVersion.ProcessType, LatestVersion.Status, LatestVersion.MasterLabel, LatestVersion.ProcessType FROM FlowDefinition`;

      if (searchTerm) {
        const escapedSearchTerm = searchTerm.replace(/'/g, "\\'");
        query += ` WHERE DeveloperName LIKE '%${escapedSearchTerm}%' OR MasterLabel LIKE '%${escapedSearchTerm}%'`;
      }
      query += " LIMIT 50";

      const res = await this.conn.tooling.query(query);
      if (res && res.records) {
        const newRecords = this._processFlowRecords(res.records);

        this.records = searchTerm
          ? newRecords
          : [...this.records, ...newRecords];
        this.nextRecordsUrl = res.nextRecordsUrl;
        this.hasMoreRecords = !!res.nextRecordsUrl;

        if (this.records.length > 0 && !searchTerm) {
          this.selectedFlowRecord = this.records[0];
          this.currentFlowIndex = 0;
          await this.loadFlowMetadata(this.selectedFlowRecord);
        }
      }
    } catch (error) {
      this.err = error.message;
      console.error("Error in fetchFlows:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadMoreFlows() {
    if (!this.nextRecordsUrl || !this.hasMoreRecords) return;
    try {
      this.isLoading = true;
      const res = await this.conn.tooling.queryMore(this.nextRecordsUrl);
      if (res && res.records) {
        const newRecords = this._processFlowRecords(res.records);
        this.records = [...this.records, ...newRecords];
        this.nextRecordsUrl = res.nextRecordsUrl;
        this.hasMoreRecords = !!res.nextRecordsUrl;
      }
    } catch (error) {
      this.err = error.message;
      console.error("Error in loadMoreFlows:", error);
    } finally {
      this.isLoading = false;
    }
  }

  _processFlowRecords(records) {
    return records.map((record) => ({
      id: record.Id,
      developerName: record.DeveloperName,
      developerNameUrl: `/${record.Id}`,
      isActive: !!record.ActiveVersionId,
      masterLabel: record.ActiveVersionId
        ? record.ActiveVersion.MasterLabel
        : record.LatestVersion.MasterLabel,
      processType: record.ActiveVersionId
        ? record.ActiveVersion.ProcessType
        : record.LatestVersion.ProcessType,
      versionId: record.ActiveVersionId
        ? record.ActiveVersionId
        : record.LatestVersionId
    }));
  }

  async handleSearch(event) {
    const searchTerm = event.detail.searchTerm;
    this.records = [];
    this.nextRecordsUrl = null;
    this.hasMoreRecords = false;
    await this.fetchFlows(searchTerm);
  }

  async loadFlowMetadata(record) {
    try {
      this.isLoading = true;
      const id = record.versionId;
      const metadataRes = await this.conn.tooling.query(
        `SELECT Id, FullName, Metadata FROM Flow WHERE Id = '${id}' LIMIT 1`
      );

      if (metadataRes && metadataRes.records.length) {
        const flow = metadataRes.records[0];
        this.flowName = flow.FullName;
        this.flowMetadata = flow.Metadata;
        await this.scanFlow(this.rulesConfig);
      }
    } catch (error) {
      this.err = error.message;
      console.error("Error in loadFlowMetadata:", error);
    } finally {
      this.isLoading = false;
    }
  }

  async scanFlow(ruleOptions) {
    if (!this.scriptLoaded || !this.flowName || !this.flowMetadata) {
      return;
    }
    try {
      this.isLoading = true;

      if (!window.lightningflowscanner) {
        console.error("lightningflowscanner is not loaded");
        return;
      }

      this.numberOfRules =
        ruleOptions && ruleOptions.rules
          ? Object.keys(ruleOptions.rules).length
          : window.lightningflowscanner.getRules().length;

      const flow = new window.lightningflowscanner.Flow(
        this.flowName,
        this.flowMetadata
      );

      const uri =
        "/services/data/v60.0/tooling/sobjects/Flow/" +
        this.selectedFlowRecord.versionId;
      const parsedFlow = { uri, flow };

      try {
        const scanResults = window.lightningflowscanner.scan(
          [parsedFlow],
          ruleOptions
        );
        this.scanResult = scanResults[0];

        const activeRuleNames =
          ruleOptions && ruleOptions.rules
            ? Object.keys(ruleOptions.rules)
            : [];

        if (
          this.scanResult &&
          this.scanResult.ruleResults &&
          activeRuleNames.length > 0
        ) {
          this.scanResult.ruleResults = this.scanResult.ruleResults.filter(
            (ruleResult) => {
              if (!ruleResult.ruleName) {
                return false;
              }
              return activeRuleNames.includes(ruleResult.ruleName);
            }
          );
        }

        this.scanResult.ruleResults = this.scanResult.ruleResults.map(
          (ruleResult, ruleIndex) => {
            return {
              ...ruleResult,
              id: `rule-${ruleIndex}`,
              details: ruleResult.details.map((detail, detailIndex) => {
                return {
                  ...detail,
                  id: `rule-${ruleIndex}-detail-${detailIndex}`
                };
              })
            };
          }
        );
      } catch (e) {
        this.err = e.message;
      }
    } catch (error) {
      this.err = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  handleTabClick(event) {
    this.activeTab = parseInt(event.currentTarget.dataset.tab, 10);
  }

  async handleScanFlow(event) {
    const flowId = event.detail.flowId;
    const record = this.records.find((rec) => rec.id === flowId);
    if (record) {
      this.isLoading = true;
      this.selectedFlowRecord = record;
      this.currentFlowIndex = this.records.findIndex(
        (rec) => rec.id === flowId
      );
      try {
        await this.loadFlowMetadata(record);
        this.activeTab = 2;
      } catch (error) {
        this.err = error.message;
      }
    }
  }

  async handleRuleChange(event) {
    const updatedRules = event.detail.rules;
    this.rules = updatedRules;
    this.rulesConfig = {
      rules: updatedRules
        .filter((rule) => rule.isActive)
        .reduce((acc, rule) => {
          acc[rule.name] = { severity: rule.severity };
          return acc;
        }, {})
    };

    if (this.flowName && this.flowMetadata && this.selectedFlowRecord) {
      await this.scanFlow(this.rulesConfig);
    }
  }

  async handleNavigateFlow(event) {
    const direction = event.detail.direction;
    if (!this.records || this.records.length === 0) return;

    let newIndex = this.currentFlowIndex;
    if (direction === "previous" && newIndex > 0) {
      newIndex--;
    } else if (direction === "next" && newIndex < this.records.length - 1) {
      newIndex++;
    }

    if (newIndex !== this.currentFlowIndex) {
      this.isLoading = true;
      this.currentFlowIndex = newIndex;
      this.selectedFlowRecord = this.records[newIndex];
      try {
        await this.loadFlowMetadata(this.selectedFlowRecord);
        this.activeTab = 2;
      } catch (error) {
        this.err = error.message;
      }
    }
  }
}

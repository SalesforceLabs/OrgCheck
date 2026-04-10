import orgcheck from '@orgcheck/api';

export class OrgCheckSfPluginStorageSetup implements orgcheck.StorageSetup {
  private map: Map<string, string>;

  public constructor() {
    this.map = new Map<string, string>();
  }

  public setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  public getItem(key: string): string {
    return this.map.get(key) ?? '';
  }

  public removeItem(key: string): void {
    this.map.delete(key);
  }

  public key(n: number): string {
    return Array.from(this.map.keys())[n] ?? '';
  }

  public length(): number {
    return this.map.size;
  }
}

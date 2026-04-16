import orgcheck from '@orgcheck/api';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export class OrgCheckSfPluginStorageSetup implements orgcheck.StorageSetup {
  private static readonly STORAGE_DIR_NAME = '.orgcheck';
  private static readonly STORAGE_FILE_EXTENSION = '.ocs';
  private readonly storageDirectoryPath: string;

  public constructor(orgId: string) {
    this.storageDirectoryPath = path.join(os.homedir(), OrgCheckSfPluginStorageSetup.STORAGE_DIR_NAME, this.sanitizeKey(orgId));
    fs.mkdirSync(this.storageDirectoryPath, { recursive: true });
  }

  public setItem(key: string, value: string): void {
    const filePath: string = this.getFilePathForKey(key);
    fs.writeFileSync(filePath, value, 'utf8');
  }

  public getItem(key: string): string {
    const filePath: string = this.getFilePathForKey(key);
    if (!fs.existsSync(filePath)) {
      return '';
    }

    return fs.readFileSync(filePath, 'utf8');
  }

  public removeItem(key: string): void {
    const filePath: string = this.getFilePathForKey(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  public key(n: number): string {
    if (n < 0) {
      return '';
    }

    const keys: string[] = this.getStoredKeys();
    return keys[n] ?? '';
  }

  public length(): number {
    return this.getStoredKeys().length;
  }

  private getStoredKeys(): string[] {
    const entries: string[] = fs.readdirSync(this.storageDirectoryPath, { encoding: 'utf8', withFileTypes: false });
    return entries
      .filter((entry: string): boolean => entry.endsWith(OrgCheckSfPluginStorageSetup.STORAGE_FILE_EXTENSION))
      .map((entry: string): string => entry.slice(0, -OrgCheckSfPluginStorageSetup.STORAGE_FILE_EXTENSION.length))
      .sort();
  }

  private getFilePathForKey(key: string): string {
    const keyFileName: string = `${this.sanitizeKey(key)}${OrgCheckSfPluginStorageSetup.STORAGE_FILE_EXTENSION}`;
    return path.join(this.storageDirectoryPath, keyFileName);
  }

  private sanitizeKey(key: string): string {
    // Keep filenames portable and prevent path traversal or nested paths.
    const sanitizedKey: string = key.replaceAll(/[^a-zA-Z0-9._-]/g, '_');
    return sanitizedKey.length > 0 ? sanitizedKey : '_';
  }
}
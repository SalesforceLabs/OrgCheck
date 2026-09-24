let orgInstanceUrl = '';

export function setOrgInstanceUrl(url: string): void {
  orgInstanceUrl =
    typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))
      ? url.replace(/\/+$/, '')
      : '';
}

export function getOrgInstanceUrl(): string {
  return orgInstanceUrl;
}

export function clearOrgInstanceUrl(): void {
  orgInstanceUrl = '';
}

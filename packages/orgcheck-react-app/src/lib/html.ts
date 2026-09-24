import { getOrgInstanceUrl } from '@/lib/org-instance-url';

export function escapeHtml(unsafe: unknown): string {
  if (unsafe === undefined || Number.isNaN(unsafe) || unsafe === null) return '';
  if (typeof unsafe !== 'string') return String(unsafe);
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function isSafeHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return value.startsWith('/') && !value.startsWith('//');
  }
}

/**
 * Org Check setup URLs are relative (`/lightning/...`) because the LWC app is hosted in the org.
 * Prefix them with the Salesforce instance URL when we have it (OAuth `instance_url`).
 * Do not invent a host: without an instance URL, keep the relative path.
 */
export function toSalesforceHref(value: unknown, instanceUrl?: string): string {
  if (typeof value !== 'string' || value.length === 0) return '';
  const href = value.trim();
  if (href.startsWith('https://') || href.startsWith('http://')) {
    return isSafeHttpUrl(href) ? href : '';
  }
  if (!href.startsWith('/') || href.startsWith('//')) return '';
  const resolved =
    typeof instanceUrl === 'string' && instanceUrl.length > 0
      ? instanceUrl
      : getOrgInstanceUrl();
  const base = resolved.trim().replace(/\/+$/, '');
  if (base.startsWith('https://') || base.startsWith('http://')) {
    return `${base}${href}`;
  }
  return href;
}

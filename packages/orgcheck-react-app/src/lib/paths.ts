function readSfdcEnv(): Window['SFDC_ENV'] {
  return window.SFDC_ENV ?? (globalThis as typeof globalThis & Window).SFDC_ENV;
}

export function getRouterBasename(): string {
  const fromEnv = readSfdcEnv()?.basePath;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    const trimmed = fromEnv.replace(/\/+$/, '');
    return trimmed.length > 0 ? trimmed : '/';
  }
  const base = document.querySelector('base');
  if (base?.href) {
    return new URL(base.href).pathname.replace(/\/$/, '') || '/';
  }
  return '/';
}

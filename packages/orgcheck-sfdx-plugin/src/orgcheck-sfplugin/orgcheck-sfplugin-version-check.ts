const REGISTRY_URL = 'https://registry.npmjs.org/@orgcheck%2fsfdx-plugin/latest';
const REQUEST_TIMEOUT_MS = 3000;
const MAX_RESPONSE_CHARS = 1000000;

/**
 * @description Check if the current version is the latest version
 * @param {string | undefined} currentVersion The current version
 * @returns {Promise<boolean>} True if the current version is the latest version, false otherwise
 */
export async function ifCurrentVersionIsNPMVersion(currentVersion: string | undefined): Promise<boolean> {
  try {
    // Check the lastest version
    const response = await globalThis.fetch(REGISTRY_URL, {
      method: 'GET',
      redirect: 'error',
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    // Check if the response was ok
    if (!response.ok) {
      return false;
    }
    // Get the text of the response
    const text = await response.text();
    // Check if the response is not too long
    if (text.length > MAX_RESPONSE_CHARS) {
      return false;
    }
    // Parse the text as a JSON structure and retrieve the version value
    let lastestVersion: string | undefined = '';
    JSON.parse(text, (key, value) => {if (key === 'version') lastestVersion = value; });
    if (!lastestVersion) {
      return false;
    }
    // Compare the current version with the latest version
    if (currentVersion === lastestVersion) {
      return true;
    }
  } catch (error) {}
  return false;
}
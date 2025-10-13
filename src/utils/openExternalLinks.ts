export const isExternalLink = (url: string, currDomain: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname !== currDomain && urlObj.protocol !== 'mailto:';
  } catch {
    console.warn(`Invalid URL: ${url}`);
    return false;
  }
};

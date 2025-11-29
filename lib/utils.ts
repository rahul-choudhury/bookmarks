export function isUrl(url: string) {
  const urlRegex = /^(https?:\/\/)|([\w-]+\.)+[\w-]+(\/.*)?$/i;
  if (url.match(urlRegex)) return true;
  return false;
}

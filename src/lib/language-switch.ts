// Target of the header language switch. The blog, contact and MCP pages
// exist in every locale, so the switch keeps the reader there. Any other
// page sends the reader to the home page of the chosen locale. The result
// is a path without the locale prefix: pass it to localePath().

export function languageSwitchPath(pathname: string): string {
  if (/\/blog\//.test(pathname)) return '/blog/'
  if (/\/contact\/$/.test(pathname)) return '/contact/'
  if (/\/mcp\/$/.test(pathname)) return '/mcp/'
  return '/'
}

// The one public address. Every mailto on the site is built here, so the
// address stays identical on every page and in every locale.
export const CONTACT_EMAIL = 'hello@zenzu.app'

export function mailtoHref(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

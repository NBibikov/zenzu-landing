// The one public address. The footer, the home page and the contact page
// build their mailto links here, so the address and subject match in every
// locale.
export const CONTACT_EMAIL = 'hello@zenzu.app'

export function mailtoHref(subject: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`
}

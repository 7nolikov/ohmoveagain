/**
 * Prefix every test path with the site subpath so tests work both locally
 * (no subpath, direct serve) and in CI (served under /ohmoveagain/).
 *
 * Local dev:  SITE_SUBPATH unset  → site('/pipeline/') = '/pipeline/'
 * CI:         SITE_SUBPATH=/ohmoveagain → site('/pipeline/') = '/ohmoveagain/pipeline/'
 */
export const SUBPATH = process.env.SITE_SUBPATH ?? '';

export function site(path: string): string {
  return SUBPATH + path;
}

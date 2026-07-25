/**
 * Prefix every test path with the site subpath.
 *
 * Since the move to ohmoveagain.com (2026-07-25) the site is served at the
 * root everywhere, so SITE_SUBPATH is unset in CI and this is a no-op. It is
 * kept rather than inlined because it is the seam that made that move a
 * config change instead of a rewrite of every spec.
 *
 * Unset:                  site('/pipeline/') = '/pipeline/'
 * SITE_SUBPATH=/foo →     site('/pipeline/') = '/foo/pipeline/'
 */
export const SUBPATH = process.env.SITE_SUBPATH ?? '';

export function site(path: string): string {
  return SUBPATH + path;
}

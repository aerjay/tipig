// Encode a URL for safe use inside an HTML `srcset`/`<source srcSet>` value.
//
// `srcset` is whitespace- and comma-delimited: a space separates a candidate's
// URL from its (optional) width/density descriptor, and a comma separates
// candidates. So a URL containing a literal space or comma — e.g. a photo under
// ".../united states/01.JPG" — is silently mis-parsed, the candidate is dropped,
// and the <source> fails to match (the <img> fallback loads instead). Plain
// `src`/`href` auto-encode these, but `srcset` does not — hence this helper.
export const srcsetUrl = (url: string): string => url.replace(/ /g, "%20").replace(/,/g, "%2C");

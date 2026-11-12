/**
 * Is this hostname a government site? Governments don't share one naming scheme, so this checks the
 * common patterns (gov.uk, .gov, gov.sg, gouv.fr, go.jp, gc.ca, govt.nz, europa.eu ...) and then a short
 * list of official bodies that sit on other domains. Domains the user or the Search step confirm
 * can be passed in as `extra`.
 */
const GOV_PATTERNS = [
  /(^|\.)gov(\.[a-z]{2,3})?$/, // usa.gov, gov.uk, gov.sg, gov.au, gov.in
  /(^|\.)govt\.[a-z]{2}$/, // govt.nz
  /(^|\.)gouv(\.[a-z]{2,3})?$/, // gouv.fr, gouv.qc.ca
  /(^|\.)gob(\.[a-z]{2})?$/, // gob.mx, gob.es
  /(^|\.)go\.[a-z]{2}$/, // go.jp, go.kr, go.id, go.th
  /(^|\.)gc\.ca$/,
  /(^|\.)canada\.ca$/,
  /(^|\.)europa\.eu$/,
  /(^|\.)mil$/,
  /(^|\.)admin\.ch$/,
  /(^|\.)bund\.de$/,
  /(^|\.)overheid\.nl$/,
  /(^|\.)government\.[a-z]{2}$/, // government.nl, government.se
  /(^|\.)gov\.[a-z]{2,3}\.[a-z]{2}$/, // gov.bc.ca, gov.on.ca
  /(^|\.)(state|ci|co|city|county)\.[a-z-]+\.us$/, // state.ny.us, ci.austin.tx.us
  /(^|\.)(ontario|alberta|quebec|novascotia)\.ca$/,
];

const KNOWN_OFFICIAL = [
  "legislation.gov.uk", "caa.co.uk", "hse.gov.uk", "service.gov.uk", "nidirect.gov.uk",
  "nyc.gov", "ny.gov", "faa.gov", "irs.gov", "sba.gov",
  "casa.gov.au", "business.gov.au", "ato.gov.au",
  "tc.canada.ca", "easa.europa.eu",
  "service-public.fr", "entreprendre.service-public.fr", "gesetze-im-internet.de",
  "caas.gov.sg", "gobusiness.gov.sg",
  "dubai.ae", "u.ae", "tamm.abudhabi",
  "amsterdam.nl", "kvk.nl", "belastingdienst.nl", "berlin.de", "service.berlin.de", "paris.fr",
  "cityoflondon.gov.uk", "tokyo.lg.jp",
];

export function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isOfficialHost(host: string, extra: string[] = []): boolean {
  const h = host.toLowerCase().replace(/^www\./, "");
  if (GOV_PATTERNS.some((p) => p.test(h))) return true;
  if (/\.lg\.jp$/.test(h)) return true;
  return [...KNOWN_OFFICIAL, ...extra].some((d) => h === d || h.endsWith(`.${d}`));
}

export function isOfficialUrl(url: string, extra: string[] = []): boolean {
  const h = hostOf(url);
  return h ? isOfficialHost(h, extra) : false;
}

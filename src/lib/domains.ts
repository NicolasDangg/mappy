import { hostOf, isOfficialHost } from "./official";
import { search } from "./tinyfish";

/**
 * TinySearch step: before any research is paid for, find which government sites actually cover this
 * activity in each place. The hosts found steer TinyResearch (as preferred domains) and are later used
 * to judge whether a cited link is official. A place with no government site found is reported, not hidden.
 */
export async function discoverOfficialDomains(
  activity: string,
  places: string[],
): Promise<{ domains: string[]; byPlace: Record<string, string[]>; missing: string[] }> {
  const byPlace: Record<string, string[]> = {};
  await Promise.all(
    places.map(async (place) => {
      const queries = [
        `${place} government licence permit requirements to ${activity}`,
        `${place} official government register a business fees`,
      ];
      const hits = (
        await Promise.all(
          queries.map((q) =>
            search(q, { purpose: "Find the official government websites that publish licensing rules and fees for this activity in this place" }).catch(() => []),
          ),
        )
      ).flat();
      const hosts = new Map<string, number>();
      for (const h of hits) {
        const host = hostOf(h.url);
        if (host && isOfficialHost(host)) hosts.set(host, (hosts.get(host) ?? 0) + 1);
      }
      byPlace[place] = [...hosts.entries()].sort((a, b) => b[1] - a[1]).map(([h]) => h).slice(0, 12);
    }),
  );
  const domains = [...new Set(Object.values(byPlace).flat())];
  const missing = places.filter((p) => !byPlace[p]?.length);
  return { domains, byPlace, missing };
}

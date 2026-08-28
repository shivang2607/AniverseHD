// Shared helpers for the embed-style streaming providers (megaplay, tryembed,
// hnembed). These consolidate the episode-id / dub parsing and embed payload
// construction that previously lived inline in each provider's streamingData
// handler inside src/app/watch/[id]/providersConfig.js.
//
// Keeping this in one module means a fix to episode resolution or dub handling
// applies to every embed provider at once instead of being copy-pasted.

/**
 * Coerce an episode reference into a positive integer episode number.
 *
 * Callers may pass either a raw number/string (e.g. "12", 12) or an object
 * carrying `episodeNumber` (as emitted by the episode-list resolvers). Any
 * value that is not a finite number strictly greater than zero falls back to 1.
 *
 * @param {number|string|{episodeNumber: number}} episodeRef
 * @returns {number}
 */
export function resolveEpisodeNumber(episodeRef) {
  const raw =
    typeof episodeRef === "object" && episodeRef !== null
      ? episodeRef?.episodeNumber
      : episodeRef;
  const ep = Number(typeof raw === "string" ? raw.trim() : raw);
  return Number.isFinite(ep) && ep > 0 ? ep : 1;
}

/**
 * Normalise the dub flag produced by the UI ('1' | '0' | true | false) into
 * the canonical string form expected by the embed provider HTTP APIs.
 *
 * @param {string|boolean} dub
 * @returns {'1'|'0'}
 */
export function toDubFlag(dub) {
  return dub === "1" || dub === true ? "1" : "0";
}

/**
 * Ensure a provider-supplied referer is a plain http(s) URL. Anything else
 * (javascript:, data:, vbscript:, etc.) is rejected so it can never end up in
 * the iframe source, preventing URL-scheme injection through provider data.
 *
 * @param {string} [referer]
 * @returns {string|undefined}
 */
export function safeReferer(referer) {
  if (typeof referer !== "string" || referer.length === 0) return undefined;
  try {
    const u = new URL(referer);
    return u.protocol === "http:" || u.protocol === "https:" ? referer : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Build the standard embed stream payload returned to the watch page.
 *
 * @param {{embedUrl?: string, referer?: string}} data raw provider response
 * @param {string|boolean} dub raw dub flag (used only for the isDub source tag)
 * @returns {object|null}
 */
export function buildEmbedStream(data, dub) {
  if (!data?.embedUrl) return null;

  const referer = safeReferer(data.referer);

  return {
    sources: [{
      url: data.embedUrl,
      type: "iframe",
      isDub: Boolean(dub),
      ...(referer ? { referer } : {}),
    }],
    tracks: [],
    intro: null,
    outro: null,
    headers: null,
    isEmbed: true,
  };
}

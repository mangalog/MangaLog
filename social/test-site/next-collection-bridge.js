/* MangaLog Next: pure, opt-in projection of existing Collection into Social comparison.
 * NEVER reaches production Supabase, reads localStorage, or uploads data by itself.
 * Input: a collection snapshot {series:[{title,edition,publisher,owned,specialVolumes}]}.
 * Output: owned volume rows only, suitable for social_collection_volumes after explicit consent.
 * Keep this logic out of the production branch until the unified Next account model is tested.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.MangaLogCollectionBridge = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const MAX_KEY = 160;
  const MAX_TITLE = 200;
  function text(value, fallback, max) {
    const s = String(value == null ? '' : value).trim().replace(/\s+/g, ' ');
    return (s || fallback).slice(0, max);
  }
  function slug(value) {
    return String(value ?? '').normalize('NFKC').toLocaleLowerCase('it-IT')
      .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'sconosciuto';
  }
  function hash32(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h.toString(16).padStart(8, '0');
  }
  function makeKey(title, edition, publisher, specialLabel) {
    // Publisher and edition prevent accidental collisions among different Italian editions.
    // Special volumes are separate, because their numbers may overlap regular volumes.
    const parts = [slug(title), slug(edition), slug(publisher)];
    if (specialLabel) parts.push('speciale', slug(specialLabel));
    const full = parts.join('::');
    return full.length <= MAX_KEY ? full : full.slice(0, MAX_KEY - 10) + '::' + hash32(full);
  }
  function ownedNumbers(value) {
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map(Number).filter(n => Number.isSafeInteger(n) && n > 0 && n <= 10000))]
      .sort((a,b) => a-b);
  }
  function buildSnapshot(payload) {
    if (!payload || !Array.isArray(payload.series)) {
      throw new TypeError('Serve un archivio MangaLog con una lista series valida');
    }
    const rows = new Map();
    for (const series of payload.series) {
      if (!series || typeof series !== 'object') continue;
      const title = text(series.title, 'Senza titolo', 120);
      const edition = text(series.edition, 'Edizione regolare', 100);
      const publisher = text(series.publisher, 'Non specificato', 100);
      const seriesKey = makeKey(title, edition, publisher);
      for (const number of ownedNumbers(series.owned)) {
        const key = seriesKey + '|' + number;
        rows.set(key, {series_key:seriesKey,series_title:title,volume_number:number});
      }
      if (Array.isArray(series.specialVolumes)) {
        for (const special of series.specialVolumes) {
          if (!special || special.owned !== true) continue;
          const number = Number(special.number);
          if (!Number.isSafeInteger(number) || number < 1 || number > 10000) continue;
          const label = text(special.label, 'Volume speciale', 100);
          const specialKey = makeKey(title, edition, publisher, label);
          rows.set(specialKey + '|' + number, {
            series_key:specialKey,
            series_title:text(title + ' — ' + label, title, MAX_TITLE),
            volume_number:number
          });
        }
      }
    }
    return [...rows.values()].sort((a,b)=>
      a.series_key.localeCompare(b.series_key, 'it') || a.volume_number-b.volume_number);
  }
  // Compute an exact replacement set: removed volumes must disappear from Social after sync.
  // The caller decides whether to push this diff, with ownership + privacy enforced by RLS.
  function diffSnapshots(previousRows, currentRows) {
    const key = x => x.series_key + '|' + x.volume_number;
    const previous = new Map((previousRows || []).map(x=>[key(x),x]));
    const current = new Map((currentRows || []).map(x=>[key(x),x]));
    return {
      upsert:[...current.values()].filter(x=>{
        const before=previous.get(key(x));
        return !before || before.series_title !== x.series_title;
      }),
      remove:[...previous.values()].filter(x=>!current.has(key(x)))
    };
  }
  return Object.freeze({buildSnapshot,diffSnapshots,makeKey});
});

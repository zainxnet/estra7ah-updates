'use strict';
const crypto = require('node:crypto');

// records keeps section-specific IDs/parents as compatibility memberships.
// The folder/file payload is immutable and stored once, addressed by its hash;
// replacing the membership hash also updates the existing revision journal.
function initialize(db) {
  db.exec('CREATE TABLE IF NOT EXISTS shared_scan_payloads (hash TEXT PRIMARY KEY,payload TEXT NOT NULL)');
}

function writer(db) {
  initialize(db);
  const save = db.prepare('INSERT OR IGNORE INTO shared_scan_payloads(hash,payload) VALUES (?,?)');
  return record => {
    const { id, sectionId, inItem, ...shared } = record;
    const fileRefs = Array.isArray(shared.files) ? shared.files.map(file =>
      file.itemId === id ? file.id : [file.id, file.itemId]) : undefined;
    if (Array.isArray(shared.files)) shared.files = shared.files.map(({ id, itemId, ...file }) => file);
    const payload = JSON.stringify(shared);
    const hash = crypto.createHash('sha256').update(payload).digest('hex');
    save.run(hash, payload);
    return JSON.stringify({ $sharedScan: 1, shared: hash, id, sectionId, path: record.path, inItem, fileRefs });
  };
}

function reader(db) {
  let select;
  // A bounded per-read cache avoids repeatedly parsing large shared series/file
  // lists without retaining the whole library in the server process.
  const cached = new Map();
  return payload => {
    const membership = typeof payload === 'string' ? JSON.parse(payload) : payload;
    if (membership?.$sharedScan !== 1) return membership;
    let shared = cached.get(membership.shared);
    if (!shared) {
      select ||= db.prepare('SELECT payload FROM shared_scan_payloads WHERE hash=?');
      const row = select.get(membership.shared);
      if (!row) throw Error('Missing shared scan payload: ' + membership.shared);
      shared = JSON.parse(row.payload);
      if (cached.size >= 100) cached.delete(cached.keys().next().value);
      cached.set(membership.shared, shared);
    }
    const record = { ...shared, id: membership.id, sectionId: membership.sectionId };
    if (Object.hasOwn(membership, 'inItem')) record.inItem = membership.inItem;
    if (Array.isArray(shared.files)) record.files = shared.files.map((file, index) => {
      const reference = membership.fileRefs?.[index];
      if (reference === undefined) throw Error('Missing shared scan file reference');
      return { ...file, id: Array.isArray(reference) ? reference[0] : reference,
        itemId: Array.isArray(reference) ? reference[1] : membership.id };
    });
    // Callers may mutate metadata; never share their nested objects with another
    // section's hydrated membership.
    return structuredClone(record);
  };
}

module.exports = { initialize, writer, reader, hydrate: (db, payload) => reader(db)(payload) };

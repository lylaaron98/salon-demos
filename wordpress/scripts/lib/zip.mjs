/**
 * Minimal ZIP writer shared by the theme builds (store) and the release packager (deflate).
 */
import { crc32, deflateRawSync } from "node:zlib";

/** MS-DOS time (low word) and date (high word) for 1980-01-01 00:00. */
const DOS_EPOCH = ((1 << 5) | 1) << 16;

/**
 * Write a ZIP archive. Entries are stored unless `deflate` is set (the kit is a few KB; release
 * zips are deflated). Fixed timestamps keep builds reproducible.
 *
 * @param {Array<{name: string, data: Buffer}>} entries
 * @param {{deflate?: boolean}} [options]
 */
export function zip(entries, { deflate = false } = {}) {
  const local = [];
  const central = [];
  let offset = 0;
  for (const { name, data: raw } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(raw);
    const deflated = deflate ? deflateRawSync(raw, { level: 9 }) : null;
    const method = deflated && deflated.length < raw.length ? 8 : 0;
    const data = method === 8 ? deflated : raw;
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); // version needed
    header.writeUInt16LE(0x0800, 6); // UTF-8 names
    header.writeUInt16LE(method, 8); // 0 stored, 8 deflated
    header.writeUInt32LE(DOS_EPOCH, 10); // time 00:00, date 1980-01-01 (reproducible builds)
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(raw.length, 22);
    header.writeUInt16LE(nameBuf.length, 26);
    header.writeUInt16LE(0, 28);
    local.push(header, nameBuf, data);

    const dir = Buffer.alloc(46);
    dir.writeUInt32LE(0x02014b50, 0);
    dir.writeUInt16LE(20, 4);
    dir.writeUInt16LE(20, 6);
    dir.writeUInt16LE(0x0800, 8);
    dir.writeUInt16LE(method, 10);
    dir.writeUInt32LE(DOS_EPOCH, 12);
    dir.writeUInt32LE(crc, 16);
    dir.writeUInt32LE(data.length, 20);
    dir.writeUInt32LE(raw.length, 24);
    dir.writeUInt16LE(nameBuf.length, 28);
    dir.writeUInt32LE(offset, 42);
    central.push(dir, nameBuf);
    offset += header.length + nameBuf.length + data.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, ...central, end]);
}

/**
 * Generating consistent IDs for different files, in order to avoid having to
 * have an md5 hash dependency.
 *
 * Scratch requires IDs to look like md5 hashes, but they don't need to actually
 * be md5 hashes
 *
 * @private
 */

import { v4 as uuidv4 } from "uuid";

const ids = new Map<ReadableStream<Uint8Array>, string>();

export const idFor = (file: ReadableStream<Uint8Array>) => {
  const got = ids.get(file);
  if (got) {
    return got;
  }
  const id = uuidv4().replace(/-/g, "");
  ids.set(file, id);
  return id;
};

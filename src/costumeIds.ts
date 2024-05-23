/**
 * Generating consistent IDs for different files, in order to avoid having to
 * have an md5 hash dependency.
 *
 * Scratch requires IDs to look like md5 hashes, but they don't need to actually
 * be md5 hashes
 *
 * @private
 */

const ids = new Map<ArrayBufferLike, string>();

export const idFor = (file: ArrayBufferLike) => {
  const got = ids.get(file);
  if (got) {
    return got;
  }
  const id = crypto.randomUUID().replace(/-/g, "");
  ids.set(file, id);
  return id;
};

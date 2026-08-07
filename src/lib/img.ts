import type { ImageMetadata } from 'astro';

// Eagerly import every content image so pages can resolve one by file name
// (e.g. img('1728469876516-17a32611eb24.jpg')) and pass it to <Image />.
const files = import.meta.glob<{ default: ImageMetadata }>(
  '../assets/img/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const map: Record<string, ImageMetadata> = {};
for (const [path, mod] of Object.entries(files)) {
  const name = path.split('/').pop()!;
  map[name] = mod.default;
}

/** Resolve a content image by file name (as stored in public/img before). */
export function img(name: string): ImageMetadata {
  const file = name.replace(/^\/?img\//, '');
  const found = map[file];
  if (!found) throw new Error(`Image not found in src/assets/img: ${file}`);
  return found;
}

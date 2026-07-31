/**
 * Cache-Control max-age (seconds) applied to uploaded images.
 *
 * Uploads are written to a unique path (`<folder>/<timestamp>-<random>.<ext>`),
 * so an object at a given URL never changes — replacing an image produces a new
 * URL. That makes the objects immutable and safe to cache for a year.
 *
 * Supabase Storage otherwise serves `cache-control: no-cache`, which prevents
 * both the browser and the image CDN from holding onto the original. Egress
 * then recurs for every revalidation instead of being a one-off per image,
 * which is the main way an image-heavy catalog runs up a storage bill.
 */
export const IMAGE_CACHE_CONTROL = "31536000";

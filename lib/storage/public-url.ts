import { storage } from "@/lib/config/env";

/**
 * A delivery URL for a publicly-uploaded Cloudinary image.
 *
 * Built by string construction rather than through the SDK, because this is
 * called while rendering and the SDK's `url()` requires `cloudinary.config()`
 * to have run, which means importing a module that reads the API secret. A
 * public delivery URL needs no secret at all: it is the cloud name, a
 * transformation, and the public_id.
 *
 * The transformation is not cosmetic. A review photo is whatever came off
 * somebody's phone, and rendering a 4000px JPEG into a 48px circle ships
 * several megabytes to do it. `c_fill,g_face` crops to the face rather than the
 * centre, so a photo taken in landscape does not become a picture of someone's
 * shoulder.
 */
export function cloudinaryImageUrl(
  publicId: string,
  options: { width: number; height: number } = { width: 192, height: 192 }
): string {
  if (!publicId || !storage.isConfigured) return "";

  const { cloudName } = storage.credentials;

  const transformation = [
    `w_${options.width}`,
    `h_${options.height}`,
    "c_fill",
    "g_face",
    /* `f_auto` serves AVIF or WebP by Accept header, `q_auto` picks a quality
       per image rather than a fixed number; together they are usually a 60-80%
       saving over the original with no visible difference at this size. */
    "f_auto",
    "q_auto",
    /* Retina without doubling the requested dimensions in every caller. */
    "dpr_2.0",
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * A delivery URL for a publicly-uploaded Cloudinary video.
 *
 * `q_auto` and `f_auto` do for video what they do for images: Cloudinary
 * transcodes and serves whichever container the browser accepts, so a 40MB
 * screen recording reaches a visitor as a few megabytes of WebM or MP4 without
 * anybody exporting two versions by hand.
 *
 * No dimensions, unlike the image helper. A demo clip is shown at whatever
 * width its frame gives it, and forcing a crop would cut off the part of the UI
 * the recording was made to show.
 */
export function cloudinaryVideoUrl(publicId: string): string {
  if (!publicId || !storage.isConfigured) return "";
  const { cloudName } = storage.credentials;
  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto,f_auto/${publicId}`;
}

/**
 * A still from a video, for the poster frame.
 *
 * Cloudinary generates one by changing the extension, so a clip needs no
 * separately uploaded thumbnail. `so_0` takes the first frame; without it the
 * default is the middle, which on a screen recording is often a half-finished
 * interaction.
 */
export function cloudinaryVideoPoster(
  publicId: string,
  options: { width: number; height: number } = { width: 1200, height: 750 }
): string {
  if (!publicId || !storage.isConfigured) return "";
  const { cloudName } = storage.credentials;
  const transformation = [
    `w_${options.width}`,
    `h_${options.height}`,
    "c_fill",
    "so_0",
    "f_auto",
    "q_auto",
  ].join(",");
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformation}/${publicId}.jpg`;
}

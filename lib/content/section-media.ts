import type { Media } from "@/components/shared/media-placeholder";
import { storage } from "@/lib/config/env";
import {
  cloudinaryImageUrl,
  cloudinaryVideoPoster,
  cloudinaryVideoUrl,
} from "@/lib/storage/public-url";

/**
 * What a stored media frame becomes when the page renders it.
 *
 * Its own module, and deliberately not `server-only`, so it can be tested
 * directly rather than through a page. Everything it does is a decision that
 * only shows up in the markup: which Cloudinary namespace a clip comes from,
 * whether a poster is generated or uploaded, and which of two possible sources
 * wins. A test that has to publish a post and read a screenshot to check any
 * of that would be testing the publishing flow instead.
 *
 * Returning a frame with no `src` is not a failure. `SectionMedia` draws the
 * dashed placeholder for it, which is the same box the posts written before
 * uploads existed have always had, and is how an author marks where a diagram
 * goes before drawing it.
 */
export type StoredSectionMedia = {
  type?: string;
  publicId?: string;
  src?: string;
  alt?: string;
  caption?: string;
  poster?: string;
};

/*
  1600 wide because a body image spans the article column on a large screen and
  is likely a diagram or a screenshot with text in it, where the difference
  between 1200 and 1600 is legibility rather than polish. No height, so it
  scales whole instead of being cropped to a ratio: see `cloudinaryImageUrl`.
*/
const BODY_IMAGE_WIDTH = 1600;

export function sectionMediaOf(
  media: StoredSectionMedia | null | undefined
): Media | undefined {
  if (!media) return undefined;

  const caption = media.caption || undefined;
  const alt = media.alt ?? "";

  if (media.type === "video") {
    /*
      Video lives in its own Cloudinary namespace and its poster is generated
      from the clip rather than uploaded, so it cannot go through the image
      branch below: both URLs would 404.
    */
    const src = media.publicId
      ? storage.isConfigured
        ? cloudinaryVideoUrl(media.publicId)
        : ""
      : (media.src ?? "");

    const poster =
      media.poster ||
      (media.publicId && storage.isConfigured ? cloudinaryVideoPoster(media.publicId) : "");

    return {
      type: "video",
      alt,
      ...(caption ? { caption } : {}),
      ...(src ? { src } : {}),
      /* Only alongside a source. A poster with nothing to play is a still
         image pretending to be a video. */
      ...(src && poster ? { poster } : {}),
    };
  }

  /*
    An upload beats a static path. A post imported from `blog-data.ts` and
    edited since can carry both, and the upload is the newer of the two.
  */
  const src = media.publicId
    ? storage.isConfigured
      ? cloudinaryImageUrl(media.publicId, { width: BODY_IMAGE_WIDTH })
      : ""
    : (media.src ?? "");

  return {
    type: "image",
    alt,
    ...(caption ? { caption } : {}),
    ...(src ? { src } : {}),
  };
}

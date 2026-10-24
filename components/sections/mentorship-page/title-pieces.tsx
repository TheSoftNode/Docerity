import { titlePieces } from "@/components/sections/mentorship-page/mentorship-content";

/**
 * An editable title set the mentorship page's way: the emphasised words carry
 * a light sheen, and a closing full stop takes the accent. The sheen is
 * decoration on real text, so the heading reads the same to assistive tech.
 */
function TitlePieces({ title }: { title: string }) {
  return (
    <>
      {titlePieces(title).map((piece, index) =>
        piece.stop ? (
          <span key={index} className="text-[var(--ld-accent)]">
            {piece.text}
          </span>
        ) : piece.emphasis ? (
          <span key={index} className="ld-sheen">
            {piece.text}
          </span>
        ) : (
          piece.text
        )
      )}
    </>
  );
}

export { TitlePieces };

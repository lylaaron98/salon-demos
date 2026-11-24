import type { Graph } from "schema-dts";
import { serializeJsonLd } from "@/lib/seo/jsonld";

/** Renders one JSON-LD document. Server component: no client JS. */
export function JsonLd({ data }: { data: Graph }) {
  return (
    <script
      type="application/ld+json"
      // Content is our own typed data, serialised with `<` escaped.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

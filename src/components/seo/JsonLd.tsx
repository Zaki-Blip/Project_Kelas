import { serializeJsonLd } from "@/lib/seo";

type JsonLdProps = {
  data: unknown;
};

/**
 * Renders structured data with safe serialization. Keep this component
 * server-only so the payload is never duplicated into the client bundle.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

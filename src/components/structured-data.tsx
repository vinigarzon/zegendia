type StructuredDataProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

function normalizeStructuredData(data: StructuredDataProps["data"]) {
  if (Array.isArray(data)) {
    const context =
      data.find(
        (item) => typeof item?.["@context"] === "string"
      )?.["@context"] ?? "https://schema.org";

    return {
      "@context": context,
      "@graph": data.map((item) => {
        const { ["@context"]: _context, ...rest } = item;
        return rest;
      })
    };
  }

  if (typeof data["@context"] !== "string") {
    return {
      "@context": "https://schema.org",
      ...data
    };
  }

  return data;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: JSON.stringify(normalizeStructuredData(data)) }}
      type="application/ld+json"
    />
  );
}

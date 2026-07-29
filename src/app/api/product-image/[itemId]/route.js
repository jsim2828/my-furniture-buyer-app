// Proxies a single product's image from the shop API. Kept as its own
// on-demand route (rather than embedding images in the catalogue listing)
// because the per-item endpoint that carries image data is much slower
// than the search-index listing endpoint — see src/lib/shopApi.js.

const SHOP_API_URL = process.env.SHOP_API_URL;

export async function GET(request, { params }) {
  const { itemId } = await params;

  const res = await fetch(
    `${SHOP_API_URL}/catalogue/${encodeURIComponent(itemId)}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    return new Response("Not found", { status: 404 });
  }

  const item = await res.json();
  if (!item.image_url || !item.image_mime_type) {
    return new Response("No image", { status: 404 });
  }

  return new Response(Buffer.from(item.image_url, "base64"), {
    headers: {
      "Content-Type": item.image_mime_type,
      "Cache-Control": "public, max-age=3600",
    },
  });
}

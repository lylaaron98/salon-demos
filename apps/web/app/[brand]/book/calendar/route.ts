import { getBrand } from "@/content";
import { readConfirmation } from "@/lib/booking/confirmation";
import { buildIcs } from "@/lib/booking/ics";

/** .ics download for the success page's "Add to calendar" (works without JS). */
export async function GET(request: Request, { params }: { params: Promise<{ brand: string }> }) {
  const brand = getBrand((await params).brand);
  const query = Object.fromEntries(new URL(request.url).searchParams);
  const confirmation = brand ? readConfirmation(brand, query) : undefined;
  if (!brand || !confirmation) return new Response("Not found", { status: 404 });

  return new Response(buildIcs(confirmation.event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${brand.id}-${confirmation.ref}.ics"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

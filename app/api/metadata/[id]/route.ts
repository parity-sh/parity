import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { launch } from "@/lib/db/auth-schema";

const JSON_EXT_REGEX = /\.json$/;

// Parity suffix added to all on-chain token symbols
const PARITY_SYMBOL_SUFFIX = "ᴾ";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  const launchId = id.replace(JSON_EXT_REGEX, "");

  const [result] = await db
    .select({
      name: launch.name,
      symbol: launch.symbol,
      description: launch.description,
      image: launch.image,
    })
    .from(launch)
    .where(eq(launch.id, launchId))
    .limit(1);

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const metadata = {
    name: result.name,
    symbol: `${result.symbol}${PARITY_SYMBOL_SUFFIX}`,
    description: result.description || "",
    image: result.image || "",
  };

  return NextResponse.json(metadata, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

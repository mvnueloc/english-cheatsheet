import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "verbs.json");
let cachedVerbs: unknown[] | null = null;

async function getVerbs() {
  if (cachedVerbs) return cachedVerbs;
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as { verbs?: unknown[] };
  cachedVerbs = Array.isArray(data.verbs) ? data.verbs : [];
  return cachedVerbs;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = Math.max(
      0,
      Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0,
    );
    const limit = Math.max(
      1,
      Math.min(
        100,
        Number.parseInt(searchParams.get("limit") ?? "40", 10) || 40,
      ),
    );

    const verbs = await getVerbs();
    const slice = verbs.slice(offset, offset + limit);

    return NextResponse.json({
      verbs: slice,
      total: verbs.length,
      offset,
      limit,
    });
  } catch (error) {
    console.error("Failed to load verbs", error);
    return NextResponse.json(
      { error: "Failed to load verbs" },
      { status: 500 },
    );
  }
}

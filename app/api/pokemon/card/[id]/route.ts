import { NextRequest, NextResponse } from "next/server";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function mapLanguage(input: string) {
  const value = normalize(input);

  switch (value) {
    case "en":
      return "en";
    case "jp":
    case "ja":
      return "ja";
    case "fr":
      return "fr";
    case "es":
      return "es";
    case "it":
      return "it";
    case "pt":
      return "pt";
    case "pt-br":
      return "pt-br";
    case "pt-pt":
      return "pt-pt";
    case "de":
      return "de";
    case "nl":
      return "nl";
    case "pl":
      return "pl";
    case "ru":
      return "ru";
    case "ko":
      return "ko";
    case "id":
      return "id";
    case "th":
      return "th";
    case "zh":
    case "zh-tw":
    case "tw":
    case "traditional chinese":
      return "zh-tw";
    case "zh-cn":
    case "cn":
    case "simplified chinese":
      return "zh-cn";
    default:
      return "en";
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ card: null }, { status: 400 });
  }

  const rawLanguage = req.nextUrl.searchParams.get("language")?.trim() || "en";
  const language = mapLanguage(rawLanguage);

  const url = `https://api.tcgdex.net/v2/${language}/cards/${encodeURIComponent(id)}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json({ card: null }, { status: res.status });
  }

  const card = await res.json();

  return NextResponse.json({ card });
}
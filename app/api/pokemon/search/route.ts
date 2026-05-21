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
    case "pt":
      return "pt";
    case "pt-br":
      return "pt-br";
    case "pt-pt":
      return "pt-pt";
    case "es":
      return "es";
    case "fr":
      return "fr";
    case "de":
      return "de";
    case "ko":
      return "ko";
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

function scoreCard(
  card: any,
  query: string,
  namePart: string,
  localIdPart: string,
  setHint: string
) {
  const cardName = normalize(card.name ?? "");
  const localId = normalize(card.localId ?? "");
  const id = normalize(card.id ?? "");
  const setCode = id.split("-")[0] ?? "";

  let score = 0;

  if (cardName === normalize(namePart)) score += 8;
  if (cardName.includes(normalize(namePart))) score += 4;

  if (localIdPart && localId === normalize(localIdPart)) score += 10;
  if (localIdPart && `${cardName} ${localId}`.includes(normalize(query))) score += 4;

  if (setHint) {
    if (setCode === normalize(setHint)) score += 8;
    if (setCode.includes(normalize(setHint))) score += 4;
    if (id.includes(normalize(setHint))) score += 2;
  }

  return score;
}

async function getSetMap(setCodes: string[], language: string) {
  const uniqueSetCodes = [...new Set(setCodes)].filter(Boolean);

  const responses = await Promise.all(
    uniqueSetCodes.map(async (setCode) => {
      try {
        const res = await fetch(
          `https://api.tcgdex.net/v2/${language}/sets/${encodeURIComponent(setCode)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          return [setCode, null] as const;
        }

        const set = await res.json();

        return [
          setCode,
          {
            id: set.id ?? setCode,
            name: set.name ?? setCode,
            logo: set.logo ?? null,
            symbol: set.symbol ?? null,
          },
        ] as const;
      } catch {
        return [setCode, null] as const;
      }
    })
  );

  return new Map(responses);
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const rawLanguage = req.nextUrl.searchParams.get("language")?.trim() || "en";
  const language = mapLanguage(rawLanguage);

  if (q.length < 2) {
    return NextResponse.json({ cards: [] });
  }

  const numberMatch = q.match(/^(.+?)\s+(\d+[A-Za-z]?)$/);
  const parts = q.split(/\s+/).filter(Boolean);

  let namePart = q;
  let localIdPart = "";
  let setHint = "";

  if (numberMatch) {
    namePart = numberMatch[1].trim();
    localIdPart = numberMatch[2].trim();
  } else if (parts.length >= 2) {
    namePart = parts[0];
    setHint = parts.slice(1).join(" ");
  }

  const params = new URLSearchParams();
  params.set("name", namePart);

  if (localIdPart) {
    params.set("localId", localIdPart);
  }

  const url = `https://api.tcgdex.net/v2/${language}/cards?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json({ cards: [] });
  }

  const data = await res.json();
  const rawCards = Array.isArray(data) ? data : data.data ?? [];

  const scoredCards = rawCards
    .map((card: any) => {
      const setCode = String(card.id ?? "").split("-")[0] ?? "";

      return {
        id: card.id,
        name: card.name,
        localId: card.localId ?? null,
        image: card.image ?? null,
        setCode,
        score: scoreCard(card, q, namePart, localIdPart, setHint),
      };
    })
    .filter((card: any) => {
      if (!setHint) return true;

      const haystack = `${card.name} ${card.localId ?? ""} ${card.setCode}`.toLowerCase();
      return haystack.includes(setHint.toLowerCase()) || card.score > 0;
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 8);

  const setMap = await getSetMap(
    scoredCards.map((card: any) => card.setCode),
    language
  );

  const cards = scoredCards.map(({ score, ...card }: any) => {
    const setInfo = setMap.get(card.setCode);

    return {
      ...card,
      setName: setInfo?.name ?? card.setCode,
      setLogo: setInfo?.logo ?? null,
      setSymbol: setInfo?.symbol ?? null,
    };
  });

  return NextResponse.json({ cards });
}
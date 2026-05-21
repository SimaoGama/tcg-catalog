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
    case "th":
      return "th";
    default:
      return "en";
  }
}

function extractQueryParts(query: string) {
  const normalized = query.trim();
  const parts = normalized.split(/\s+/).filter(Boolean);

  const localIdPart = parts.find((part) => /^\d+[A-Za-z]?$/.test(part)) ?? "";
  const setCodeHint = parts.find((part) => /^[a-z]{2,}\d+[a-z]?$/i.test(part)) ?? "";

  const remainingParts = parts.filter(
    (part) => part !== localIdPart && part !== setCodeHint
  );

  const namePart = remainingParts.join(" ").trim() || normalized;
  const setHint = remainingParts.length > 1 ? remainingParts.slice(1).join(" ") : "";

  return {
    namePart,
    localIdPart,
    setHint,
    setCodeHint,
  };
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

function scoreCard(
  card: any,
  query: string,
  namePart: string,
  localIdPart: string,
  setHint: string,
  setCodeHint: string,
  setName: string
) {
  const fullQuery = normalize(query);
  const cardName = normalize(card.name ?? "");
  const localId = normalize(card.localId ?? "");
  const id = normalize(card.id ?? "");
  const setCode = id.split("-")[0] ?? "";
  const normalizedSetName = normalize(setName);

  let score = 0;

  if (cardName === normalize(namePart)) score += 20;
  if (namePart && cardName.includes(normalize(namePart))) score += 10;

  if (localIdPart && localId === normalize(localIdPart)) score += 100;
  if (localIdPart && localId !== normalize(localIdPart)) score -= 50;
  if (localIdPart && `${cardName} ${localId}`.includes(fullQuery)) score += 12;

  if (setCodeHint) {
    if (setCode === normalize(setCodeHint)) score += 20;
    if (setCode.includes(normalize(setCodeHint))) score += 10;
  }

  if (setHint) {
    if (normalizedSetName === normalize(setHint)) score += 18;
    if (normalizedSetName.includes(normalize(setHint))) score += 10;
    if (setCode.includes(normalize(setHint))) score += 8;
    if (id.includes(normalize(setHint))) score += 4;
  }

  const haystack = `${cardName} ${localId} ${setCode} ${normalizedSetName}`.trim();

  if (haystack.includes(fullQuery)) score += 12;

  return score;
}

async function localizeCards(cards: any[], language: string) {
  if (language === "en") return cards;

  const localized = await Promise.all(
    cards.map(async (card) => {
      try {
        const res = await fetch(
          `https://api.tcgdex.net/v2/${language}/cards/${encodeURIComponent(card.id)}`,
          { cache: "no-store" }
        );

        if (!res.ok) return card;

        const localizedCard = await res.json();

        return {
          ...card,
          name: localizedCard.name ?? card.name,
          localId: localizedCard.localId ?? card.localId,
          image: localizedCard.image ?? card.image,
        };
      } catch {
        return card;
      }
    })
  );

  return localized;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const rawLanguage = req.nextUrl.searchParams.get("language")?.trim() || "en";
  const language = mapLanguage(rawLanguage);

  if (q.length < 2) {
    return NextResponse.json({ cards: [] });
  }

  const { namePart, localIdPart, setHint, setCodeHint } = extractQueryParts(q);

  const params = new URLSearchParams();
  params.set("name", namePart || q);

  const englishUrl = `https://api.tcgdex.net/v2/en/cards?${params.toString()}`;
  const res = await fetch(englishUrl, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json({ cards: [] });
  }

  const data = await res.json();
  const rawCards = Array.isArray(data) ? data : data.data ?? [];

  const withSetCode = rawCards.map((card: any) => {
    const setCode = String(card.id ?? "").split("-")[0] ?? "";
    return {
      ...card,
      setCode,
    };
  });

  const localizedCards = await localizeCards(withSetCode, language);

  const setMap = await getSetMap(
    localizedCards.map((card: any) => card.setCode),
    language
  );

  const scoredCards = localizedCards
    .map((card: any) => {
      const setInfo = setMap.get(card.setCode);

      return {
        id: card.id,
        name: card.name,
        localId: card.localId ?? null,
        image: card.image ?? null,
        setCode: card.setCode,
        setName: setInfo?.name ?? card.setCode,
        setLogo: setInfo?.logo ?? null,
        setSymbol: setInfo?.symbol ?? null,
        score: scoreCard(
          card,
          q,
          namePart,
          localIdPart,
          setHint,
          setCodeHint,
          setInfo?.name ?? card.setCode
        ),
      };
    })
    .filter((card: any) => {
      if (localIdPart) {
        return normalize(card.localId ?? "") === normalize(localIdPart);
      }
      return card.score > 0;
    })
    .filter((card: any) => {
      if (setCodeHint) {
        return normalize(card.setCode ?? "").includes(normalize(setCodeHint));
      }
      return true;
    })
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 8);

  return NextResponse.json({ cards: scoredCards });
}
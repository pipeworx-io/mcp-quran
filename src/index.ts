interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Quran MCP — Al-Quran Cloud API.
 * Surahs (chapters), ayahs (verses), translations, and full-text search. Keyless.
 */


const BASE = 'https://api.alquran.cloud/v1';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'list_surahs',
    description:
      'List all 114 surahs (chapters) of the Quran with their Arabic name, English name, English translation, ayah (verse) count, and revelation type (Meccan/Medinan).',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_surah',
    description:
      'Get the full text of a surah (chapter) of the Quran by its number (1-114). Returns every ayah (verse) in the chosen edition. Use an English translation edition (e.g. en.asad, en.sahih) for English, or quran-uthmani for the Arabic text.',
    inputSchema: {
      type: 'object',
      properties: {
        number: { type: 'number', description: 'Surah number, 1-114.' },
        edition: {
          type: 'string',
          description:
            "Edition identifier. Default 'en.asad' (English translation). Other examples: 'en.sahih' (English), 'quran-uthmani' (Arabic).",
        },
      },
      required: ['number'],
    },
  },
  {
    name: 'get_ayah',
    description:
      'Get a single ayah (verse) of the Quran by reference — either surah:ayah (e.g. "2:255" for Ayat al-Kursi) or a global ayah number (1-6236). Returns the verse text in the chosen edition (translation like en.asad / en.sahih, or Arabic via quran-uthmani).',
    inputSchema: {
      type: 'object',
      properties: {
        reference: {
          type: 'string',
          description: 'Verse reference: "surah:ayah" like "2:255", or a global ayah number like "262".',
        },
        edition: {
          type: 'string',
          description: "Edition identifier. Default 'en.asad'. Use 'quran-uthmani' for Arabic.",
        },
      },
      required: ['reference'],
    },
  },
  {
    name: 'search_quran',
    description:
      'Search the Quran for a keyword across ayahs (verses). Returns matching verses (up to 30) with their surah (chapter) and ayah number. Defaults to the en.asad English translation; pass another edition to search a different translation or Arabic (quran-uthmani).',
    inputSchema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Word or phrase to search for.' },
        edition: { type: 'string', description: "Edition to search. Default 'en.asad'." },
        surah: {
          type: ['number', 'string'],
          description: "Restrict to a surah number, or 'all' for the whole Quran (default).",
        },
      },
      required: ['keyword'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list_surahs': {
      const data = (await quranGet('/surah')) as any[];
      return (data || []).map((s) => ({
        number: s.number,
        name: s.name,
        english_name: s.englishName,
        english_translation: s.englishNameTranslation,
        ayahs: s.numberOfAyahs,
        revelation_type: s.revelationType,
      }));
    }
    case 'get_surah': {
      const number = reqNum(args, 'number');
      const edition = (args.edition as string | undefined)?.trim() || 'en.asad';
      const data = (await quranGet(`/surah/${encodeURIComponent(String(number))}/${encodeURIComponent(edition)}`)) as any;
      return {
        number: data.number,
        name: data.name,
        english_name: data.englishName,
        edition,
        ayahs: (data.ayahs || []).map((a: any) => ({ number_in_surah: a.numberInSurah, text: a.text })),
      };
    }
    case 'get_ayah': {
      const reference = reqStr(args, 'reference', '"2:255"');
      const edition = (args.edition as string | undefined)?.trim() || 'en.asad';
      const data = (await quranGet(`/ayah/${encodeURIComponent(reference)}/${encodeURIComponent(edition)}`)) as any;
      return {
        reference,
        text: data.text,
        surah: data.surah?.englishName,
        surah_number: data.surah?.number,
        number_in_surah: data.numberInSurah,
        edition,
      };
    }
    case 'search_quran': {
      const keyword = reqStr(args, 'keyword', '"mercy"');
      const edition = (args.edition as string | undefined)?.trim() || 'en.asad';
      const surah = args.surah != null && String(args.surah).trim() ? String(args.surah).trim() : 'all';
      const data = (await quranGet(
        `/search/${encodeURIComponent(keyword)}/${encodeURIComponent(surah)}/${encodeURIComponent(edition)}`,
      )) as any;
      return {
        count: data.count,
        matches: (data.matches || []).slice(0, 30).map((m: any) => ({
          surah: m.surah?.englishName,
          surah_number: m.surah?.number,
          ayah: m.numberInSurah,
          text: m.text,
        })),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function quranGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  let body: any;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok || !body || body.code !== 200) {
    return { error: body?.code ?? res.status, message: body?.status ?? res.statusText };
  }
  return body.data;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

function reqNum(args: Record<string, unknown>, key: string): number {
  const v = args[key];
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n)) throw new Error(`Required argument "${key}" must be a number.`);
  return n;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;

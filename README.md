# mcp-quran

Quran MCP — Al-Quran Cloud API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `list_surahs` | List all 114 surahs (chapters) of the Quran with their Arabic name, English name, English translation, ayah (verse) count, and revelation type (Meccan/Medinan). |
| `get_surah` | Get the full text of a surah (chapter) of the Quran by its number (1-114). Returns every ayah (verse) in the chosen edition. Use an English translation edition (e.g. en.asad, en.sahih) for English, or quran-uthmani for the Arabic text. |
| `get_ayah` | Get a single ayah (verse) of the Quran by reference — either surah:ayah (e.g. "2:255" for Ayat al-Kursi) or a global ayah number (1-6236). Returns the verse text in the chosen edition (translation like en.asad / en.sahih, or Arabic via quran-uthmani). |
| `search_quran` | Search the Quran for a keyword across ayahs (verses). Returns matching verses (up to 30) with their surah (chapter) and ayah number. Defaults to the en.asad English translation; pass another edition to search a different translation or Arabic (quran-uthmani). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "quran": {
      "url": "https://gateway.pipeworx.io/quran/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Quran data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

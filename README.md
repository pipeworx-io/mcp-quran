# mcp-quran

Quran MCP — Al-Quran Cloud API.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/quran/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Quran data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

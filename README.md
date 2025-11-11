# MCP to Claude Skill Converter

Automatically convert Model Context Protocol (MCP) servers into Claude Code skills with TypeScript interfaces.

## Overview

This tool connects to any MCP server, introspects its available tools, and generates a complete Claude Code skill package including:

- **TypeScript interfaces** for all tool inputs (auto-generated from JSON Schema)
- **SKILL.md** documentation with tool descriptions and parameters
- **Ready-to-use skill package** that can be installed in Claude Code

## Features

- 🔍 **Automatic Discovery**: Connects to MCP servers and discovers all available tools
- 📝 **TypeScript Generation**: Converts JSON Schema to TypeScript interfaces
- 📦 **Complete Package**: Creates ready-to-install skill packages
- 🔄 **Pagination Support**: Handles servers with large tool lists
- 🛠️ **Universal Compatibility**: Works with any MCP server (Node.js, Python, etc.)

## Installation

```bash
npm install
```

## Usage

### Build the Project

```bash
npm run build
```

### Convert an MCP Server

```bash
node dist/scripts/convert.js "<server-command>" <output-directory>
```

### Examples

**Convert the Everything Server:**
```bash
node dist/scripts/convert.js "npx -y @modelcontextprotocol/server-everything" ./everything-skill
```

**Convert a Local Server:**
```bash
node dist/scripts/convert.js "node ./my-server/index.js" ./my-skill
```

**Convert a Python Server:**
```bash
node dist/scripts/convert.js "uvx mcp-server-time" ./time-skill
```

## Use as a Claude Code Skill

This project itself is a Claude Code skill!

### Installation as a Skill

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Use in Claude Code by referencing the skill

### Using the Skill in Claude Code

```
User: Convert the everything MCP server to a skill

Claude: I'll convert the MCP server to a Claude Code skill...
        [Runs the conversion automatically]
        ✓ Generated skill at ./everything-skill/
```

See [SKILL.md](./SKILL.md) for detailed skill usage instructions.

## How It Works

1. **Connect**: Establishes a connection to the MCP server via stdio transport
2. **Discover**: Sends `tools/list` JSON-RPC request to enumerate all tools
3. **Parse**: Extracts tool metadata (name, description, input schema)
4. **Generate**: Converts JSON Schema to TypeScript interfaces using `json-schema-to-typescript`
5. **Package**: Creates a complete skill directory with SKILL.md, types, and documentation

## Generated Output Structure

```
<output-dir>/
├── SKILL.md              # Main skill documentation
├── README.md             # Installation and usage instructions
└── scripts/
    └── types.ts          # TypeScript interfaces for all tools
```

## Example Generated Interface

**From MCP Tool:**
```json
{
  "name": "get_weather",
  "description": "Get weather for a location",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": { "type": "string", "description": "City name" },
      "units": { "type": "string", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["location"]
  }
}
```

**Generated TypeScript:**
```typescript
export interface GetWeatherInput {
  location: string;
  units?: "celsius" | "fahrenheit";
}
```

## Requirements

- Node.js 18+ (for ES modules and MCP SDK)
- An MCP server that:
  - Implements the Model Context Protocol specification
  - Supports the `tools/list` method
  - Uses JSON Schema for input definitions
  - Can be started via stdio transport

## Supported MCP Servers

This converter works with MCP servers written in any language:

- ✅ Node.js/TypeScript servers
- ✅ Python servers (via `uvx` or direct invocation)
- ✅ Go servers
- ✅ Any language with MCP SDK support

## Development

### Project Structure

```
mcp-to-claude-skill/
├── scripts/
│   ├── convert.ts          # Main CLI entry point
│   ├── mcp-client.ts       # MCP server connection logic
│   ├── schema-parser.ts    # JSON Schema → TypeScript converter
│   └── skill-generator.ts  # SKILL.md generation
├── SKILL.md                # Skill definition for Claude Code
├── package.json
├── tsconfig.json
└── README.md
```

### Building

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Cleaning

```bash
npm run clean
```

## Troubleshooting

### "Cannot find module" Error

Make sure you've run `npm run build` before executing the converter.

### Connection Timeout

If the server takes too long to start:
- Verify the server command is correct
- Check that required dependencies are installed
- Try running the server command directly to test

### No Tools Found

If `tools/list` returns 0 tools:
- Verify the server implements the tools protocol
- Use MCP Inspector to debug the server
- Check server logs for errors

## Contributing

Contributions are welcome! Areas for improvement:

- [ ] Support for output schemas (return types)
- [ ] Generation of wrapper functions (like in Anthropic's example)
- [ ] Support for MCP resources and prompts
- [ ] Interactive mode with prompts
- [ ] Support for HTTP transport

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude Code Skills Documentation](https://docs.claude.com/claude-code/skills)
- [Anthropic Engineering Blog: Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

## License

MIT

# mcp-to-claude-skill

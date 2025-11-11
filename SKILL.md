# MCP to Claude Skill Converter

Convert Model Context Protocol (MCP) servers into production-ready Claude Code skills with full TypeScript support.

## Overview

This skill enables you to automatically generate Claude Code skills from any MCP server. It connects to a running MCP server, introspects its available tools, and generates:

- **TypeScript wrapper functions** with type-safe interfaces for all tool inputs/outputs
- **MCP client integration** following Anthropic's recommended patterns
- **Category-organized structure** with barrel exports for easy importing
- **Complete SKILL.md documentation** with usage examples and API reference
- **Ready-to-use skill package** with working MCP integration

## Usage Workflow

### 1. Preparation

Before converting an MCP server, ensure you have:
- The command to start the MCP server (e.g., `npx -y @modelcontextprotocol/server-everything`)
- A target output directory for the generated skill

### 2. Running the Conversion

Ask Claude to convert an MCP server by providing:
1. The server command (including all arguments)
2. The desired output directory name

**Example conversation:**

```
User: Convert the @modelcontextprotocol/server-everything MCP server to a skill
      called "everything-skill"

Claude: I'll convert the MCP server to a Claude Code skill.
        *Runs the conversion process*
        The skill has been generated at ./everything-skill/
```

### 3. Conversion Process

When you request a conversion, Claude will:

1. **Install dependencies** (if not already installed): `npm install`
2. **Build the project**: `npm run build`
3. **Run the converter**: Provide the server command and output directory
4. **Connect to the MCP server** via stdio transport
5. **Discover all tools** using the MCP `tools/list` protocol
6. **Generate TypeScript interfaces** from JSON Schema definitions
7. **Create the skill package** with SKILL.md, types, and documentation

### 4. Output Structure

The generated skill will have this structure:

```
<output-dir>/
├── SKILL.md              # Main skill documentation
├── README.md             # Installation instructions
└── scripts/
    └── types.ts          # TypeScript interfaces for all tools
```

## Conversion Commands

The skill uses these commands internally:

**Install dependencies:**
```bash
npm install
```

**Build the TypeScript code:**
```bash
npm run build
```

**Run the converter:**
```bash
node dist/scripts/convert.js "<server-command>" <output-dir>
```

**Example:**
```bash
node dist/scripts/convert.js "npx -y @modelcontextprotocol/server-everything" ./everything-skill
```

## Supported MCP Servers

This converter works with any MCP server that:
- Implements the Model Context Protocol specification
- Supports the `tools/list` method
- Uses JSON Schema for tool input definitions
- Can be started via stdio transport

## Examples

### Convert the Everything Server

```
User: Convert the everything MCP server

Claude: *Runs:*
  npm install && npm run build
  node dist/scripts/convert.js "npx -y @modelcontextprotocol/server-everything" ./everything-skill

  ✓ Generated skill at ./everything-skill/ with 10 tools
```

### Convert a Custom Server

```
User: Convert my custom server at ./my-server/index.js to a skill

Claude: *Runs:*
  npm install && npm run build
  node dist/scripts/convert.js "node ./my-server/index.js" ./custom-skill

  ✓ Generated skill at ./custom-skill/ with 5 tools
```

### Convert a Python MCP Server

```
User: Convert the Python MCP server using uvx

Claude: *Runs:*
  npm install && npm run build
  node dist/scripts/convert.js "uvx mcp-server-time" ./time-skill

  ✓ Generated skill at ./time-skill/ with 2 tools
```

## TypeScript Interface Generation

The converter generates TypeScript interfaces from JSON Schema definitions:

**MCP Tool Definition:**
```json
{
  "name": "get_weather",
  "description": "Get weather for a location",
  "inputSchema": {
    "type": "object",
    "properties": {
      "location": {
        "type": "string",
        "description": "City name"
      },
      "units": {
        "type": "string",
        "enum": ["celsius", "fahrenheit"]
      }
    },
    "required": ["location"]
  }
}
```

**Generated TypeScript Interface:**
```typescript
export interface GetWeatherInput {
  location: string;
  units?: "celsius" | "fahrenheit";
}
```

## Troubleshooting

### Connection Errors

If the converter cannot connect to the MCP server:
- Verify the server command is correct
- Ensure the server executable is available
- Check that the server supports stdio transport

### No Tools Found

If the server reports 0 tools:
- Verify the server implements the `tools/list` method
- Check the server logs for errors
- Try connecting with MCP Inspector to debug

### Schema Conversion Issues

If TypeScript interfaces are incomplete:
- Check that the server provides valid JSON Schema
- Review the generated types.ts file
- File an issue with the schema that failed to convert

## Advanced Usage

### Custom Skill Names

Provide a custom skill name when converting:
```
User: Convert the server and name it "my-awesome-skill"
```

### Batch Conversion

Convert multiple servers in sequence:
```
User: Convert these MCP servers:
1. @modelcontextprotocol/server-everything
2. @modelcontextprotocol/server-filesystem
3. @modelcontextprotocol/server-github
```

## Reference

- **MCP Specification**: https://modelcontextprotocol.io
- **MCP TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk
- **Claude Code Skills**: https://docs.claude.com/claude-code/skills
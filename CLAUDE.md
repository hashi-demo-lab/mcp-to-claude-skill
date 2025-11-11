# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **MCP-to-Claude-Skill converter** that transforms Model Context Protocol (MCP) servers into production-ready Claude Code skills with TypeScript wrapper functions, type-safe interfaces, and complete documentation.

**This project is itself a Claude Code skill** - when invoked, it automates the conversion process.

## Key Commands

### Build and Conversion

```bash
# Build the TypeScript project
npm run build

# Clean build artifacts
npm run clean

# Convert an MCP server to a skill
node dist/scripts/convert.js "<server-command>" <output-directory>

# Examples:
node dist/scripts/convert.js "npx -y @modelcontextprotocol/server-everything" ./everything-skill
node dist/scripts/convert.js "uvx mcp-server-time" ./time-skill
```

### Development Workflow

When a user requests conversion of an MCP server:
1. Ensure dependencies are installed: `npm install`
2. Build the project: `npm run build`
3. Run the converter with appropriate command and output directory

## Architecture

### Core Conversion Pipeline

The conversion process follows this flow:

1. **MCP Connection** (`mcp-client.ts`):
   - Establishes stdio transport to the MCP server
   - Uses `@modelcontextprotocol/sdk` Client and StdioClientTransport
   - Handles pagination for servers with many tools via `tools/list` with cursor support
   - Provides `MCPClientWrapper` class with connection lifecycle management

2. **Tool Discovery & Categorization** (`skill-generator.ts`):
   - Fetches all tools from the MCP server via `tools/list` JSON-RPC
   - Categorizes tools by logical grouping (workspaces, variables, runs, public/private registry, organization)
   - Uses regex pattern matching with precedence rules (specific patterns before general ones)
   - Falls back to "Other" category for uncategorized tools

3. **TypeScript Generation** (`schema-parser.ts`):
   - Converts JSON Schema to TypeScript interfaces using `json-schema-to-typescript`
   - Generates both Input and Output interfaces for each tool
   - Creates wrapper functions that call `callMCPTool<T>(toolName, input)` from `client.ts`
   - Organizes code into individual files per tool with barrel exports (`index.ts`)

4. **Package Assembly** (`skill-generator.ts`):
   - Creates directory structure: `<output>/scripts/<category>/<toolFile>.ts`
   - Generates `SKILL.md` with complete documentation organized by category
   - Creates `README.md` with installation instructions
   - Populates `client.ts` helper from template (replaces `{{SKILL_NAME}}` placeholder)

### Generated Skill Structure

Output skills follow this organization:

```
<output-dir>/
├── SKILL.md                      # Main documentation
├── README.md                     # Installation guide
└── scripts/
    ├── client.ts                 # MCP connection helper (initializeMCPClient, callMCPTool)
    └── <category>/               # E.g., workspaces/, variables/, runs/
        ├── <tool1>.ts            # Individual tool with Input/Output interfaces + wrapper
        ├── <tool2>.ts
        ├── index.ts              # Barrel export for category
        └── ...
```

### Key Architectural Patterns

**Tool Categorization**:
- Categories defined in `skill-generator.ts` with name, directory, description, and pattern/exclude rules
- Pattern matching occurs in order (most specific first)
- Supports negative patterns via `exclude` field to prevent misclassification

**Naming Conventions**:
- Tool names (snake_case/kebab-case) → PascalCase function names: `create_workspace` → `CreateWorkspace`
- File names (camelCase): `create_workspace` → `createWorkspace.ts`
- Interface names: `CreateWorkspaceInput`, `CreateWorkspaceOutput`

**Type Safety**:
- Input interfaces generated from JSON Schema with full JSDoc comments
- Output interfaces use standard MCP response structure (content array, isError flag)
- Wrapper functions are strongly typed: `async function Tool(input: Input): Promise<Output>`

**MCP Client Pattern** (from Anthropic blog):
- Single global client instance per skill (`client.ts`)
- `initializeMCPClient({ command, args })` must be called once before tool use
- `callMCPTool<TOutput>(toolName, input)` handles JSON-RPC communication
- Automatic JSON parsing from text content when possible

### Template System

The `scripts/templates/client.ts.template` file is used to generate the MCP client helper. It includes:
- Placeholder `{{SKILL_NAME}}` replaced during generation
- Standard connection lifecycle (init, call, close)
- Error handling and connection state tracking

## Important Implementation Details

### Security: Credential Masking

The converter automatically masks sensitive values in command arguments:
- Detects environment variables containing: TOKEN, SECRET, KEY, PASSWORD, API_KEY, AUTH
- Replaces values with `***REDACTED***` in console output and documentation
- Both `-e VAR=value` and `VAR=value` formats are masked
- See `maskSensitiveArgs()` in both `convert.ts` and `skill-generator.ts`

### TypeScript Configuration

- Target: ES2022 with ES modules (`"type": "module"` in package.json)
- Output: `./dist` directory
- Strict mode enabled
- Includes only `scripts/**/*`, excludes `node_modules` and `dist`

### File Path Handling

- Uses ES module imports: `import.meta.url` with `fileURLToPath()` and `dirname()`
- Template path resolution relative to current module directory
- All file operations use `fs/promises` async API

## Common Issues and Solutions

**Build errors**: Always run `npm run build` before conversion - the `dist/` directory must exist

**Connection timeouts**: The MCP server command must be valid and the server must support stdio transport

**No tools found**: Verify the server implements `tools/list` - test with MCP Inspector if needed

**Schema conversion failures**: Falls back to `{ [key: string]: any }` if JSON Schema is invalid

## Output Schema Support

Note: MCP servers currently don't provide output schemas in the protocol, so output interfaces are generic placeholders with standard MCP response structure. Future enhancement would be generating specific output types.

## Extension Points

Future development areas:
- HTTP transport support (currently stdio only)
- MCP resources and prompts conversion (currently tools only)
- Output schema generation when protocol adds support
- Interactive mode with CLI prompts for server selection

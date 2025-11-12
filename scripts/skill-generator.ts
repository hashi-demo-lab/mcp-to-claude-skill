import { MCPTool } from "./mcp-client.js";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export interface SkillMetadata {
  name: string;
  description: string;
  serverCommand: string;
  serverArgs: string[];
}

/**
 * Mask sensitive values in command arguments
 */
function maskSensitiveArgs(args: string[]): string[] {
  return args.map(arg => {
    // Match environment variable assignments like -e TFE_TOKEN=value or TFE_TOKEN=value
    const envVarMatch = arg.match(/^(-e\s+)?([A-Z_]+(?:TOKEN|SECRET|KEY|PASSWORD|API_KEY|AUTH)[A-Z_]*)=(.+)$/i);
    if (envVarMatch) {
      const prefix = envVarMatch[1] || '';
      const varName = envVarMatch[2];
      return `${prefix}${varName}=***REDACTED***`;
    }
    return arg;
  });
}

/**
 * Format command string for documentation, masking sensitive values
 */
function formatCommandForDocs(command: string, args: string[]): string {
  const maskedArgs = maskSensitiveArgs(args);
  return `${command} ${maskedArgs.join(" ")}`;
}

export interface ToolCategory {
  name: string;
  directory: string;
  description: string;
  tools: MCPTool[];
}

/**
 * Categorize tools based on their names and descriptions
 */
function categorizeTools(tools: MCPTool[]): ToolCategory[] {
  const categories = new Map<string, ToolCategory>();

  // Define category matchers
  // Order matters - more specific patterns should come first
  const categoryRules = [
    {
      name: "Public Registry",
      directory: "public-registry",
      description: "Tools for accessing public Terraform registry (modules, providers, policies)",
      patterns: [/^(get_latest|get_module_details|get_policy_details|get_provider_details|get_provider_capabilities|search_modules|search_policies|search_providers)/],
      exclude: [/private/i]
    },
    {
      name: "Private Registry",
      directory: "private-registry",
      description: "Tools for accessing private Terraform modules and providers",
      patterns: [/private_(module|provider)/i, /search_private/i, /get_private/i]
    },
    {
      name: "Runs",
      directory: "runs",
      description: "Terraform run creation and monitoring",
      patterns: [/^(create_run|list_runs|get_run)/i],
      exclude: [/running/i]
    },
    {
      name: "Workspaces",
      directory: "workspaces",
      description: "Workspace creation, configuration, and management",
      patterns: [/workspace/i, /tag/i],
      exclude: [/workspace_variable/i, /variable_set.*workspace/i, /workspace.*variable_set/i]
    },
    {
      name: "Variables",
      directory: "variables",
      description: "Variable and variable set management",
      patterns: [/workspace_variable/i, /variable_set/i, /^(create|update|delete|list)_variable/i]
    },
    {
      name: "Organization",
      directory: "organization",
      description: "Organization and project listing",
      patterns: [/org|project/i, /^list_terraform/]
    }
  ];

  // Categorize each tool
  for (const tool of tools) {
    let categorized = false;

    for (const rule of categoryRules) {
      // Check if tool matches any pattern
      const matchesPattern = rule.patterns.some(pattern =>
        pattern.test(tool.name) || (tool.description && pattern.test(tool.description))
      );

      // Check if tool matches exclude patterns
      const matchesExclude = rule.exclude?.some(pattern =>
        pattern.test(tool.name) || (tool.description && pattern.test(tool.description))
      );

      if (matchesPattern && !matchesExclude) {
        if (!categories.has(rule.directory)) {
          categories.set(rule.directory, {
            name: rule.name,
            directory: rule.directory,
            description: rule.description,
            tools: []
          });
        }
        categories.get(rule.directory)!.tools.push(tool);
        categorized = true;
        break;
      }
    }

    // If not categorized, add to "Other" category
    if (!categorized) {
      if (!categories.has("other")) {
        categories.set("other", {
          name: "Other",
          directory: "other",
          description: "Additional tools",
          tools: []
        });
      }
      categories.get("other")!.tools.push(tool);
    }
  }

  return Array.from(categories.values());
}

/**
 * Format a tool's input schema as a readable string for documentation
 */
function formatSchemaForDocs(schema: any): string {
  if (!schema || !schema.properties) {
    return "No parameters";
  }

  const properties = schema.properties;
  const required = schema.required || [];
  const lines: string[] = [];

  for (const [propName, propSchema] of Object.entries(properties)) {
    const prop = propSchema as any;
    const isRequired = required.includes(propName);
    const requiredMarker = isRequired ? " (required)" : " (optional)";
    const type = prop.type || "any";
    const description = prop.description || "";

    lines.push(`- \`${propName}\`: ${type}${requiredMarker}`);
    if (description) {
      lines.push(`  ${description}`);
    }
  }

  return lines.join("\n");
}

/**
 * Generate concise SKILL.md focusing on when/how to use (not detailed API reference)
 * The TypeScript code serves as the detailed reference documentation
 */
export function generateSkillMarkdown(
  metadata: SkillMetadata,
  tools: MCPTool[],
  categories?: ToolCategory[]
): string {
  const lines: string[] = [];

  // YAML Frontmatter (required by Claude Skill specification)
  const truncatedDescription = metadata.description.length > 200
    ? metadata.description.substring(0, 197) + "..."
    : metadata.description;

  lines.push("---");
  lines.push(`name: ${metadata.name}`);
  lines.push(`description: ${truncatedDescription}`);
  lines.push("version: 1.0.0");

  // Extract dependencies from server command
  const dependencies: string[] = [];
  if (metadata.serverCommand.includes("docker")) dependencies.push("docker");
  if (metadata.serverCommand.includes("node") || metadata.serverCommand.includes("npx")) dependencies.push("node.js");
  if (metadata.serverCommand.includes("python") || metadata.serverCommand.includes("uvx")) dependencies.push("python");
  if (dependencies.length > 0) {
    lines.push(`dependencies: ${dependencies.join(", ")}`);
  }

  lines.push("---");
  lines.push("");

  // Header
  lines.push(`# ${metadata.name}`);
  lines.push("");
  lines.push(metadata.description);
  lines.push("");

  // When to Use This Skill section
  lines.push("## When to Use This Skill");
  lines.push("");
  lines.push("Invoke this skill when you need to:");
  if (categories && categories.length > 0) {
    for (const category of categories) {
      const useCase = category.description.charAt(0).toUpperCase() + category.description.slice(1);
      lines.push(`- **${useCase}**`);
    }
  } else {
    lines.push("- Perform operations provided by this MCP server");
  }
  lines.push("");

  // Prerequisites
  lines.push("## Prerequisites");
  lines.push("");
  lines.push("**MCP Server Command:**");
  lines.push("```bash");
  lines.push(`${formatCommandForDocs(metadata.serverCommand, metadata.serverArgs)}`);
  lines.push("```");
  lines.push("");

  // Security Best Practices (if applicable - can detect auth/token patterns)
  const hasAuthRequirement = metadata.serverArgs.some(arg =>
    /token|secret|key|password|auth/i.test(arg)
  );

  if (hasAuthRequirement) {
    lines.push("## Security Best Practices");
    lines.push("");
    lines.push("⚠️ **Important Security Guidelines:**");
    lines.push("");
    lines.push("- **Never hardcode credentials**: Always use environment variables");
    lines.push("- **Token security**: Store tokens in secure credential managers");
    lines.push("- **Least privilege**: Use minimal permissions necessary");
    lines.push("- **Review before execution**: Examine generated code before running in production");
    lines.push("- **No secrets in code**: Never commit credentials to version control");
    lines.push("");
  }

  // Available Tools (concise category summary)
  lines.push("## Available Tools");
  lines.push("");
  lines.push(`This skill provides ${tools.length} type-safe tools organized into ${categories?.length || 1} ${categories?.length === 1 ? 'category' : 'categories'}:`);
  lines.push("");

  if (categories && categories.length > 0) {
    for (const category of categories) {
      lines.push(`- **${category.name}** (${category.tools.length} tools) - \`scripts/${category.directory}/\``);
      // Add brief bullet points about capabilities
      const sampleTools = category.tools.slice(0, 3).map(t => t.name.split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ');
      lines.push(`  ${category.description}`);
    }
    lines.push("");
    lines.push("**For detailed parameters and types**, see the TypeScript files in each category directory. All functions include full type definitions and JSDoc comments for IDE autocomplete.");
  } else {
    lines.push("See `scripts/` directory for all available tools.");
  }
  lines.push("");

  // Quick Start Example
  lines.push("## Quick Start");
  lines.push("");
  lines.push("```typescript");
  lines.push('import { initializeMCPClient, closeMCPClient } from "./scripts/client.js";');

  if (categories && categories.length > 0 && categories[0].tools.length > 0) {
    const exampleTool = categories[0].tools[0];
    const exampleFunction = exampleTool.name
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    lines.push(`import { ${exampleFunction} } from "./scripts/${categories[0].directory}/index.js";`);
  }

  lines.push("");
  lines.push("// 1. Initialize connection");
  lines.push("await initializeMCPClient({");
  lines.push(`  command: "${metadata.serverCommand}",`);
  lines.push(`  args: [${metadata.serverArgs.slice(0, 3).map(arg => `"${maskSensitiveArgs([arg])[0]}"`).join(", ")}]`);
  lines.push("});");
  lines.push("");
  lines.push("try {");
  lines.push("  // 2. Use skill tools");
  lines.push("  // ... your code here");
  lines.push("} finally {");
  lines.push("  // 3. Clean up");
  lines.push("  await closeMCPClient();");
  lines.push("}");
  lines.push("```");
  lines.push("");

  // Using the TypeScript Wrappers
  lines.push("## Using the TypeScript Wrappers");
  lines.push("");
  lines.push("Import from category indexes or individual files:");
  lines.push("");
  lines.push("```typescript");
  if (categories && categories.length > 0) {
    lines.push("// Import from category index");
    lines.push(`import { Function1, Function2 } from "./scripts/${categories[0].directory}/index.js";`);
    lines.push("");
    lines.push("// Or import specific tool with types");
    lines.push(`import { Function1, Function1Input, Function1Output } from "./scripts/${categories[0].directory}/function1.js";`);
  } else {
    lines.push("import { MyTool } from \"./scripts/myTool.js\";");
  }
  lines.push("```");
  lines.push("");
  lines.push("All wrapper functions are fully typed with Input/Output interfaces. Use your IDE's autocomplete to discover parameters and see JSDoc documentation.");
  lines.push("");

  // Error Handling
  lines.push("## Error Handling");
  lines.push("");
  lines.push("```typescript");
  lines.push("try {");
  lines.push("  const result = await SomeTool({ /* params */ });");
  lines.push("");
  lines.push("  if (result.isError) {");
  lines.push('    console.error("Operation failed:", result.content);');
  lines.push("  } else {");
  lines.push('    console.log("Success");');
  lines.push("  }");
  lines.push("} catch (error) {");
  lines.push('  console.error("MCP call failed:", error);');
  lines.push("}");
  lines.push("```");
  lines.push("");

  // Testing
  lines.push("## Testing This Skill");
  lines.push("");
  lines.push("**Before Using:**");
  lines.push("1. Verify prerequisites are installed");
  lines.push("2. Test MCP server connectivity");
  lines.push("3. Try a simple operation to confirm authentication");
  lines.push("");
  lines.push("**Troubleshooting:**");
  lines.push("- **Connection errors**: Verify server is reachable and command is correct");
  lines.push("- **Authentication failures**: Check credentials have correct permissions");
  lines.push("- **Type errors**: Ensure you're using the correct Input interface");
  lines.push("");

  // Architecture
  lines.push("## Architecture");
  lines.push("");
  lines.push("- **`scripts/client.ts`** - MCP connection manager (`initializeMCPClient`, `callMCPTool`, `closeMCPClient`)");
  lines.push("- **`scripts/{category}/`** - Type-safe wrapper functions organized by category");
  lines.push("  - Each tool has its own `.ts` file with Input/Output interfaces");
  lines.push("  - `index.ts` provides barrel exports for convenient importing");
  lines.push("- **Full type safety** - All interfaces generated from JSON Schema definitions");
  lines.push("");

  // Footer
  lines.push("---");
  lines.push("");
  lines.push("*This skill was auto-generated by [mcp-to-claude-skill](https://github.com/hashi-demo-lab/mcp-to-claude-skill)*");

  return lines.join("\n");
}

/**
 * Create the complete skill package in the output directory with categorization
 */
export async function createSkillPackage(
  outputDir: string,
  metadata: SkillMetadata,
  categories: ToolCategory[],
  wrappersMap: Map<string, Map<string, string>>
): Promise<void> {
  // Create output directory structure
  await mkdir(outputDir, { recursive: true });
  const scriptsDir = join(outputDir, "scripts");
  await mkdir(scriptsDir, { recursive: true });

  // Get all tools from categories
  const tools = categories.flatMap(cat => cat.tools);

  // Write SKILL.md with categories
  const skillMd = generateSkillMarkdown(metadata, tools, categories);
  await writeFile(join(outputDir, "SKILL.md"), skillMd, "utf-8");

  // Write client.ts helper
  const { readFile: readFileFS } = await import("fs/promises");
  const { join: pathJoin } = await import("path");
  const { fileURLToPath } = await import("url");
  const { dirname } = await import("path");

  // Get the directory of the current module
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const templatePath = pathJoin(__dirname, "templates", "client.ts.template");

  let clientTemplate = await readFileFS(templatePath, "utf-8");
  clientTemplate = clientTemplate.replace(/\{\{SKILL_NAME\}\}/g, metadata.name);

  await writeFile(join(scriptsDir, "client.ts"), clientTemplate, "utf-8");

  // Write individual wrapper files for each category
  const { generateCategoryIndex } = await import("./schema-parser.js");

  for (const category of categories) {
    const categoryPath = join(scriptsDir, category.directory);
    await mkdir(categoryPath, { recursive: true });

    // Get tool files for this category
    const toolFiles = wrappersMap.get(category.directory);
    if (toolFiles) {
      // Write each tool file
      for (const [fileName, content] of toolFiles.entries()) {
        await writeFile(join(categoryPath, `${fileName}.ts`), content, "utf-8");
      }

      // Write index.ts barrel export
      const indexContent = generateCategoryIndex(category.tools);
      await writeFile(join(categoryPath, "index.ts"), indexContent, "utf-8");
    }
  }

  // Create a basic README
  const readme = `# ${metadata.name}

This is an auto-generated Claude Code skill from an MCP server.

## Installation

1. Copy this directory to your Claude Code skills location
2. The skill will be available for use in Claude Code

## Contents

- \`SKILL.md\` - Main skill documentation
- \`scripts/\` - TypeScript wrapper functions organized by category
  ${categories.map(cat => `- \`scripts/${cat.directory}/\` - ${cat.name} (${cat.tools.length} wrapper functions)`).join("\n  ")}

Each category contains:
- Individual \`.ts\` files for each tool with input/output interfaces and wrapper functions
- \`index.ts\` - Barrel export for easy importing

## Original MCP Server

**Command:** \`${formatCommandForDocs(metadata.serverCommand, metadata.serverArgs)}\`

**Tools:** ${tools.length} available

## Tool Categories

${categories.map(cat => `- **${cat.name}** (${cat.tools.length} tools): ${cat.description}`).join("\n")}

## Usage

Import wrapper functions from category modules:

\`\`\`typescript
import { CreateWorkspace, UpdateWorkspace } from "./scripts/workspaces/index.js";

// Use type-safe wrapper functions
const result = await CreateWorkspace({
  workspace_name: "my-workspace",
  terraform_org_name: "my-org"
});
\`\`\`
`;

  await writeFile(join(outputDir, "README.md"), readme, "utf-8");

  console.log(`\nSkill package created at: ${outputDir}`);
  console.log(`- SKILL.md: Main skill documentation`);
  console.log(`- scripts/: TypeScript wrapper functions organized by category`);
  for (const category of categories) {
    console.log(`  - ${category.directory}/ (${category.tools.length} wrapper functions + index.ts)`);
  }
  console.log(`- README.md: Installation instructions`);
}

/**
 * Export the categorizeTools function for use in other modules
 */
export { categorizeTools };

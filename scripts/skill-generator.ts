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
      name: "Workspaces",
      directory: "workspaces",
      description: "Workspace creation, configuration, and management",
      patterns: [/workspace/i, /tag/i],
      exclude: [/variable/i]
    },
    {
      name: "Runs",
      directory: "runs",
      description: "Terraform run creation and monitoring",
      patterns: [/run/i],
      exclude: [/running/i]
    },
    {
      name: "Variables",
      directory: "variables",
      description: "Variable and variable set management",
      patterns: [/variable/i, /variable_set/i]
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
 * Generate the SKILL.md content for a generated skill with categorized tools
 */
export function generateSkillMarkdown(
  metadata: SkillMetadata,
  tools: MCPTool[],
  categories?: ToolCategory[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${metadata.name}`);
  lines.push("");
  lines.push(metadata.description);
  lines.push("");

  // Server Information
  lines.push("## Server Information");
  lines.push("");
  lines.push(`**Command:** \`${formatCommandForDocs(metadata.serverCommand, metadata.serverArgs)}\``);
  lines.push("");
  lines.push(`**Total Tools:** ${tools.length}`);
  lines.push("");

  // If categories provided, organize by category
  if (categories && categories.length > 0) {
    // Table of contents
    lines.push("## Tool Categories");
    lines.push("");
    for (const category of categories) {
      lines.push(`- **[${category.name}](#${category.name.toLowerCase().replace(/\s+/g, "-")})** (${category.tools.length} tools) - ${category.description}`);
    }
    lines.push("");

    // Tools organized by category
    for (const category of categories) {
      lines.push(`## ${category.name}`);
      lines.push("");
      lines.push(category.description);
      lines.push("");
      lines.push(`**Location:** \`scripts/${category.directory}/\``);
      lines.push("");

      for (const tool of category.tools) {
        lines.push(`### ${tool.name}`);
        lines.push("");

        if (tool.description) {
          lines.push(tool.description);
          lines.push("");
        }

        lines.push("**Parameters:**");
        lines.push("");
        lines.push(formatSchemaForDocs(tool.inputSchema));
        lines.push("");

        // Reference to TypeScript wrapper function and interfaces
        const functionName = tool.name
          .split(/[-_]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join("");
        const fileName = tool.name.split(/[-_]/)[0] +
          tool.name.split(/[-_]/).slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');

        lines.push(`**TypeScript Wrapper:** \`${functionName}\``);
        lines.push("");
        lines.push(`**Import:** \`import { ${functionName}, ${functionName}Input, ${functionName}Output } from "./scripts/${category.directory}/${fileName}.js"\``);
        lines.push("");
      }
    }
  } else {
    // Flat list of tools (backwards compatible)
    lines.push("## Available Tools");
    lines.push("");

    for (const tool of tools) {
      lines.push(`### ${tool.name}`);
      lines.push("");

      if (tool.description) {
        lines.push(tool.description);
        lines.push("");
      }

      lines.push("**Parameters:**");
      lines.push("");
      lines.push(formatSchemaForDocs(tool.inputSchema));
      lines.push("");

      // Reference to TypeScript interface
      const interfaceName = tool.name
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
      lines.push(`**TypeScript Interface:** \`${interfaceName}Input\``);
      lines.push("");
    }
  }

  // Usage Instructions
  lines.push("## Usage");
  lines.push("");
  lines.push("This skill provides TypeScript wrapper functions and interfaces for all MCP tools.");
  if (categories && categories.length > 0) {
    lines.push("Import wrapper functions from category-specific modules:");
    lines.push("");
    lines.push("```typescript");
    lines.push(`// Example: Import from ${categories[0].name}`);
    const exampleTool = categories[0].tools[0];
    const exampleFunction = exampleTool.name
      .split(/[-_]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    const exampleFile = exampleTool.name.split(/[-_]/)[0] +
      exampleTool.name.split(/[-_]/).slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    lines.push(`import { ${exampleFunction}, ${exampleFunction}Input } from "./scripts/${categories[0].directory}/${exampleFile}.js";`);
    lines.push("");
    lines.push("// Or import from category index");
    lines.push(`import { ${exampleFunction} } from "./scripts/${categories[0].directory}/index.js";`);
    lines.push("");
    lines.push("// Use type-safe wrapper function");
    lines.push(`const result = await ${exampleFunction}({`);
    lines.push("  // ... parameters with full type checking");
    lines.push("});");
    lines.push("```");
  } else {
    lines.push("Import the interfaces from `scripts/types.ts` to use them in your code.");
    lines.push("");
    lines.push("```typescript");
    lines.push('import { GetWeather, GetWeatherInput } from "./scripts/getWeather.js";');
    lines.push("");
    lines.push("// Use type-safe wrapper function");
    lines.push("const result = await GetWeather({");
    lines.push('  location: "San Francisco"');
    lines.push("});");
    lines.push("```");
  }
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

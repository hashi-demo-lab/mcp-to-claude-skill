#!/usr/bin/env node

import { connectToMCPServer } from "./mcp-client.js";
import { generateCategorizedInterfaces } from "./schema-parser.js";
import { createSkillPackage, SkillMetadata, categorizeTools } from "./skill-generator.js";
import { argv, exit } from "process";

interface ConversionOptions {
  serverCommand: string;
  serverArgs: string[];
  outputDir: string;
  skillName: string;
  skillDescription?: string;
}

/**
 * Mask sensitive values in command arguments for console output
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
 * Parse command line arguments
 */
function parseArgs(): ConversionOptions | null {
  const args = argv.slice(2);

  if (args.length < 2) {
    console.error("Usage: node convert.js <server-command> <output-dir> [args...]");
    console.error("");
    console.error("Examples:");
    console.error("  node convert.js 'npx -y @modelcontextprotocol/server-everything' ./output-skill");
    console.error("  node convert.js 'node server.js' ./my-skill");
    console.error("");
    return null;
  }

  const serverCommandFull = args[0];
  const outputDir = args[1];

  // Split the command string into command and args
  const commandParts = serverCommandFull.split(/\s+/);
  const serverCommand = commandParts[0];
  const serverArgs = commandParts.slice(1);

  // Try to derive a skill name from the command
  let skillName = "mcp-skill";
  if (serverCommand.includes("server-")) {
    const match = serverCommand.match(/server-([a-zA-Z0-9-]+)/);
    if (match) {
      skillName = match[1] + "-skill";
    }
  }

  return {
    serverCommand,
    serverArgs,
    outputDir,
    skillName,
    skillDescription: "Auto-generated skill from MCP server",
  };
}

/**
 * Main conversion function
 */
async function convert(options: ConversionOptions): Promise<void> {
  console.log("🚀 MCP to Claude Skill Converter");
  console.log("================================");
  console.log("");
  const maskedArgs = maskSensitiveArgs(options.serverArgs);
  console.log(`Server command: ${options.serverCommand} ${maskedArgs.join(" ")}`);
  console.log(`Output directory: ${options.outputDir}`);
  console.log("");

  let client;

  try {
    // Step 1: Connect to MCP server
    console.log("📡 Connecting to MCP server...");
    client = await connectToMCPServer(options.serverCommand, options.serverArgs);
    console.log("✓ Connected successfully");
    console.log("");

    // Step 2: Get server info
    console.log("ℹ️  Fetching server information...");
    const serverInfo = await client.getServerInfo();
    console.log(`✓ Server: ${serverInfo.name || "Unknown"} (v${serverInfo.version || "Unknown"})`);
    console.log("");

    // Step 3: List all tools
    console.log("🔍 Discovering tools...");
    const tools = await client.listTools();
    console.log(`✓ Found ${tools.length} tools`);
    console.log("");

    if (tools.length === 0) {
      console.warn("⚠️  No tools found on the server. Skill will be empty.");
    } else {
      console.log("Tools discovered:");
      tools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.name}${tool.description ? ` - ${tool.description}` : ""}`);
      });
      console.log("");
    }

    // Step 4: Categorize tools
    console.log("🗂️  Categorizing tools...");
    const categories = categorizeTools(tools);
    console.log(`✓ Organized into ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name}: ${cat.tools.length} tools`);
    });
    console.log("");

    // Step 5: Generate TypeScript interfaces
    console.log("⚙️  Generating TypeScript interfaces...");
    const typesContentMap = await generateCategorizedInterfaces(categories);
    console.log(`✓ Generated interfaces for ${tools.length} tools in ${categories.length} categories`);
    console.log("");

    // Step 6: Create skill package
    console.log("📦 Creating skill package...");
    const metadata: SkillMetadata = {
      name: options.skillName,
      description: options.skillDescription || `Claude Code skill for ${serverInfo.name || "MCP server"}`,
      serverCommand: options.serverCommand,
      serverArgs: options.serverArgs,
    };

    await createSkillPackage(
      options.outputDir,
      metadata,
      tools,
      typesContentMap
    );

    console.log("");
    console.log("✨ Conversion complete!");
    console.log("");
    console.log("Next steps:");
    console.log(`  1. Review the generated skill at: ${options.outputDir}`);
    console.log(`  2. Copy the skill to your Claude Code skills directory`);
    console.log(`  3. Use the skill in Claude Code`);
    console.log("");

  } catch (error) {
    console.error("");
    console.error("❌ Error during conversion:");
    console.error(error);
    exit(1);
  } finally {
    // Clean up: disconnect from server
    if (client && client.isConnected()) {
      console.log("🔌 Disconnecting from server...");
      await client.disconnect();
      console.log("✓ Disconnected");
    }
  }
}

// Main entry point
const options = parseArgs();
if (options) {
  convert(options).catch((error) => {
    console.error("Fatal error:", error);
    exit(1);
  });
} else {
  exit(1);
}

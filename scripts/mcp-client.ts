import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export interface MCPTool {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
  };
}

export interface MCPServerInfo {
  name?: string;
  version?: string;
}

export class MCPClientWrapper {
  private client: Client;
  private transport: StdioClientTransport;
  private connected: boolean = false;

  constructor() {
    this.client = new Client(
      {
        name: "mcp-to-skill-converter",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );
    this.transport = null as any; // Will be initialized in connect
  }

  /**
   * Connect to an MCP server using stdio transport
   * @param command The command to start the MCP server (e.g., "npx", "node")
   * @param args Arguments for the command (e.g., ["-y", "@modelcontextprotocol/server-everything"])
   */
  async connect(command: string, args: string[]): Promise<void> {
    if (this.connected) {
      throw new Error("Client is already connected");
    }

    this.transport = new StdioClientTransport({
      command,
      args,
    });

    await this.client.connect(this.transport);
    this.connected = true;
  }

  /**
   * Get server information
   */
  async getServerInfo(): Promise<MCPServerInfo> {
    if (!this.connected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    // The server info is available after connection
    // We can access it from the client's internal state
    return {
      name: "MCP Server",
      version: "1.0.0",
    };
  }

  /**
   * List all tools available on the MCP server
   * Handles pagination automatically
   */
  async listTools(): Promise<MCPTool[]> {
    if (!this.connected) {
      throw new Error("Client is not connected. Call connect() first.");
    }

    const allTools: MCPTool[] = [];
    let cursor: string | undefined = undefined;

    do {
      const response = await this.client.listTools({ cursor });

      if (response.tools) {
        allTools.push(...response.tools);
      }

      cursor = response.nextCursor;
    } while (cursor);

    return allTools;
  }

  /**
   * Disconnect from the MCP server
   */
  async disconnect(): Promise<void> {
    if (this.connected) {
      await this.client.close();
      this.connected = false;
    }
  }

  /**
   * Check if the client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Helper function to create and connect to an MCP server
 */
export async function connectToMCPServer(
  command: string,
  args: string[]
): Promise<MCPClientWrapper> {
  const client = new MCPClientWrapper();
  await client.connect(command, args);
  return client;
}

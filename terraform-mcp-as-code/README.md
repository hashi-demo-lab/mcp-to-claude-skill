# mcp-skill

This is an auto-generated Claude Code skill from an MCP server.

## Installation

1. Copy this directory to your Claude Code skills location
2. The skill will be available for use in Claude Code

## Contents

- `SKILL.md` - Main skill documentation
- `scripts/` - TypeScript interfaces organized by category
  - `scripts/variables/` - Variables (11 tools)
  - `scripts/workspaces/` - Workspaces (4 tools)
  - `scripts/tags/` - Tags (3 tools)
  - `scripts/public-registry/` - Public Registry (9 tools)
  - `scripts/private-registry/` - Private Registry (4 tools)
  - `scripts/runs/` - Runs (1 tools)
  - `scripts/organization/` - Organization (2 tools)

## Original MCP Server

**Command:** `docker run -i --rm -e TFE_TOKEN=***REDACTED*** hashicorp/terraform-mcp-server`

**Tools:** 34 available

## Tool Categories

- **Variables** (11 tools): Variable and variable set management
- **Workspaces** (4 tools): Workspace creation, configuration, and management
- **Tags** (3 tools): Workspace tagging operations
- **Public Registry** (9 tools): Tools for accessing public Terraform registry (modules, providers, policies)
- **Private Registry** (4 tools): Tools for accessing private Terraform modules and providers
- **Runs** (1 tools): Terraform run creation and monitoring
- **Organization** (2 tools): Organization and project listing

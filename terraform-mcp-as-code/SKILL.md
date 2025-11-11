# terraform-mcp-as-code

Terraform infrastructure-as-code management through HashiCorp Cloud Platform (HCP) Terraform.

This skill provides type-safe TypeScript wrappers for all Terraform Cloud/Enterprise operations including workspaces, runs, variables, registry access, and more.

## Server Information

**MCP Server:** HashiCorp Terraform MCP Server
**Command:** `docker run -i --rm -e TFE_TOKEN=your_token hashicorp/terraform-mcp-server`
**Total Tools:** 34

## Quick Start

### 1. Initialize the MCP Client

Before using any tools, initialize the MCP client connection:

```typescript
import { initializeMCPClient } from "./scripts/client.js";

await initializeMCPClient({
  command: "docker",
  args: [
    "run", "-i", "--rm",
    "-e", `TFE_TOKEN=${process.env.TFE_TOKEN}`,
    "hashicorp/terraform-mcp-server"
  ]
});
```

### 2. Use Type-Safe Wrappers

Import and call wrapper functions with full type safety:

```typescript
import { CreateWorkspace } from "./scripts/workspaces/index.js";
import { CreateRun } from "./scripts/runs/index.js";

// Create a workspace
const workspace = await CreateWorkspace({
  workspace_name: "my-infrastructure",
  terraform_org_name: "my-org",
  auto_apply: "false"
});

// Trigger a run
const run = await CreateRun({
  workspace_name: "my-infrastructure",
  terraform_org_name: "my-org",
  message: "Initial deployment"
});
```

### 3. Clean Up

Close the MCP client when done:

```typescript
import { closeMCPClient } from "./scripts/client.js";

await closeMCPClient();
```

## Tool Categories

- **[Variables](#variables)** (11 tools) - Variable and variable set management
- **[Runs](#runs)** (3 tools) - Terraform run creation and monitoring
- **[Workspaces](#workspaces)** (5 tools) - Workspace creation, configuration, and management
- **[Public Registry](#public-registry)** (9 tools) - Tools for accessing public Terraform registry (modules, providers, policies)
- **[Private Registry](#private-registry)** (4 tools) - Tools for accessing private Terraform modules and providers
- **[Organization](#organization)** (2 tools) - Organization and project listing

## Variables

Variable and variable set management

**Location:** `scripts/variables/`

### attach_variable_set_to_workspaces

Attach a variable set to one or more workspaces.

**Parameters:**

- `variable_set_id`: string (required)
  Variable set ID
- `workspace_ids`: string (required)
  Comma-separated list of workspace IDs

**TypeScript Wrapper:** `AttachVariableSetToWorkspaces`

**Import:** `import { AttachVariableSetToWorkspaces, AttachVariableSetToWorkspacesInput, AttachVariableSetToWorkspacesOutput } from "./scripts/variables/attachVariableSetToWorkspaces.js"`

### create_no_code_workspace

Creates a new Terraform No Code module workspace. The tool uses the MCP elicitation feature to automatically discover and collect required variables from the user.

**Parameters:**

- `auto_apply`: boolean (optional)
  Whether to automatically apply changes in the workspace: 'true' or 'false'
- `no_code_module_id`: string (required)
  The ID of the No Code module to create a workspace for
- `project_id`: string (required)
  The ID of the project to use
- `workspace_name`: string (required)
  The name of the workspace to create

**TypeScript Wrapper:** `CreateNoCodeWorkspace`

**Import:** `import { CreateNoCodeWorkspace, CreateNoCodeWorkspaceInput, CreateNoCodeWorkspaceOutput } from "./scripts/variables/createNoCodeWorkspace.js"`

### create_variable_in_variable_set

Create a new variable in a variable set.

**Parameters:**

- `category`: string (optional)
  Variable category: terraform or env
- `description`: string (optional)
  Variable description
- `hcl`: boolean (optional)
  Whether variable is HCL: true or false
- `key`: string (required)
  Variable key/name
- `sensitive`: boolean (optional)
  Whether variable is sensitive: true or false
- `value`: string (required)
  Variable value
- `variable_set_id`: string (required)
  Variable set ID

**TypeScript Wrapper:** `CreateVariableInVariableSet`

**Import:** `import { CreateVariableInVariableSet, CreateVariableInVariableSetInput, CreateVariableInVariableSetOutput } from "./scripts/variables/createVariableInVariableSet.js"`

### create_variable_set

Create a new variable set in an organization.

**Parameters:**

- `description`: string (optional)
  Variable set description
- `global`: boolean (optional)
  Whether variable set is global: true or false
- `name`: string (required)
  Variable set name
- `terraform_org_name`: string (required)
  Organization name

**TypeScript Wrapper:** `CreateVariableSet`

**Import:** `import { CreateVariableSet, CreateVariableSetInput, CreateVariableSetOutput } from "./scripts/variables/createVariableSet.js"`

### create_workspace_variable

Create a new variable in a Terraform workspace.

**Parameters:**

- `category`: string (optional)
  Variable category: terraform or env
- `description`: string (optional)
  Variable description
- `hcl`: boolean (optional)
  Whether variable is HCL: true or false
- `key`: string (required)
  Variable key/name
- `sensitive`: boolean (optional)
  Whether variable is sensitive: true or false
- `terraform_org_name`: string (required)
  Organization name
- `value`: string (required)
  Variable value
- `workspace_name`: string (required)
  Workspace name

**TypeScript Wrapper:** `CreateWorkspaceVariable`

**Import:** `import { CreateWorkspaceVariable, CreateWorkspaceVariableInput, CreateWorkspaceVariableOutput } from "./scripts/variables/createWorkspaceVariable.js"`

### delete_variable_in_variable_set

Delete a variable in a variable set.

**Parameters:**

- `variable_id`: string (required)
  Variable ID to delete
- `variable_set_id`: string (required)
  Variable set ID

**TypeScript Wrapper:** `DeleteVariableInVariableSet`

**Import:** `import { DeleteVariableInVariableSet, DeleteVariableInVariableSetInput, DeleteVariableInVariableSetOutput } from "./scripts/variables/deleteVariableInVariableSet.js"`

### detach_variable_set_from_workspaces

Detach a variable set from one or more workspaces.

**Parameters:**

- `variable_set_id`: string (required)
  Variable set ID
- `workspace_ids`: string (required)
  Comma-separated list of workspace IDs

**TypeScript Wrapper:** `DetachVariableSetFromWorkspaces`

**Import:** `import { DetachVariableSetFromWorkspaces, DetachVariableSetFromWorkspacesInput, DetachVariableSetFromWorkspacesOutput } from "./scripts/variables/detachVariableSetFromWorkspaces.js"`

### get_workspace_details

Fetches detailed information about a specific Terraform workspace, including configuration, variables, and current state information.

**Parameters:**

- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name
- `workspace_name`: string (required)
  The name of the workspace to get details for

**TypeScript Wrapper:** `GetWorkspaceDetails`

**Import:** `import { GetWorkspaceDetails, GetWorkspaceDetailsInput, GetWorkspaceDetailsOutput } from "./scripts/variables/getWorkspaceDetails.js"`

### list_variable_sets

List all variable sets in an organization. Returns all if query is empty.

**Parameters:**

- `page`: number (optional)
  Page number for pagination (min 1)
- `pageSize`: number (optional)
  Results per page for pagination (min 1, max 100)
- `query`: string (optional)
  Optional filter query for variable set names
- `terraform_org_name`: string (required)
  Organization name

**TypeScript Wrapper:** `ListVariableSets`

**Import:** `import { ListVariableSets, ListVariableSetsInput, ListVariableSetsOutput } from "./scripts/variables/listVariableSets.js"`

### list_workspace_variables

List all variables in a Terraform workspace. Returns all variables if query is empty.

**Parameters:**

- `page`: number (optional)
  Page number for pagination (min 1)
- `pageSize`: number (optional)
  Results per page for pagination (min 1, max 100)
- `terraform_org_name`: string (required)
  Organization name
- `workspace_name`: string (required)
  Workspace name

**TypeScript Wrapper:** `ListWorkspaceVariables`

**Import:** `import { ListWorkspaceVariables, ListWorkspaceVariablesInput, ListWorkspaceVariablesOutput } from "./scripts/variables/listWorkspaceVariables.js"`

### update_workspace_variable

Update an existing variable in a Terraform workspace.

**Parameters:**

- `description`: string (optional)
  Variable description
- `hcl`: boolean (optional)
  Whether variable is HCL: true or false
- `key`: string (required)
  Variable key/name
- `sensitive`: boolean (optional)
  Whether variable is sensitive: true or false
- `terraform_org_name`: string (required)
  Organization name
- `value`: string (required)
  Variable value
- `variable_id`: string (required)
  Variable ID to update
- `workspace_name`: string (required)
  Workspace name

**TypeScript Wrapper:** `UpdateWorkspaceVariable`

**Import:** `import { UpdateWorkspaceVariable, UpdateWorkspaceVariableInput, UpdateWorkspaceVariableOutput } from "./scripts/variables/updateWorkspaceVariable.js"`

## Runs

Terraform run creation and monitoring

**Location:** `scripts/runs/`

### create_run

Creates a new Terraform run in the specified workspace.

**Parameters:**

- `message`: string (optional)
  Optional message for the run
- `run_type`: string (optional)
  A run type for the run
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name
- `workspace_name`: string (required)
  The name of the workspace to create a run in

**TypeScript Wrapper:** `CreateRun`

**Import:** `import { CreateRun, CreateRunInput, CreateRunOutput } from "./scripts/runs/createRun.js"`

### get_run_details

Fetches detailed information about a specific Terraform run.

**Parameters:**

- `run_id`: string (required)
  The ID of the run to get details for

**TypeScript Wrapper:** `GetRunDetails`

**Import:** `import { GetRunDetails, GetRunDetailsInput, GetRunDetailsOutput } from "./scripts/runs/getRunDetails.js"`

### list_runs

List or search Terraform runs in a specific workspace with optional filtering.

**Parameters:**

- `page`: number (optional)
  Page number for pagination (min 1)
- `pageSize`: number (optional)
  Results per page for pagination (min 1, max 100)
- `status`: array (optional)
  Optional run status filter
- `terraform_org_name`: string (required)
  Lists the runs in Terraform Cloud/Enterprise organization based on filters if no workspace is specified
- `vcs_username`: string (optional)
  Searches for runs that match the VCS username you supply
- `workspace_name`: string (optional)
  If specified, lists the runs in the given workspace instead of the organization based on filters

**TypeScript Wrapper:** `ListRuns`

**Import:** `import { ListRuns, ListRunsInput, ListRunsOutput } from "./scripts/runs/listRuns.js"`

## Workspaces

Workspace creation, configuration, and management

**Location:** `scripts/workspaces/`

### create_workspace

Creates a new Terraform workspace in the specified organization. This is a destructive operation that will create new infrastructure resources.

**Parameters:**

- `auto_apply`: string (optional)
  Whether to automatically apply successful plans: 'true' or 'false' (default: 'false')
- `description`: string (optional)
  Optional description for the workspace
- `execution_mode`: string (optional)
  Execution mode: 'remote', 'local', or 'agent' (default: 'remote')
- `project_id`: string (optional)
  Optional project ID to associate the workspace with
- `tags`: string (optional)
  Optional comma-separated list of tags to apply to the workspace
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name
- `terraform_version`: string (optional)
  Optional Terraform version to use (e.g., '1.5.0')
- `vcs_repo_branch`: string (optional)
  Optional VCS repository branch (default: main/master)
- `vcs_repo_identifier`: string (optional)
  Optional VCS repository identifier (e.g., 'org/repo')
- `vcs_repo_oauth_token_id`: string (optional)
  OAuth token ID for VCS integration
- `working_directory`: string (optional)
  Optional working directory for Terraform operations
- `workspace_name`: string (required)
  The name of the workspace to create

**TypeScript Wrapper:** `CreateWorkspace`

**Import:** `import { CreateWorkspace, CreateWorkspaceInput, CreateWorkspaceOutput } from "./scripts/workspaces/createWorkspace.js"`

### create_workspace_tags

Add tags to a Terraform workspace.

**Parameters:**

- `tags`: string (required)
  Comma-separated list of tag names to add, for key-value tags use key:value
- `terraform_org_name`: string (required)
  Organization name
- `workspace_name`: string (required)
  Workspace name

**TypeScript Wrapper:** `CreateWorkspaceTags`

**Import:** `import { CreateWorkspaceTags, CreateWorkspaceTagsInput, CreateWorkspaceTagsOutput } from "./scripts/workspaces/createWorkspaceTags.js"`

### list_workspaces

Search and list Terraform workspaces within a specified organization. Returns all workspaces when no filters are applied, or filters results based on name patterns, tags, or search queries. Supports pagination for large result sets.

**Parameters:**

- `exclude_tags`: string (optional)
  Optional comma-separated list of tags to exclude from results
- `page`: number (optional)
  Page number for pagination (min 1)
- `pageSize`: number (optional)
  Results per page for pagination (min 1, max 100)
- `project_id`: string (optional)
  Optional project ID to filter workspaces
- `search_query`: string (optional)
  Optional search query to filter workspaces by name
- `tags`: string (optional)
  Optional comma-separated list of tags to filter workspaces
- `terraform_org_name`: string (required)
  The Terraform organization name
- `wildcard_name`: string (optional)
  Optional wildcard pattern to match workspace names

**TypeScript Wrapper:** `ListWorkspaces`

**Import:** `import { ListWorkspaces, ListWorkspacesInput, ListWorkspacesOutput } from "./scripts/workspaces/listWorkspaces.js"`

### read_workspace_tags

Read all tags from a Terraform workspace.

**Parameters:**

- `terraform_org_name`: string (required)
  Organization name
- `workspace_name`: string (required)
  Workspace name

**TypeScript Wrapper:** `ReadWorkspaceTags`

**Import:** `import { ReadWorkspaceTags, ReadWorkspaceTagsInput, ReadWorkspaceTagsOutput } from "./scripts/workspaces/readWorkspaceTags.js"`

### update_workspace

Updates an existing Terraform workspace configuration. This is a potentially destructive operation that may affect infrastructure resources.

**Parameters:**

- `auto_apply`: string (optional)
  Whether to automatically apply successful plans: 'true' or 'false'
- `description`: string (optional)
  Optional new description for the workspace
- `execution_mode`: string (optional)
  Execution mode: 'remote', 'local', or 'agent'
- `file_triggers_enabled`: string (optional)
  Whether file triggers are enabled: 'true' or 'false'
- `new_name`: string (optional)
  Optional new name for the workspace
- `queue_all_runs`: string (optional)
  Whether to queue all runs: 'true' or 'false'
- `speculative_enabled`: string (optional)
  Whether speculative plans are enabled: 'true' or 'false'
- `tags`: string (optional)
  Optional comma-separated list of tags to replace existing tags
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name
- `terraform_version`: string (optional)
  Optional new Terraform version to use (e.g., '1.5.0')
- `trigger_prefixes`: string (optional)
  Optional comma-separated list of trigger prefixes
- `working_directory`: string (optional)
  Optional new working directory for Terraform operations
- `workspace_name`: string (required)
  The name of the workspace to update

**TypeScript Wrapper:** `UpdateWorkspace`

**Import:** `import { UpdateWorkspace, UpdateWorkspaceInput, UpdateWorkspaceOutput } from "./scripts/workspaces/updateWorkspace.js"`

## Public Registry

Tools for accessing public Terraform registry (modules, providers, policies)

**Location:** `scripts/public-registry/`

### get_latest_module_version

Fetches the latest version of a Terraform module from the public registry

**Parameters:**

- `module_name`: string (required)
  The name of the module, this is usually the service or group of service the user is deploying e.g., 'security-group', 'secrets-manager' etc.
- `module_provider`: string (required)
  The name of the Terraform provider for the module, e.g., 'aws', 'google', 'azurerm' etc.
- `module_publisher`: string (required)
  The publisher of the module, e.g., 'hashicorp', 'aws-ia', 'terraform-google-modules', 'Azure' etc.

**TypeScript Wrapper:** `GetLatestModuleVersion`

**Import:** `import { GetLatestModuleVersion, GetLatestModuleVersionInput, GetLatestModuleVersionOutput } from "./scripts/public-registry/getLatestModuleVersion.js"`

### get_latest_provider_version

Fetches the latest version of a Terraform provider from the public registry

**Parameters:**

- `name`: string (required)
  The name of the Terraform provider, e.g., 'aws', 'azurerm', 'google', etc.
- `namespace`: string (required)
  The namespace of the Terraform provider, typically the name of the company, or their GitHub organization name that created the provider e.g., 'hashicorp'

**TypeScript Wrapper:** `GetLatestProviderVersion`

**Import:** `import { GetLatestProviderVersion, GetLatestProviderVersionInput, GetLatestProviderVersionOutput } from "./scripts/public-registry/getLatestProviderVersion.js"`

### get_module_details

Fetches up-to-date documentation on how to use a Terraform module. You must call 'search_modules' first to obtain the exact valid and compatible module_id required to use this tool.

**Parameters:**

- `module_id`: string (required)
  Exact valid and compatible module_id retrieved from search_modules (e.g., 'squareops/terraform-kubernetes-mongodb/mongodb/2.1.1', 'GoogleCloudPlatform/vertex-ai/google/0.2.0')

**TypeScript Wrapper:** `GetModuleDetails`

**Import:** `import { GetModuleDetails, GetModuleDetailsInput, GetModuleDetailsOutput } from "./scripts/public-registry/getModuleDetails.js"`

### get_policy_details

Fetches up-to-date documentation for a specific policy from the Terraform registry. You must call 'search_policies' first to obtain the exact terraform_policy_id required to use this tool.

**Parameters:**

- `terraform_policy_id`: string (required)
  Matching terraform_policy_id retrieved from the 'search_policies' tool (e.g., 'policies/hashicorp/CIS-Policy-Set-for-AWS-Terraform/1.0.1')

**TypeScript Wrapper:** `GetPolicyDetails`

**Import:** `import { GetPolicyDetails, GetPolicyDetailsInput, GetPolicyDetailsOutput } from "./scripts/public-registry/getPolicyDetails.js"`

### get_provider_capabilities

Get the capabilities of a Terraform provider including the types of resources, data sources, functions, guides, and other features it supports.
This tool analyzes the provider documentation to determine what types of capabilities are available:
- resources: Infrastructure resources that can be created/managed
- data-sources: Read-only data sources for querying existing infrastructure  
- functions: Provider-specific functions for data transformation
- guides: Documentation guides and tutorials for using the provider
- actions: Available provider actions (if any)
- ephemeral resources: Temporary resources for credentials and tokens
- list resources: Resources for listing multiple items of specific types

Returns a summary with counts and examples for each capability type.

**Parameters:**

- `name`: string (required)
  The name of the Terraform provider, e.g., 'aws', 'azurerm', 'google', etc.
- `namespace`: string (required)
  The namespace of the Terraform provider, typically the name of the company, or their GitHub organization name that created the provider e.g., 'hashicorp'
- `version`: string (optional)
  The version of the provider to analyze (defaults to 'latest')

**TypeScript Wrapper:** `GetProviderCapabilities`

**Import:** `import { GetProviderCapabilities, GetProviderCapabilitiesInput, GetProviderCapabilitiesOutput } from "./scripts/public-registry/getProviderCapabilities.js"`

### get_provider_details

Fetches up-to-date documentation for a specific service from a Terraform provider. 
You must call 'search_providers' tool first to obtain the exact tfprovider-compatible provider_doc_id required to use this tool.

**Parameters:**

- `provider_doc_id`: string (required)
  Exact tfprovider-compatible provider_doc_id, (e.g., '8894603', '8906901') retrieved from 'search_providers'

**TypeScript Wrapper:** `GetProviderDetails`

**Import:** `import { GetProviderDetails, GetProviderDetailsInput, GetProviderDetailsOutput } from "./scripts/public-registry/getProviderDetails.js"`

### search_modules

Resolves a Terraform module name to obtain a compatible module_id for the get_module_details tool and returns a list of matching Terraform modules.
You MUST call this function before 'get_module_details' to obtain a valid and compatible module_id.
When selecting the best match, consider the following:
	- Name similarity to the query
	- Description relevance
	- Verification status (verified)
	- Download counts (popularity)
Return the selected module_id and explain your choice. If there are multiple good matches, mention this but proceed with the most relevant one.
If no modules were found, reattempt the search with a new moduleName query.

**Parameters:**

- `current_offset`: number (optional)
  Current offset for pagination
- `module_query`: string (required)
  The query to search for Terraform modules.

**TypeScript Wrapper:** `SearchModules`

**Import:** `import { SearchModules, SearchModulesInput, SearchModulesOutput } from "./scripts/public-registry/searchModules.js"`

### search_policies

Searches for Terraform policies based on a query string.
This tool returns a list of matching policies, which can be used to retrieve detailed policy information using the 'get_policy_details' tool.
You MUST call this function before 'get_policy_details' to obtain a valid terraform_policy_id.
When selecting the best match, consider the following:
	- Name similarity to the query
	- Title relevance
	- Verification status (verified)
	- Download counts (popularity)
Return the selected policyID and explain your choice. If there are multiple good matches, mention this but proceed with the most relevant one.
If no policies were found, reattempt the search with a new policy_query.

**Parameters:**

- `policy_query`: string (required)
  The query to search for Terraform modules.

**TypeScript Wrapper:** `SearchPolicies`

**Import:** `import { SearchPolicies, SearchPoliciesInput, SearchPoliciesOutput } from "./scripts/public-registry/searchPolicies.js"`

### search_providers

This tool retrieves a list of potential documents based on the 'service_slug' and 'provider_document_type' provided.
You MUST call this function before 'get_provider_details' to obtain a valid tfprovider-compatible 'provider_doc_id'.
Use the most relevant single word as the search query for 'service_slug', if unsure about the 'service_slug', use the 'provider_name' for its value.
When selecting the best match, consider the following:
	- Title similarity to the query
	- Category relevance
Return the selected 'provider_doc_id' and explain your choice.
If there are multiple good matches, mention this but proceed with the most relevant one.

**Parameters:**

- `provider_document_type`: string (required)
  The type of the document to retrieve,
for general overview of the provider use 'overview',
for guidance on upgrading a provider or custom configuration information use 'guides',
for deploying resources use 'resources', for reading pre-deployed resources use 'data-sources',
for functions use 'functions',
for Terraform actions use 'actions'
- `provider_name`: string (required)
  The name of the Terraform provider to perform the read or deployment operation
- `provider_namespace`: string (required)
  The publisher of the Terraform provider, typically the name of the company, or their GitHub organization name that created the provider
- `provider_version`: string (optional)
  The version of the Terraform provider to retrieve in the format 'x.y.z', or 'latest' to get the latest version
- `service_slug`: string (required)
  The slug of the service you want to deploy or read using the Terraform provider, prefer using a single word, use underscores for multiple words and if unsure about the service_slug, use the provider_name for its value

**TypeScript Wrapper:** `SearchProviders`

**Import:** `import { SearchProviders, SearchProvidersInput, SearchProvidersOutput } from "./scripts/public-registry/searchProviders.js"`

## Private Registry

Tools for accessing private Terraform modules and providers

**Location:** `scripts/private-registry/`

### get_private_module_details

This tool retrieves detailed information about a specific private module in your Terraform Cloud/Enterprise organization.
It provides comprehensive details including inputs, outputs, dependencies, versions, and usage examples. The private_module_id format is 'module-namespace/module-name/module-provider-name'.
This can be obtained by calling 'search_private_modules' first to obtain the exact private_module_id required to use this tool. This tool requires a valid Terraform token to be configured.

**Parameters:**

- `private_module_id`: string (required)
  The private module ID should be in the format 'module-namespace/module-name/module-provider-name' (for example, 'my-tfc-org/vpc/aws' or 'my-module-namespace/vm/azurerm').
The module-namespace is usually the name of the Terraform organization. Obtain this ID by calling 'search_private_modules'.
- `private_module_version`: string (optional)
  Specific version of the module to retrieve details for. If not provided, the latest version will be used
- `registry_name`: string (optional)
  The type of Terraform registry to search within Terraform Cloud/Enterprise (e.g., 'private', 'public')
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name

**TypeScript Wrapper:** `GetPrivateModuleDetails`

**Import:** `import { GetPrivateModuleDetails, GetPrivateModuleDetailsInput, GetPrivateModuleDetailsOutput } from "./scripts/private-registry/getPrivateModuleDetails.js"`

### get_private_provider_details

This tool retrieves information about a specific private provider in your Terraform Cloud/Enterprise organization.
It provides details on how to use the provider, permissions, available versions, and more. This tool requires a valid Terraform token to be configured.


**Parameters:**

- `include_versions`: boolean (optional)
  Whether to include detailed version information
- `private_provider_name`: string (required)
  The name of the private provider
- `private_provider_namespace`: string (required)
  The namespace of the private provider in your Terraform Cloud/Enterprise organization. For public registry, use the namespace from the public Terraform registry.
- `registry_name`: string (optional)
  The type of Terraform registry to search within Terraform Cloud/Enterprise (e.g., 'private', 'public')
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name

**TypeScript Wrapper:** `GetPrivateProviderDetails`

**Import:** `import { GetPrivateProviderDetails, GetPrivateProviderDetailsInput, GetPrivateProviderDetailsOutput } from "./scripts/private-registry/getPrivateProviderDetails.js"`

### search_private_modules

This tool searches for private modules in your Terraform Cloud/Enterprise organization.
It retrieves a list of private modules that match the search criteria. This tool requires a valid Terraform token to be configured.

**Parameters:**

- `page_number`: number (optional)
  Page number for pagination (starts at 1)
- `page_size`: number (optional)
  Number of results to return per page (max 100)
- `search_query`: string (optional)
  Optional search query to filter modules by name or namespace. If not provided, all modules will be returned
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name to search within

**TypeScript Wrapper:** `SearchPrivateModules`

**Import:** `import { SearchPrivateModules, SearchPrivateModulesInput, SearchPrivateModulesOutput } from "./scripts/private-registry/searchPrivateModules.js"`

### search_private_providers

This tool searches for private providers in your Terraform Cloud/Enterprise organization.
It retrieves a list of private providers that match the search criteria. This tool requires a valid Terraform token to be configured.

**Parameters:**

- `page_number`: number (optional)
  Page number for pagination (starts at 1)
- `page_size`: number (optional)
  Number of results to return per page (max 100)
- `registry_name`: string (optional)
  The type of Terraform registry to search within Terraform Cloud/Enterprise (e.g., 'private', 'public')
- `search_query`: string (optional)
  Optional search query to filter providers by name or namespace. If not provided, all providers will be returned
- `terraform_org_name`: string (required)
  The Terraform Cloud/Enterprise organization name to search within

**TypeScript Wrapper:** `SearchPrivateProviders`

**Import:** `import { SearchPrivateProviders, SearchPrivateProvidersInput, SearchPrivateProvidersOutput } from "./scripts/private-registry/searchPrivateProviders.js"`

## Organization

Organization and project listing

**Location:** `scripts/organization/`

### list_terraform_orgs

Fetches a list of all Terraform organizations.

**Parameters:**

- `page`: number (optional)
  Page number for pagination (min 1)
- `pageSize`: number (optional)
  Results per page for pagination (min 1, max 100)

**TypeScript Wrapper:** `ListTerraformOrgs`

**Import:** `import { ListTerraformOrgs, ListTerraformOrgsInput, ListTerraformOrgsOutput } from "./scripts/organization/listTerraformOrgs.js"`

### list_terraform_projects

Fetches a list of all Terraform projects.

**Parameters:**

- `page`: number (optional)
  Page number for pagination (min 1)
- `pageSize`: number (optional)
  Results per page for pagination (min 1, max 100)
- `terraform_org_name`: string (required)
  The name of the Terraform organization to list projects for.

**TypeScript Wrapper:** `ListTerraformProjects`

**Import:** `import { ListTerraformProjects, ListTerraformProjectsInput, ListTerraformProjectsOutput } from "./scripts/organization/listTerraformProjects.js"`

## Usage

This skill provides TypeScript wrapper functions and interfaces for all MCP tools.

### Complete Example

```typescript
import { initializeMCPClient, closeMCPClient } from "./scripts/client.js";
import { CreateWorkspace, ListWorkspaces } from "./scripts/workspaces/index.js";
import { CreateVariableSet, CreateVariableInVariableSet } from "./scripts/variables/index.js";
import { GetLatestModuleVersion } from "./scripts/public-registry/index.js";

async function main() {
  // 1. Initialize MCP client
  await initializeMCPClient({
    command: "docker",
    args: [
      "run", "-i", "--rm",
      "-e", `TFE_TOKEN=${process.env.TFE_TOKEN}`,
      "hashicorp/terraform-mcp-server"
    ]
  });

  try {
    // 2. List existing workspaces
    const workspaces = await ListWorkspaces({
      terraform_org_name: "my-org"
    });

    // 3. Get latest module version from registry
    const moduleVersion = await GetLatestModuleVersion({
      module_publisher: "terraform-aws-modules",
      module_name: "vpc",
      module_provider: "aws"
    });

    // 4. Create a new workspace
    const workspace = await CreateWorkspace({
      workspace_name: "production-vpc",
      terraform_org_name: "my-org",
      description: `Using VPC module ${moduleVersion.content[0].text}`,
      auto_apply: "false"
    });

    // 5. Create variable set
    const varSet = await CreateVariableSet({
      terraform_org_name: "my-org",
      name: "aws-credentials",
      description: "AWS credentials for production"
    });

  } finally {
    // 6. Clean up
    await closeMCPClient();
  }
}

main().catch(console.error);
```

### Importing Tools

You can import from individual tool files or category indexes:

```typescript
// Import specific tool with types
import { CreateWorkspace, CreateWorkspaceInput, CreateWorkspaceOutput }
  from "./scripts/workspaces/createWorkspace.js";

// Or import multiple tools from category index
import { CreateWorkspace, UpdateWorkspace, ListWorkspaces }
  from "./scripts/workspaces/index.js";
```

### Error Handling

All wrapper functions return MCP responses. Handle errors appropriately:

```typescript
try {
  const result = await CreateWorkspace({
    workspace_name: "my-workspace",
    terraform_org_name: "my-org"
  });

  if (result.isError) {
    console.error("Workspace creation failed:", result.content);
  } else {
    console.log("Workspace created successfully");
  }
} catch (error) {
  console.error("MCP call failed:", error);
}
```

## Architecture

- **`scripts/client.ts`** - MCP client helper with connection management
- **`scripts/{category}/`** - Category-organized wrapper functions
  - Each tool has its own `.ts` file with Input/Output interfaces and wrapper function
  - `index.ts` provides barrel exports for convenient importing
- **TypeScript types** - Full type safety from JSON Schema definitions

---

*This skill was auto-generated by [mcp-to-claude-skill](https://github.com/hashi-demo-lab/mcp-to-claude-skill)*
// Code generated by tygo. DO NOT EDIT.

//////////
// source: canonical_module.go
/*
From silverpelt/canonical_module
*/

export type CommandExtendedDataMap = Record<string, CommandExtendedData>;
export interface CanonicalModule {
  id: string;
  name: string;
  description: string;
  toggleable: boolean;
  commands_toggleable: boolean;
  web_hidden: boolean;
  virtual_module: boolean;
  is_default_enabled: boolean;
  commands: CanonicalCommand[];
  s3_paths: string[];
  config_options: CanonicalConfigOption[];
}
export interface CanonicalCommand {
  command: CanonicalCommandData;
  extended_data: CommandExtendedDataMap;
}
export interface CanonicalCommandArgument {
  name: string;
  description?: string;
  required: boolean;
  choices: string[];
}
export interface CanonicalCommandData {
  name: string;
  qualified_name: string;
  description?: string;
  nsfw: boolean;
  subcommands: CanonicalCommandData[];
  subcommand_required: boolean;
  arguments: CanonicalCommandArgument[];
}

//////////
// source: config_opts.go

export interface CanonicalSettingsResult {
  Ok?: {
    fields: { [key: string]: any}[];
  };
  PermissionError?: {
    res: PermissionResult;
  };
  Err?: {
    error: CanonicalSettingsError;
  };
}
export interface CanonicalSettingsError {
  OperationNotSupported?: {
    operation: CanonicalOperationType;
  };
  Generic?: {
    message: string;
    src: string;
    typ: string;
  };
  SchemaTypeValidationError?: {
    column: string;
    expected_type: string;
    got_type: string;
  };
  SchemaNullValueValidationError?: {
    column: string;
  };
  SchemaCheckValidationError?: {
    column: string;
    check: string;
    error: string;
    value: any;
    accepted_range: string;
  };
  MissingOrInvalidField?: {
    field: string;
    src: string;
  };
  RowExists?: {
    column_id: string;
    count: number /* int64 */;
  };
  RowDoesNotExist?: {
    column_id: string;
  };
  MaximumCountReached?: {
    max: number /* int64 */;
    current: number /* int64 */;
  };
}
export type CanonicalInnerColumnTypeStringKind = string;
export const CanonicalInnerColumnTypeStringKindNormal: CanonicalInnerColumnTypeStringKind = "Normal";
export const CanonicalInnerColumnTypeStringKindUser: CanonicalInnerColumnTypeStringKind = "User";
export const CanonicalInnerColumnTypeStringKindChannel: CanonicalInnerColumnTypeStringKind = "Channel";
export const CanonicalInnerColumnTypeStringKindRole: CanonicalInnerColumnTypeStringKind = "Role";
export const CanonicalInnerColumnTypeStringKindEmoji: CanonicalInnerColumnTypeStringKind = "Emoji";
export const CanonicalInnerColumnTypeStringKindMessage: CanonicalInnerColumnTypeStringKind = "Message";
export interface CanonicalColumnType {
  Scalar?: {
    column_type: CanonicalInnerColumnType;
  };
  Array?: {
    inner: CanonicalInnerColumnType;
  };
}
export interface CanonicalInnerColumnType {
  Uuid?: {
  };
  String?: {
    min_length?: number /* int */;
    max_length?: number /* int */;
    allowed_values?: string[];
    kind?: CanonicalInnerColumnTypeStringKind;
  };
  Timestamp?: {
  };
  TimestampTz?: {
  };
  Integer?: {
  };
  Float?: {
  };
  BitFlag?: {
    values: Record<string, number /* int64 */>;
  };
  Boolean?: {
  };
  Json?: {
  };
}
export interface CanonicalColumnSuggestion {
  Static?: {
    suggestions: string[];
  };
  Dynamic?: {
    table_name: string;
    column_name: string;
  };
  None?: {
  };
}
export interface CanonicalColumn {
  id: string;
  name: string;
  column_type: CanonicalColumnType;
  nullable: boolean;
  suggestions: CanonicalColumnSuggestion;
  unique: boolean;
  ignored_for: CanonicalOperationType[];
}
export interface CanonicalOperationSpecific {
  corresponding_command: string;
  column_ids: string[];
  columns_to_set: Record<string, string>;
}
export type CanonicalOperationType = string;
export const View: CanonicalOperationType = "View";
export const Create: CanonicalOperationType = "Create";
export const Update: CanonicalOperationType = "Update";
export const Delete: CanonicalOperationType = "Delete";
export interface CanonicalConfigOption {
  id: string;
  name: string;
  description: string;
  table: string;
  guild_id: string;
  primary_key: string;
  columns: CanonicalColumn[];
  operations: Record<CanonicalOperationType, CanonicalOperationSpecific>;
}

//////////
// source: mod.go
/*
From silverpelt/mod.rs
*/

/**
 * PermissionCheck represents the permissions needed to run a command.
 */
export interface PermissionCheck {
  kittycat_perms: string[]; // The kittycat permissions needed to run the command
  native_perms: string /* bigint */[]; // The native permissions needed to run the command (converted from serenity::all::Permissions)
  outer_and: boolean; // Whether the next permission check should be ANDed (all needed) or OR'd (at least one) to the current
  inner_and: boolean; // Whether or not the perms are ANDed (all needed) or OR'd (at least one)
}
/**
 * PermissionChecks represents a list of permission checks.
 */
export interface PermissionChecks {
  checks: PermissionCheck[]; // The list of permission checks
  checks_needed: number /* int */; // Number of checks that need to be true
}
/**
 * CommandExtendedData represents the default permissions needed to run a command.
 */
export interface CommandExtendedData {
  default_perms: PermissionChecks; // The default permissions needed to run this command
  is_default_enabled: boolean; // Whether or not the command is enabled by default
  web_hidden: boolean; // Whether or not the command is hidden from the web interface
  virtual_command: boolean; // Whether or not the command is a virtual command or not
}
/**
 * GuildCommandConfiguration represents guild command configuration data.
 */
export interface GuildCommandConfiguration {
  id: string; // The ID
  guild_id: string; // The guild id (from db)
  command: string; // The command name
  perms?: PermissionChecks; // The permission checks on the command, if unset, will revert to either the modules default_perms and if that is unset, the default perms set on the command itself
  disabled?: boolean; // Whether or not the command is disabled
}
/**
 * GuildModuleConfiguration represents guild module configuration data.
 */
export interface GuildModuleConfiguration {
  id: string; // The ID
  guild_id: string; // The guild id (from db)
  module: string; // The module id
  disabled?: boolean; // Whether or not the module is disabled or not. None means to use the default module configuration
  default_perms?: PermissionChecks; // The default permission checks of the module, can be overrided by the command configuration
}

//////////
// source: permissions.go
/*
From botv2 silverpelt/permissions.rs
*/

export interface PermissionResult {
  var: string;
  message?: string;
  check?: PermissionCheck;
  command_config?: GuildCommandConfiguration;
  module_config?: GuildModuleConfiguration;
  checks?: PermissionChecks;
  error?: string;
}

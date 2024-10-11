// Code generated by tygo. DO NOT EDIT.

//////////
// source: proc.go
/*
Process manager for mewld
*/

/**
 * Internal loader data, to make mewld embeddable and more extendible
 */
export interface LoaderData {
  Start: any; // Start function
  OnReshard: any; // OnReshard function is called when the bot is resharded by mewld
  OnActionLog: any;
}
/**
 * Represents a "cluster" of instances.
 */
export interface ClusterMap {
  ID: number /* int */; // The clusters ID
  Name: string; // The friendly name of the cluster
  Shards: number /* uint64 */[]; // The shard numbers/IDs of the cluster
}
export interface SessionStartLimit {
  total: number /* uint64 */; // Total number of session starts the current user is allowed
  remaining: number /* uint64 */; // Remaining number of session starts the current user is allowed
  reset_after: number /* uint64 */; // Number of milliseconds after which the limit resets
  max_concurrency: number /* uint64 */; // Number of identify requests allowed per 5 seconds
}
/**
 * Represents a response from the 'Get Gateway Bot' API
 */
export interface GatewayBot {
  url: string;
  shards: number /* uint64 */;
  session_start_limit: SessionStartLimit;
}
/**
 * The final store of the ClusterMap list as well as a instance store
 */
export interface InstanceList {
  LastClusterStartedAt: string /* RFC3339 */;
  Map: ClusterMap[]; // The list of clusters (ClusterMap) which defines how mewld will start clusters
  Instances: (Instance | undefined)[]; // The list of instances (Instance) which are running
  ShardCount: number /* uint64 */; // The number of shards in ``mewld``
  GetGatewayBot: GatewayBot; // The response from Get Gateway Bot
  Dir: string; // The base directory instances will use when loading clusters
  RollRestarting: boolean; // whether or not we are roll restarting (rolling restart)
  FullyUp: boolean; // whether or not we are fully up
}
/**
 * Represents a instance of a cluster
 */
export interface Instance {
  StartedAt: string /* RFC3339 */; // The time the instance was last started
  SessionID: string; // Internally used to identify the instance
  ClusterID: number /* int */; // ClusterID from clustermap
  Shards: number /* uint64 */[]; // Shards that this instance is responsible for currently, should be equal to clustermap
  Active: boolean; // Whether or not this instance is active
  ClusterHealth: ShardHealth[]; // Cache of shard health from a ping
  CurrentlyKilling: boolean; // Whether or not we are currently killing this instance
  LockClusterTime?: string /* RFC3339 */; // Time at which we last locked the cluster
  LaunchedFully: boolean; // Whether or not we have launched the instance fully (till launch_next)
  LastChecked: string /* RFC3339 */; // The last time the shard was checked for health.
}
export interface ShardHealth {
  shard_id: number /* uint64 */; // The shard ID
  up: boolean; // Whether or not the shard is up
  latency: number /* float64 */; // Latency of the shard (optional, send if possible)
  guilds: number /* uint64 */; // The number of guilds in the shard. Is optional
  users: number /* uint64 */; // The number of users in the shard. Is optional
}
export interface DiagResponse {
  Nonce: string; // Random nonce used to validate that a nonce comes from a specific diag request
  Data: ShardHealth[]; // The shard health data
}
/**
 * Internal payload for diagnostics
 */
export type StopCode = number /* int */;
export const StopCodeNormal: StopCode = 0;
export const StopCodeRestartFailed: StopCode = -1;

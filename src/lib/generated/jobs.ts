// Code generated by tygo. DO NOT EDIT.

//////////
// source: types.go

export interface JobCreateResponse {
	id: string;
}
/**
 * @ci table=jobs
 * Jobs are background processes that can be run on a coordinator server.
 */
export interface Job {
	id: string;
	name: string;
	output?: Output;
	fields: { [key: string]: any };
	statuses: { [key: string]: any }[];
	owner?: Owner;
	expiry?: any /* time.Duration */;
	state: string;
	resumable: boolean;
	created_at: string /* RFC3339 */;
}
/**
 * @ci table=jobs unfilled=1
 * A PartialJob represents a partial representation of a job.
 */
export interface PartialJob {
	id: string;
	name: string;
	expiry?: any /* time.Duration */;
	state: string;
	created_at: string /* RFC3339 */;
}
export interface JobListResponse {
	jobs: PartialJob[];
}
/**
 * Owner is a struct containing the internal representation of who a job is for
 */
export interface Owner {
	id: string;
	target_type: string;
}
/**
 * Output is the output of a job
 */
export interface Output {
	filename: string;
	segregated: boolean; // If this flag is set, then the stored output will be stored in $jobForSimplexFormat/$Name/$id/$filename instead of $id/$filename
}

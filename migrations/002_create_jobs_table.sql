CREATE TABLE IF NOT EXISTS jobs
(
    job_id bigserial PRIMARY KEY,
    job_name character varying(255),
    job_model_name character varying(255),
    job_path character varying(255),
    job_start_sample bigint NOT NULL,
    job_end_sample bigint NOT NULL,
    job_start_time timestamp without time zone NOT NULL,
    job_end_time timestamp without time zone NOT NULL,
    job_sample_split character varying(255),
    job_priority bigint NOT NULL,
    job_creator_id bigint NOT NULL,
    job_timestamp timestamp without time zone NOT NULL DEFAULT now(),
    CONSTRAINT job_list_job_name_key UNIQUE (job_name)
)
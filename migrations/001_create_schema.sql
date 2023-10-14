CREATE TABLE migrations (migration_id bigserial PRIMARY KEY, name text NOT NULL);
CREATE TABLE users (user_id bigserial PRIMARY KEY, name text NOT NULL);
CREATE TABLE models (model_id bigserial PRIMARY KEY);
CREATE TABLE versions (version_id bigserial PRIMARY KEY, model_id bigint REFERENCES models (model_id) NOT NULL, name text NOT NULL, hash text NOT NULL, saved_at timestamp default current_timestamp, saved_by bigint REFERENCES users (user_id));
CREATE TABLE files (file_id bigserial PRIMARY KEY, hash text NOT NULL, contents bytea NOT NULL);
CREATE UNIQUE INDEX files_hash_unique ON files (hash);
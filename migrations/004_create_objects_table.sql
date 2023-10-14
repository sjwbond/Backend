CREATE TABLE IF NOT EXISTS objects
(
    object_id bigserial PRIMARY KEY,
    name character varying(255),
    CONSTRAINT objects_name_unique UNIQUE (name)
)
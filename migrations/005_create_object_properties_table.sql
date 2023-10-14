CREATE TABLE IF NOT EXISTS object_properties
(
    object_property_id bigserial PRIMARY KEY,
    object_id bigserial REFERENCES objects(object_id) ON DELETE CASCADE,
    property character varying(255),
    CONSTRAINT object_properties_object_id_property_unique UNIQUE (object_id, property)
)
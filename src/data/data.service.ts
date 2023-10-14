import { Inject, Injectable, OnModuleInit, StreamableFile } from '@nestjs/common';
import { readdir, readFile } from 'fs';
import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import { promisify } from 'util';

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);

interface TimeSeriesDataQuery {
    result: string,
    time_series_id: number,
    sample_from: number,
    sample_to: number,
}

@Injectable()
export class DataService implements OnModuleInit  {
    constructor(@Inject(PG_CONNECTION) private conn: Pool) {}

    async onModuleInit(): Promise<void> {
      await this.migrate();
    }

    async migrate(): Promise<void> {
        const files = (await readdirAsync("./migrations"))
            .sort()
            .filter(file => file.endsWith(".sql"))
            .map(file => file.slice(0, file.length - 4));

        for (const file of files) {
            await this.applyMigration(file)
        }
    }

    async applyMigration(name: string): Promise<void> {
        try {
            const res = await this.conn.query("SELECT * FROM migrations WHERE name = $1", [name]);
            if (res.rowCount > 0) return;
        } catch (e) {
            if (e.code != "42P01") throw e; // Table does not exist (before running first migration)
        }

        const sql = await readFileAsync(`./migrations/${name}.sql`);
        await this.conn.query(sql.toString());
        await this.conn.query("INSERT INTO migrations (name) VALUES ($1)", [name]);

        console.log(`Applied migration ${name}`);
    }
  
    async listModels(): Promise<any> {
        const res = await this.conn.query(`WITH models AS (SELECT DISTINCT ON (model_id) version_id "versionId", model_id "modelId", name, hash FROM versions ORDER BY model_id, saved_at DESC) SELECT * from models ORDER BY name`);
        return res.rows;
    }

    async getModelHistory(modelId: number): Promise<any> {
        const res = await this.conn.query(`SELECT version_id "versionId", model_id "modelId", versions.name, hash, saved_at "savedAt", saved_by "savedBy", users.name "savedByName" FROM versions LEFT JOIN users ON versions.saved_by = users.user_id WHERE model_id = $1 ORDER BY saved_at DESC`, [modelId]);
        return res.rows;
    }

    async getModelVersion(versionId: number): Promise<any> {
        const res = await this.conn.query(`SELECT version_id "versionId", model_id "modelId", versions.name, hash, saved_at "savedAt", saved_by "savedBy", users.name "savedByName" FROM versions LEFT JOIN users ON versions.saved_by = users.user_id WHERE version_id = $1`, [versionId]);
        if (res.rows.length < 1) return null;
        return res.rows[0];
    }

    async getModelLatestVersion(modelId: number): Promise<any> {
        const res = await this.conn.query(`SELECT version_id "versionId", model_id "modelId", versions.name, hash, saved_at "savedAt", saved_by "savedBy", users.name "savedByName" FROM versions LEFT JOIN users ON versions.saved_by = users.user_id WHERE model_id = $1 ORDER BY saved_at DESC LIMIT 1`, [modelId]);
        if (res.rows.length < 1) return null;
        return res.rows[0];
    }

    async deleteModel(modelId: number): Promise<void> {
        await this.conn.query("DELETE FROM versions WHERE model_id = $1", [modelId]);
        await this.conn.query("DELETE FROM models WHERE model_id = $1", [modelId]);
    }

    async createModel(model: any): Promise<any> {
        const res = await this.conn.query("INSERT INTO models DEFAULT VALUES RETURNING model_id");
        if (res.rows.length < 1) return null;
        await this.conn.query("INSERT INTO versions (model_id, name, hash, saved_by) VALUES ($1, $2, $3, $4)", [res.rows[0].model_id, model.name, model.hash, model.user_id]);
        return res.rows[0].model_id;
    }

    async updateModel(modelId: number, model: any): Promise<void> {
        await this.conn.query("INSERT INTO versions (model_id, name, hash, saved_by) VALUES ($1, $2, $3, $4)", [modelId, model.name, model.hash, model.user_id]);
    }

    async createFile(hash: string, contents: any): Promise<void> {
        await this.conn.query("INSERT INTO files (hash, contents) VALUES ($1, $2) ON CONFLICT (hash) DO NOTHING", [hash, contents]);
    }

    async getFile(hash: string): Promise<StreamableFile> {
        const res = await this.conn.query("SELECT * FROM files WHERE hash = $1", [hash]);
        if (res.rows.length < 1) return null;
        return new StreamableFile(res.rows[0].contents)
    }

    async listResults(): Promise<any> {
        const res = await this.conn.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name ilike 'result_%'");
        return res.rows.map(row => row.schema_name);
    }
    
    async listTsnForResult(name: string): Promise<any> {
        const nameSanitized = name.replace(/\W/g, '')
        const res = await this.conn.query(`SELECT tsn_id, tsn_name FROM "${nameSanitized}".time_series_name`);
        return res.rows;
    }
    
    async timeSeriesData(result: string, time_series_id: number, sample_from: number, sample_to: number): Promise<any> {
        const resultSanitized = result.replace(/\W/g, '');
        const res = await this.conn.query(`
        SELECT DISTINCT ON (tss_id, tss_sample_number, tsd_tim_id_start) tsd_id, tss_sample_number, tsd_tim_id_start, tsd_value
        FROM "${resultSanitized}".time_series_data
        JOIN "${resultSanitized}".time_series_sample ON tsd_tss_id = tss_id
        WHERE tss_tsn_id = $1 AND tss_sample_number BETWEEN $2 AND $3
        ORDER BY tsd_tim_id_start`, [time_series_id, sample_from, sample_to]);
        return res.rows;
    }
    
    async timeSeriesDataMulti(queries: TimeSeriesDataQuery[]): Promise<any> {
        return Promise.all(
            queries.map(
                async (query) => await this.timeSeriesData(query.result, query.time_series_id, query.sample_from, query.sample_to)
        ));
    }

    async listObjectsAndProperties(): Promise<any> {
        const res = await this.conn.query(`
        SELECT objects.object_id, objects.name, object_properties.object_property_id, object_properties.property
        FROM object_properties
        RIGHT OUTER JOIN objects ON object_properties.object_id = objects.object_id
        ORDER BY object_properties.property
        `);
        
        let objects = {};
        for (const prop of res.rows) {
            if (!(prop["name"] in objects)) {
                objects[prop["name"]] = { id: prop["object_id"], properties: [] };
            }
            objects[prop["name"]].properties.push({ id: prop["object_property_id"], name: prop["property"] });
        }
        return objects;
    }

    async createObject(name: string): Promise<number> {
        const res = await this.conn.query("INSERT INTO objects (name) VALUES ($1) RETURNING object_id", [name]);
        return res.rows[0]["object_id"];
    }

    async deleteObject(objectId: number): Promise<void> {
        await this.conn.query("DELETE FROM objects WHERE object_id = $1", [objectId]);
    }

    async createObjectProperty(objectId: number, name: string): Promise<number> {
        const res = await this.conn.query("INSERT INTO object_properties (object_id, property) VALUES ($1, $2) RETURNING object_property_id", [objectId, name]);
        return res.rows[0]["object_property_id"];
    }

    async deleteObjectProperty(objectPropertyId: number): Promise<void> {
        await this.conn.query("DELETE FROM object_properties WHERE object_property_id = $1", [objectPropertyId]);
    }
}

import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/constants';

@Injectable()
export class QueueService {
  constructor(@Inject(PG_CONNECTION) private conn: Pool) {}

  async pushJobToQueue(modelName: string, hash: string, priority: number) {
    const now = new Date();
    const datetime = now.toISOString().
        replace(/T/, '_').
        replace(/[-:]/g, '').
        replace(/\..+/, '');

    const job = {
        job_name: `${modelName}_${datetime}`,
        job_model_name: modelName,
        job_path: `http://localhost:3000/files/json/${hash}`,
        job_priority: priority,
        job_timestamp: now,
        // Uninitialized non-null fields
        job_creator_id: 0,
        job_start_sample: 0,
        job_end_sample: 0,
        job_start_time: new Date(0),
        job_end_time: new Date(0),
        job_sample_split: "Year"
    };

    const res = await this.conn.query(`
        INSERT INTO jobs (
            job_name, job_model_name, job_path, job_priority, job_creator_id, job_timestamp,
            job_start_sample, job_end_sample, job_start_time, job_end_time, job_sample_split)
        VALUES (
            $1, $2, $3, $4, $5, $6,
            $7, $8, $9, $10, $11)
    `, [
        job.job_name, job.job_model_name, job.job_path, job.job_priority, job.job_creator_id, job.job_timestamp,
        job.job_start_sample, job.job_end_sample, job.job_start_time, job.job_end_time, job.job_sample_split
    ]);
  }
}

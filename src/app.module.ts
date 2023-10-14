import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ModelsController } from './models/models.controller';
import { QueueService } from './jobs/queue.service';
import { FilesController } from './files/files.controller';
import { JobsController } from './jobs/jobs.controller';
import { DataService } from './data/data.service';
import { DataModule } from './data/data.module';
import { ResultsController } from './results/results.controller';
import { ObjectsController } from './objects/objects.controller';

@Module({
  imports: [DataModule],
  controllers: [AppController, ModelsController, FilesController, JobsController, ResultsController, ObjectsController],
  providers: [AppService, QueueService, DataService],
})
export class AppModule {}

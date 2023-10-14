import { Body, Controller, Post } from '@nestjs/common';
import { QueueService } from 'src/jobs/queue.service';

@Controller('jobs')
export class JobsController {
    constructor(private readonly queueService: QueueService) {}

    @Post()
    async pushToQueue(@Body() body: any) {
      await this.queueService.pushJobToQueue(body["name"], body["hash"], body["priority"]);
      return {};
    }
}

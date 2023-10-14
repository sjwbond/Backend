import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DataService } from 'src/data/data.service';

@Controller('results')
export class ResultsController {
    constructor(private readonly dataService: DataService) {}

    @Get()
    async getAll() {
      return await this.dataService.listResults() as any;
    }

    @Get(":name")
    async getTsnForResult(@Param("name") name: string) {
      return await this.dataService.listTsnForResult(name) as any;
    }

    @Post("time_series_data")
    async getTimeSeriesData(@Body() body: any) {
      return (await this.dataService.timeSeriesDataMulti(body)) as any;
    }
}

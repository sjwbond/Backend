import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { DataService } from 'src/data/data.service';

@Controller('models')
export class ModelsController {
    constructor(private readonly dataService: DataService) {}

    @Get()
    async getAll() {
      return await this.dataService.listModels() as any;
    }

    @Get(":id")
    async get(@Param("id") id: number) {
      return await this.dataService.getModelLatestVersion(id) as any;
    }

    @Get("history/:id")
    async getHistory(@Param("id") id: number) {
      return await this.dataService.getModelHistory(id) as any;
    }

    @Get("version/:id")
    async getVersion(@Param("id") id: number) {
      return await this.dataService.getModelVersion(id) as any;
    }

    @Post()
    async create(@Body() body: any) {
      const modelId = await this.dataService.createModel(body);
      return {modelId};
    }

    @Put(":id")
    async update(@Param("id") id: number, @Body() body: any) {
      await this.dataService.updateModel(id, body);
      return {};
    }
}

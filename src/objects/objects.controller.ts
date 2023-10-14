import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DataService } from 'src/data/data.service';

@Controller('objects')
export class ObjectsController {
    constructor(private readonly dataService: DataService) {}

    @Get()
    async getAll() {
      return await this.dataService.listObjectsAndProperties() as any;
    }

    @Post()
    async createObject(@Body() body: any) {
      const objectId = await this.dataService.createObject(body["name"]);
      return {objectId};
    }

    @Delete(":id")
    async deleteObject(@Param("id") objectId: number) {
      await this.dataService.deleteObject(objectId);
      return {};
    }

    @Post(":id")
    async createObjectProperty(@Param("id") objectId: number, @Body() body: any) {
      const objectPropertyId = await this.dataService.createObjectProperty(objectId, body["property"]);
      return {objectPropertyId};
    }

    @Delete("property/:id")
    async deleteObjectProperty(@Param("id") objectPropertyId: number) {
      await this.dataService.deleteObjectProperty(objectPropertyId);
      return {};
    }
}

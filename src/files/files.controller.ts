import { Controller, Get, Header, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createHash } from 'crypto';
import { DataService } from 'src/data/data.service';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { createInflate } from 'zlib';
import { Response } from 'express';

const pipe = promisify(pipeline);

@Controller('files')
export class FilesController {
    constructor(private readonly dataService: DataService) {}

    @Post()
    @UseInterceptors(FileInterceptor("model"))
    async createFile(@UploadedFile() file: Express.Multer.File) {
      const hash = createHash("sha256");
      hash.update(file.buffer);
      const hash_base64 = hash.digest("hex");
      await this.dataService.createFile(hash_base64, file.buffer);
      return {hash: hash_base64};
    }

    @Get("json/:hash")
    @Header("Content-Type", "application/json")
    async getFileUncompressed(@Param("hash") hash: string, @Res() res: Response) {
      const file = await this.dataService.getFile(hash);
      const inflate = createInflate();
      await pipe(file.getStream(), inflate, res as any);
    }

    @Get(":hash")
    async getFile(@Param("hash") hash: string) {
      return await this.dataService.getFile(hash);
    }
}

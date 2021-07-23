import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { resolve } from "path/posix";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { AdministratorService } from "src/services/administrator/administrator.service";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { Administrator } from "src/entities/administrator.entity";
import { ApiResponse } from "src/misc/api.response";

@Controller('api/administrator')
export class AdministratorController {
    constructor(
        private administratorService: AdministratorService
      ) { }

      @Get() //GET http://localhost:3000/api/administrator/
      getAll(): Promise<Administrator[]> {
        return this.administratorService.getAll();
      }
    
      @Get(':id') //GET http://localhost:3000/api/administrator/:id/
      getById(@Param('id') administratorId: number): Promise<Administrator | ApiResponse> {
          return new Promise(async (resolve) => {
            let admin = await this.administratorService.getById(administratorId);

            if (admin === undefined) {
                resolve(new ApiResponse('error', - 1002, 'Administrator not found'))
            }

            resolve(admin);
          });
      }

      @Post() //POST http://localhost:3000/api/administrator/
      add(@Body() data: AddAdministratorDto): Promise<Administrator | ApiResponse>  {
        return this.administratorService.add(data)
      }

      @Patch(':id') //PATCH http://localhost:3000/api/administrator/:id
      edit(@Param('id') id: number, @Body() data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
          return this.administratorService.editById(id, data)
      }
}
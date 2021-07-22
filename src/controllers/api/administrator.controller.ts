import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { AddAdministratorDto } from "src/dtos/administrator/add.administrator.dto";
import { AdministratorService } from "src/dtos/administrator/administrator.service";
import { EditAdministratorDto } from "src/dtos/administrator/edit.administrator.dto";
import { Administrator } from "src/entities/administrator.entity";

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
      getById(@Param('id') administratorId: number): Promise<Administrator> {
        return this.administratorService.getById(administratorId);
      }

      @Post() //POST http://localhost:3000/api/administrator/
      add(@Body() data: AddAdministratorDto): Promise<Administrator> {
        return this.administratorService.add(data)
      }

      @Patch(':id') //PATCH http://localhost:3000/api/administrator/:id
      edit(@Param('id') id: number, @Body() data: EditAdministratorDto): Promise<Administrator> {
          return this.administratorService.editById(id, data)
      }
}
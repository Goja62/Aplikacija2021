import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Administrator } from 'src/entities/administrator.entity';
import { Repository } from 'typeorm';
import { AddAdministratorDto } from '../../dtos/administrator/add.administrator.dto';
import * as crypto from 'crypto'
import { ApiResponse } from 'src/misc/api.response';
import { EditAdministratorDto } from 'src/dtos/administrator/edit.administrator.dto';

@Injectable()
export class AdministratorService {
    constructor(
        @InjectRepository(Administrator) 
        private readonly administrator: Repository<Administrator>
    ) { }

    getAll(): Promise<Administrator[]> {
        return this.administrator.find();
    }

    async getByUserName(username: string): Promise<Administrator | null> {
        const administrator = this.administrator.findOne({
            username: username
        });
        if (administrator) {
            return administrator;
        }

        return null;
    }

    getById(id: number): Promise<Administrator> {
        return this.administrator.findOne(id)
    }

    add(data: AddAdministratorDto): Promise<Administrator | ApiResponse> {
        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        let newAdmin: Administrator = new Administrator();
        newAdmin.username = data.username;
        newAdmin.passwordHash = passwordHashString;

        return new Promise((resolve) => {
            this.administrator.save(newAdmin)
            .then(data => resolve(data))
            .catch(error => {
                const response: ApiResponse = new ApiResponse('error', -1001, 'Administrator name alredy exists');
                resolve(response);
            })
        });
    }

    async editById(id: number, data: EditAdministratorDto): Promise<Administrator | ApiResponse> {
        let admin: Administrator = await this.administrator.findOne(id);

        if (admin === undefined) {
            return new Promise((resolve) => {
                resolve(new ApiResponse('error', - 1002, 'Administrator not found'))
            })
        }

        const passwordHash = crypto.createHash('sha512');
        passwordHash.update(data.password);
        const passwordHashString = passwordHash.digest('hex').toUpperCase();

        admin.passwordHash = passwordHashString;

        return this.administrator.save(admin)
    }
}

import { Body, Controller, Delete, Param, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud } from "@nestjsx/crud";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";
import { diskStorage } from "multer"
import { StorageConfig } from "config/storage.config";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response";
import * as fileType from "file-type";
import * as fs from "fs";
import * as sharp from "sharp";
import { EditArticleDto } from "src/dtos/article/edit.article.dto";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckedGuard } from "src/misc/role.checked.guard";
import { ArticleSearchDto } from "src/dtos/article/article.search.dto";

@Controller('/api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'articleId',
            type: 'number',
            primary: true,
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: true
            },
            articlePrices: {
                eager : true
            },
            photos: {
                eager : true
            },
            features: {
                eager: true
            }
        }
    },
    routes: {
       only: [
           'getOneBase',
           'getManyBase'
       ],
       createOneBase: {
           decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user')
           ]
       },
       createManyBase: {
            decorators: [
                UseGuards(RoleCheckedGuard),
                AllowToRoles('administrator', 'user')
           ]
       }
    }
})
export class ArticleController {
    constructor(
        public service: ArticleService,
        public photoService: PhotoService,
    ) {}

    @Post() //POST http://localhost:3000/api/article/
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
     createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }

    @Patch(':id') //PATCH http://localhost:3000/api/article/:id
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    editFullarticle(@Param('id') id: number, @Body() data: EditArticleDto) {
        return this.service.editFullArticle(id, data);
    }

    @Post(':id/uploadPhoto/') //POST http://localhost:3000/api/article/:id/uploadPhoto/
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photo.destination,
                // Ovo je inline array funkcja i mora da sadrži tri argumenta
                filename: (req, file, callback) => {
                    let original: string = file.originalname;

                    let normalized = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, '')
                    let sada = new Date();
                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth() + 1).toString();
                    datePart += sada.getDate().toString();

                    let randomPart: string = 
                    new Array(10)
                        .fill(0)
                        .map(e => (Math.random() * 9).toFixed(0).toString())
                        .join('')
                    
                    let fileName = datePart + '-' + randomPart + '-' + normalized;
                    
                    fileName = fileName.toLowerCase();

                    callback(null, fileName);
                } 
            }),
            fileFilter: (req, file, callback) => {
                //Provera ekstenzije JPG, PNG
                if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
                    req.fileFilterError = 'Bad file extension!'; 
                    callback(null, false);
                    return;
                }

                // Provera tima sadržaja: jpeg, png (mimetype)
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    req.fileFilterError = 'Bad file content type!';
                    callback(null, false);
                    return;
                }

                callback(null, true);
            },

            limits: {
                files: 1,
                fileSize: StorageConfig.photo.maxSize,
            }
        })
    )
    async uploadPhoto(
        @Param('id') articleId: number, 
        @UploadedFile() photo,
        @Req() req
    ): Promise<Photo | ApiResponse> {
        //Zapis u bazu podataka
        if (req.fileFilterError) {
            return new ApiResponse('error', -4002, req.fileFilterError)
        }

        if (!photo) {
            return new ApiResponse('error', -4002, 'File not uploaded')
        }

        const fileTypeResult = await fileType.fromFile(photo.path);
        if(!fileTypeResult) {
            // Ukoliko fajl nije učitan mora se obrisati:
            fs.unlinkSync(photo.path)
            return new ApiResponse('error', -4002, 'Cannot detect file type')
        }

        const realMimeType =  fileTypeResult.mime
        if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
            // Ukoliko fajl nije učitan mora se obrisati:
            fs.unlinkSync(photo.path)
            return new ApiResponse('error', -4002, 'Bad file content type!')
        }

        await this.creteResizedImage(photo, StorageConfig.photo.resize.thumb)
        await this.creteResizedImage(photo, StorageConfig.photo.resize.small); 

        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);

        if (!savedPhoto) {
            return new ApiResponse('error', -4001, 'No file found');
        }

        return savedPhoto
    }

       async creteResizedImage(photo, resizeSetings) {
        const originalFilePath = photo.path;
        const fileName = photo.filename;

        const destinationFilePath = StorageConfig.photo.destination + resizeSetings.directory + fileName;

        await sharp(originalFilePath)
            .resize({
                fit: 'cover',
                width: resizeSetings.width,
                height: resizeSetings.height
            })
            .toFile(destinationFilePath);
    }

    @Delete(':articleId/deletePhoto/:photoId') //DELETE http://localhost:3000/api/article/articleId/deletePhoto/:photoId/
    @UseGuards(RoleCheckedGuard)
    @AllowToRoles('administrator')
    public async deletePhoto(
        @Param('articleId') articleId: number,
        @Param('photoId') photoId: number,
    ) {
        const photo = await this.photoService.findOne({
            articleId: articleId,
            photoId: photoId,
        });

        if (!photo) {
            return new ApiResponse('error', -4004, 'Photo not found!');
        }
        try {
            fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath)
            fs.unlinkSync(StorageConfig.photo.destination + StorageConfig.photo.resize.thumb.directory + photo.imagePath)
            fs.unlinkSync(StorageConfig.photo.destination + StorageConfig.photo.resize.small.directory + photo.imagePath)
        } catch(e) {

        }
        const deleteResult =  await this.photoService.deleteById(photo.photoId);

        if (deleteResult.affected === 0) {
            return new ApiResponse('error', -4004, 'Photo not found!');
        }

        return new ApiResponse('ok', 0, 'One photo is deleted');
    }

    @Post('search') //POST http://localhost:3000/api/article/search
    
    @AllowToRoles('administrator', 'user')
    @UseGuards(RoleCheckedGuard)
    async search(@Body() data: ArticleSearchDto): Promise<Article[]> {
        return await this.service.search(data);
    }
}
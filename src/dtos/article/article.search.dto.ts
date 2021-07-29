import * as Validator from 'class-validator';
import { IsOptional, IsString } from 'class-validator';
import { ArticleSearchFeatureDto } from './article.search.feature.dto';

export class ArticleSearchDto {
    @Validator.IsNotEmpty()
    @Validator.IsPositive()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 0
    })
    categoryId: number;
    
    @IsOptional()
    @IsString()
    @Validator.Length(0, 128)
    keywords: string;

    @Validator.IsOptional()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    priceMin: number;

    @Validator.IsOptional()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 2,
    })
    priceMax: number;

    features: ArticleSearchFeatureDto[];
    
    @Validator.IsOptional()
    @Validator.IsIn(['name', 'price'])
    orderBy: 'name' | 'price'

    @Validator.IsOptional()
    @Validator.IsIn(['ASC', 'DESC'])
    orderDirection: 'ASC' | 'DESC';

    @Validator.IsOptional()
    @Validator.IsNumber({
        allowInfinity: false,
        allowNaN: false,
        maxDecimalPlaces: 0
    })
    @Validator.IsPositive()
    page: number;

    @Validator.IsOptional()
    @Validator.IsIn([5, 10, 25, 50, 75])
    itemsPerPage: 5 | 10 | 25 | 50 | 75;
}
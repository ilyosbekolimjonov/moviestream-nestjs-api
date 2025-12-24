import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
    @ApiProperty({
        description: 'Kino ID si',
        example: '550e8400-e29b-41d4-a716-446655440021'
    })
    @IsNotEmpty({ message: 'movie_id majburiy' })
    @IsUUID('4', { message: "Noto'g'ri movie_id formati" })
    movie_id: string;
}
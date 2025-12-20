import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        example: 'john_doe',
        description: 'Username (3-50 characters)',
        minLength: 3,
        maxLength: 50,
    })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    username: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'User email address',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'StrongPass123',
        description: 'Password (minimum 8 characters, must include uppercase, lowercase, and number)',
        minLength: 8,
    })
    @IsString()
    @MinLength(8)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/,
        {
            message: 'Password must contain uppercase, lowercase, and number',
        },
    )
    password: string;
}

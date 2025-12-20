import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT access token',
    })
    accessToken: string;

    @ApiProperty({
        example: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            username: 'john_doe',
            email: 'john.doe@example.com',
            role: 'user',
        },
        description: 'User information',
    })
    user: {
        id: string;
        username: string;
        email: string;
        role: string;
        avatarUrl?: string;
        createdAt?: Date
    };
}
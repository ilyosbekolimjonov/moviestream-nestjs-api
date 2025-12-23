import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    let slug = dto.slug
      ? slugify(dto.slug, { lower: true, strict: true })
      : slugify(dto.name, { lower: true, strict: true });

    let counter = 1;
    while (await this.prisma.category.findUnique({ where: { slug } })) {
      slug = `${slug}-${counter}`;
      counter++;
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description ?? null,
      },
    });

    return category;
  }

  async findAll() {
    return this.prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    const data: any = { ...dto };

    if (dto.slug) {
      const slugValue = slugify(dto.slug, { lower: true, strict: true });
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: slugValue }
      });
      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          `Category with slug "${slugValue}" already exists`
        );
      }

      data.slug = slugValue;
    }

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data
      });
      return updated;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this slug already exists');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    return { success: true, message: 'Category removed' };
  }
} 

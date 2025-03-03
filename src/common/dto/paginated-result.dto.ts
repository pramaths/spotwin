import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page number' })
  readonly page: number;

  @ApiProperty({ description: 'Number of items per page' })
  readonly limit: number;

  @ApiProperty({ description: 'Total number of items' })
  readonly totalItems: number;

  @ApiProperty({ description: 'Total number of pages' })
  readonly totalPages: number;

  @ApiProperty({ description: 'Indicates if there is a next page' })
  readonly hasNextPage: boolean;

  @ApiProperty({ description: 'Indicates if there is a previous page' })
  readonly hasPreviousPage: boolean;

  constructor(page: number, limit: number, totalItems: number) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

export class PaginatedResultDto<T> {
  @ApiProperty({ isArray: true })
  readonly items: T[];

  @ApiProperty()
  readonly meta: PaginationMetaDto;

  constructor(items: T[], meta: PaginationMetaDto) {
    this.items = items;
    this.meta = meta;
  }

  static create<T>(
    items: T[],
    page: number,
    limit: number,
    totalItems: number,
  ): PaginatedResultDto<T> {
    const meta = new PaginationMetaDto(page, limit, totalItems);
    return new PaginatedResultDto(items, meta);
  }
}

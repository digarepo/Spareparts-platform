import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsOptional, MaxLength } from 'class-validator';

/**
 * Ethiopia Address DTO with strict validation rules.
 *
 * @remarks
 * - **Scope:** Address validation for Ethiopia marketplace
 * - **Authority:** Business rule enforcement for Ethiopian addresses
 * - **Invariants:** Ethiopia-only addresses, required fields, format validation
 *
 * Features:
 * - Ethiopia country validation (Ethiopia or ET only)
 * - Required field validation
 * - Length constraints
 * - Optional fields for extended address info
 */
export class EthiopiaAddressDto {
  @ApiProperty({
    description: 'Street address (required)',
    example: 'Bole Medhanealem, Addis Ababa',
    maxLength: 200,
  })
  @IsString({ message: 'Street must be a string' })
  @IsNotEmpty({ message: 'Street is required' })
  @MaxLength(200, { message: 'Street address cannot exceed 200 characters' })
  street!: string;

  @ApiProperty({
    description: 'City name (required)',
    example: 'Addis Ababa',
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @MaxLength(100, { message: 'City name cannot exceed 100 characters' })
  city!: string;

  @ApiProperty({
    description: 'Country (must be Ethiopia or ET)',
    example: 'Ethiopia',
    enum: ['Ethiopia', 'ET'],
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @Matches(/^(Ethiopia|ET)$/, { message: 'Country must be Ethiopia or ET' })
  country!: string;

  @ApiProperty({
    description: 'Postal code (optional)',
    example: '1000',
    required: false,
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Postal code must be a string' })
  @MaxLength(20, { message: 'Postal code cannot exceed 20 characters' })
  postalCode?: string;

  @ApiProperty({
    description: 'State/Region (optional)',
    example: 'Addis Ababa',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(100, { message: 'State name cannot exceed 100 characters' })
  state?: string;

  @ApiProperty({
    description: 'Building/Apartment number (optional)',
    example: 'Building 12, Apt 3B',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Building must be a string' })
  @MaxLength(100, { message: 'Building info cannot exceed 100 characters' })
  building?: string;

  @ApiProperty({
    description: 'Additional address notes (optional)',
    example: 'Near Bole International Airport',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(500, { message: 'Address notes cannot exceed 500 characters' })
  notes?: string;
}

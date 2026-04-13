import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EthiopiaAddressDto } from '../dto/ethiopia-address.dto';

/**
 * Ethiopia Address Validation Pipe with strict business rules.
 *
 * @remarks
 * - **Scope:** Address validation for checkout and order operations
 * - **Authority:** Business rule enforcement for Ethiopia marketplace
 * - **Invariants:** Ethiopia-only addresses, required fields validation
 * - **Security:** Prevents malformed address data, enforces geographic constraints
 *
 * Features:
 * - Ethiopia country validation (Ethiopia or ET only)
 * - Required field validation (street, city, country)
 * - Comprehensive error messages
 * - Production-grade error handling
 */
@Injectable()
export class AddressValidationPipe implements PipeTransform {
  /**
   * Transform and validate address data.
   *
   * @param value - Raw address data to validate
   * @param metadata - Argument metadata
   * @returns Promise<EthiopiaAddressDto> Validated address
   * @throws {BadRequestException} When validation fails
   */
  async transform(value: Record<string, unknown>, metadata: ArgumentMetadata): Promise<EthiopiaAddressDto> {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Address must be a valid object');
    }

    // Convert to DTO and validate
    const addressDto = plainToClass(EthiopiaAddressDto, value);
    const validationErrors = await validate(addressDto);

    if (validationErrors.length > 0) {
      const errorMessages = validationErrors.map(error => {
        const constraints = Object.values(error.constraints || {});
        return `${error.property}: ${constraints.join(', ')}`;
      });

      throw new BadRequestException(`Address validation failed: ${errorMessages.join('; ')}`);
    }

    return addressDto;
  }
}

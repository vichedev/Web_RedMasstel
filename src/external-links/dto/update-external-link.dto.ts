import { PartialType } from '@nestjs/mapped-types';
import { CreateExternalLinkDto } from './create-external-link.dto';

export class UpdateExternalLinkDto extends PartialType(CreateExternalLinkDto) { }

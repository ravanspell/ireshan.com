import { Injectable, inject } from '@lib/di/injectable';
import { Authenticated } from '@lib/auth/authenticated';
import { BaseService } from './base.service';
import { TagRepository } from '@repositories/tag.repository';
import type { CreateTagDto, UpdateTagDto } from '@dtos/tag.dto';

/**
 * Tag Service
 * Contains business logic for tag operations
 */
@Injectable()
export class TagService extends BaseService {
  constructor(@inject(TagRepository) private tagRepository: TagRepository) {
    super();
  }

  /**
   * Create a new tag
   * Validates slug and name uniqueness before creating
   */
  @Authenticated()
  async createTag(data: CreateTagDto) {
    // Check if slug already exists
    const slugExists = await this.tagRepository.slugExists(data.slug);
    if (slugExists) {
      this.conflict('A tag with this slug already exists');
    }

    // Check if name already exists
    const nameExists = await this.tagRepository.nameExists(data.name);
    if (nameExists) {
      this.conflict('A tag with this name already exists');
    }

    return this.tagRepository.create(data);
  }

  /**
   * Get tag by slug
   */
  async getTagBySlug(slug: string) {
    const tag = await this.tagRepository.findBySlug(slug);

    if (!tag) {
      this.notFound('Tag');
    }

    return tag;
  }

  /**
   * Get tag by ID
   */
  async getTagById(id: string) {
    const tag = await this.tagRepository.findById(id);

    if (!tag) {
      this.notFound('Tag');
    }

    return tag;
  }

  /**
   * Get all tags
   */
  async getAllTags() {
    return this.tagRepository.findAll();
  }

  /**
   * Update an existing tag
   * Validates slug and name uniqueness if they are being updated
   */
  @Authenticated()
  async updateTag(id: string, data: Partial<UpdateTagDto>) {
    // If updating slug, check if new slug already exists
    if (data.slug) {
      const slugExists = await this.tagRepository.slugExists(data.slug, id);
      if (slugExists) {
        this.conflict('A tag with this slug already exists');
      }
    }

    // If updating name, check if new name already exists
    if (data.name) {
      const nameExists = await this.tagRepository.nameExists(data.name, id);
      if (nameExists) {
        this.conflict('A tag with this name already exists');
      }
    }

    return this.tagRepository.update(id, data);
  }

  /**
   * Delete a tag
   */
  @Authenticated()
  async deleteTag(id: string) {
    return this.tagRepository.delete(id);
  }
}

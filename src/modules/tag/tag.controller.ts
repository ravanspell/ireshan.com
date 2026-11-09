import { BaseController } from '@lib/core/base.controller';
import { TagService } from './tag.service';
import { createTagSchema, updateTagSchema } from './tag.dto';

/** The admin page that lists tags - cleared after every tag write. */
const TAGS_ADMIN_PATH = '/admin/tags';

/**
 * Tag Controller
 * Handles Server Actions for tag operations
 */
export class TagController extends BaseController {
  constructor(private tagService: TagService) {
    super();
  }

  // ---------- Writes ----------

  /**
   * Create a new tag
   * Server Action handler
   */
  createTag(formData: FormData) {
    const input = {
      name: formData.get('name'),
      slug: formData.get('slug'),
    };

    return this.runValidated(createTagSchema, input, 'Failed to create tag', async (data) => {
      const tag = await this.tagService.createTag(data);
      this.revalidate(TAGS_ADMIN_PATH);
      return tag;
    });
  }

  /**
   * Update an existing tag
   * Server Action handler
   */
  updateTag(formData: FormData) {
    const input = {
      id: formData.get('id'),
      name: formData.get('name'),
      slug: formData.get('slug'),
    };

    return this.runValidated(updateTagSchema, input, 'Failed to update tag', async (data) => {
      const tag = await this.tagService.updateTag(data.id, data);
      this.revalidate(TAGS_ADMIN_PATH);
      return tag;
    });
  }

  /**
   * Delete a tag
   * Server Action handler
   */
  deleteTag(id: string) {
    return this.run('Failed to delete tag', async () => {
      await this.tagService.deleteTag(id);
      this.revalidate(TAGS_ADMIN_PATH);
    });
  }

  // ---------- Reads ----------

  /** Get tag by slug */
  getTagBySlug(slug: string) {
    return this.run('Tag not found', () => this.tagService.getTagBySlug(slug));
  }

  /** Get all tags */
  getAllTags() {
    return this.run('Failed to fetch tags', () => this.tagService.getAllTags());
  }
}

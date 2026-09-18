import { Injectable, inject } from "@lib/di/injectable";
import { BaseController } from "./base.controller";
import { TagService } from "@services/tag.service";
import { createTagSchema, updateTagSchema } from "@dtos/tag.dto";
import { revalidatePath } from "next/cache";

/**
 * Tag Controller
 * Handles Server Actions for tag operations
 */
@Injectable()
export class TagController extends BaseController {
  constructor(@inject(TagService) private tagService: TagService) {
    super();
  }

  /**
   * Create a new tag
   * Server Action handler
   */
  async createTag(formData: FormData) {
    try {
      const data = {
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
      };

      // Validate with Zod
      const validated = createTagSchema.parse(data);

      // Create tag
      const tag = await this.tagService.createTag(validated);

      // Revalidate cache
      revalidatePath("/admin/tags");

      return { success: true as const, data: tag };
    } catch (error) {
      return this.handleError(error, "Failed to create tag");
    }
  }

  /**
   * Update an existing tag
   * Server Action handler
   */
  async updateTag(formData: FormData) {
    try {
      const data = {
        id: formData.get("id") as string,
        name: formData.get("name") as string,
        slug: formData.get("slug") as string,
      };

      // Validate with Zod
      const validated = updateTagSchema.parse(data);

      // Update tag
      const tag = await this.tagService.updateTag(validated.id, validated);

      // Revalidate cache
      revalidatePath("/admin/tags");

      return { success: true as const, data: tag };
    } catch (error) {
      return this.handleError(error, "Failed to update tag");
    }
  }

  /**
   * Get tag by slug
   */
  async getTagBySlug(slug: string) {
    try {
      const tag = await this.tagService.getTagBySlug(slug);
      return { success: true as const, data: tag };
    } catch (error) {
      return this.handleError(error, "Tag not found");
    }
  }

  /**
   * Get all tags
   */
  async getAllTags() {
    try {
      const tags = await this.tagService.getAllTags();
      return { success: true as const, data: tags };
    } catch (error) {
      return this.handleError(error, "Failed to fetch tags");
    }
  }

  /**
   * delete blog post tags
   * 
   * @param id tag id
   * @returns 
   */
  async deleteTag(id: string) {
    try {
      await this.tagService.deleteTag(id);

      // Revalidate cache
      revalidatePath("/admin/tags");

      return { success: true as const, data: undefined };
    } catch (error) {
      return this.handleError(error, "Failed to delete tag");
    }
  }
}

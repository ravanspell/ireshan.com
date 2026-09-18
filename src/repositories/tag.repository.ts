import { Injectable, inject } from "@lib/di/injectable";
import { Db } from "@lib/db";
import { BaseRepository } from "./base.repository";
import { toTag } from "@models/tag.model";
import { CreateTagDto, UpdateTagDto } from "@dtos/tag.dto";
import { slugify } from "@lib/slug";

/**
 * Tag Repository
 * Handles data access for Tag entities
 */
@Injectable()
export class TagRepository extends BaseRepository {
  constructor(@inject(Db) private db: Db) {
    super();
  }

  /**
   * Create a new tag
   */
  async create(data: CreateTagDto) {
    const tag = await this.db.tag.create({
      data,
    });

    return toTag(tag);
  }

  /**
   * Find tag by ID.
   *
   * The tag's posts are deliberately not joined in: nothing reads them, and
   * loading them would pull every block document belonging to the tag.
   * A post-by-tag listing belongs on `PostRepository`, filtered and paged.
   */
  async findById(id: string) {
    const tag = await this.db.tag.findUnique({ where: { id } });

    return tag ? toTag(tag) : null;
  }

  /**
   * Find tag by slug. Posts are not joined in - see `findById`.
   */
  async findBySlug(slug: string) {
    const tag = await this.db.tag.findUnique({ where: { slug } });

    return tag ? toTag(tag) : null;
  }

  /**
   * Get all tags
   */
  async findAll() {
    const tags = await this.db.tag.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return tags.map(toTag);
  }

  /**
   * Resolve a list of tag names to tag rows, creating the ones that don't
   * exist yet. What the editor's free-text tag field needs: an author types
   * names, not ids, and a name may be new.
   *
   * Matching is by slug rather than by the raw name, so "Web Dev", "web dev"
   * and "web-dev" are the same tag instead of three near-duplicates.
   */
  async findOrCreateManyByName(names: string[]) {
    // First spelling of a slug wins, so the name is stored as the author
    // first typed it rather than as whatever came last in the array.
    const wanted = new Map<string, string>();

    for (const raw of names) {
      const name = raw.trim();
      const slug = slugify(name);
      // A name of only punctuation slugifies to nothing and has no usable URL.
      if (!name || !slug) continue;
      if (!wanted.has(slug)) wanted.set(slug, name);
    }

    if (wanted.size === 0) return [];

    const slugs = [...wanted.keys()];
    const existing = await this.db.tag.findMany({ where: { slug: { in: slugs } } });
    const existingSlugs = new Set(existing.map((tag) => tag.slug));
    const missing = slugs.filter((slug) => !existingSlugs.has(slug));

    if (missing.length > 0) {
      await this.db.tag.createMany({
        // Two posts saved at once can race to create the same new tag; the
        // loser of that race wants the existing row, not a unique violation.
        skipDuplicates: true,
        data: missing.map((slug) => ({ slug, name: wanted.get(slug) as string })),
      });
    }

    const tags = await this.db.tag.findMany({ where: { slug: { in: slugs } } });

    return tags.map(toTag);
  }

  /**
   * Update a tag
   */
  async update(id: string, data: Partial<UpdateTagDto>) {
    const tag = await this.db.tag.update({
      where: { id },
      data,
    });

    return toTag(tag);
  }

  /**
   * Delete a tag
   */
  async delete(id: string) {
    await this.db.tag.delete({
      where: { id },
    });
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string) {
    const tag = await this.db.tag.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!tag) return false;
    if (excludeId && tag.id === excludeId) return false;

    return true;
  }

  /**
   * Check if name exists
   */
  async nameExists(name: string, excludeId?: string) {
    const tag = await this.db.tag.findUnique({
      where: { name },
      select: { id: true },
    });

    if (!tag) return false;
    if (excludeId && tag.id === excludeId) return false;

    return true;
  }
}

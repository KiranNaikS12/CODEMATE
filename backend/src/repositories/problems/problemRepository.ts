import { Model } from "mongoose";
import { FilterOptions, ProblemTypes } from "../../types/problemTypes";
import { injectable, inject } from "inversify";
import { IProblemRepository } from "./IProblemRepository";
import { BaseRepository } from "../base/baseRepository";


@injectable()
export class ProblemRepository extends BaseRepository<ProblemTypes> implements IProblemRepository {
  constructor(
    @inject("ProblemModel") private problemModal: Model<ProblemTypes>
  ) { 
     super(problemModal)
  }

  
  private getSortOption(sortOption?: string) {
    switch (sortOption) {
      case 'Recent':
        return { createdAt: -1 };
      case 'Oldest':
        return { createdAt: 1 };
      case 'A-Z':
        return { title: 1 };
      case 'Z-A':
        return { title: -1 };
      default:
        return { createdAt: 1 };
    }
  }


  async listProblems(
    filter: FilterOptions,
    page: number = 1,
    limit: number = 8
  ): Promise<{ problems: ProblemTypes[]; total: number }> {
    try {
      let query: any = {};
      if (filter.searchTerm?.trim()) {
        const searchTerm = filter.searchTerm.trim();

        const isNumeric = !isNaN(Number(searchTerm));

        if (isNumeric) {
          query.$or = [
            { slno: Number(searchTerm) },
            { title: { $regex: new RegExp(searchTerm, 'i') } },
          ];
        } else {
          query.$or = [
            { title: { $regex: filter.searchTerm, $options: 'i' } },
          ];
        }
      }


      if (filter.filterLevel?.trim()) {
        query.difficulty = filter.filterLevel;
      }

      if (filter.filterTag && filter?.filterTag.length > 0) {
        query.tags = { $in: filter.filterTag };
      }

      const sortOption: any = this.getSortOption(filter.sortOption);


      const [problems, total] = await Promise.all([
        this.problemModal
          .find(query)
          .sort(sortOption)
          .skip((page - 1) * limit)
          .limit(limit)
          .exec(),
        this.problemModal.countDocuments(query)
      ]);

      return {
        problems,
        total
      };
    } catch (error) {
      console.error('Error in listProblems repository:', error);
      throw error;
    }
  }

  async updateProblemStatus(
    id: string,
    data: Partial<ProblemTypes>
  ): Promise<ProblemTypes | null> {
    return this.problemModal.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async countDocuments(difficulty: 'easy' | 'medium' | 'hard') : Promise<number> {
    return await this.problemModal.countDocuments({difficulty});
  
  }

  async totalProblems(): Promise<{ easy: number; medium: number; hard: number; total: number }> {
    const totalCount = await this.problemModal.countDocuments();
    const easyCount = await this.problemModal.countDocuments({ difficulty: "easy" });
    const mediumCount = await this.problemModal.countDocuments({ difficulty: "medium" });
    const hardCount = await this.problemModal.countDocuments({ difficulty: "hard" });

    return {
          easy: easyCount,
          medium: mediumCount,
          hard: hardCount,
          total: totalCount,
    }
  }
}


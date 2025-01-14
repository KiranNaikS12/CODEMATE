import { Model, Document, PopulateOptions, FilterQuery } from 'mongoose';
import { ICourseRepository } from './ICourseRepository';
import { BaseRepository } from '../base/baseRepository';
import { FilterOptions, ICourse } from '../../types/courseTypes';
import { inject, injectable } from 'inversify';

@injectable()
export class CourseRepository extends BaseRepository<ICourse> implements ICourseRepository {

   private readonly defaultPropulateOptions: PopulateOptions = {
      path: 'tutorId',
      select: '_id fullname contact email specialization company experience profileImage',
      model: 'Tutor'
   }

   constructor(
      @inject('CourseModel') private courseModel: Model<ICourse & Document>
   ) {
      super(courseModel);
   }

   async findTutorByCourseId(courseId: string): Promise<ICourse | null> {
      return await this.findOneWithPopulate(
         {_id: courseId},
         this.defaultPropulateOptions
      )
   }

   async listCourses(filter?: FilterOptions): Promise<ICourse[]> {
      let query: FilterQuery<ICourse & Document> = {};
      if (filter?.searchTerm?.trim()) {
         const searchTerm = filter.searchTerm.trim();

         query.$or = [
            { title: { $regex: new RegExp(searchTerm, 'i') } },
            { tutorName: { $regex: new RegExp(searchTerm, 'i') } }
         ];

      }
      return this.model.find(query)
   }
}
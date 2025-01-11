import {Model, Document, FilterQuery, UpdateQuery, PopulateOptions} from 'mongoose'
import { IBaseRepository } from './IBaseRepository';
import { injectable } from 'inversify';


@injectable()
export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(initialModel: Model<T>) {
        this.model = initialModel; // Initially set the model
    }

    setModel(newModel: Model<T>) : void {
        this.model = newModel;
    }

    async create(data: Partial<T>) : Promise<T>{
        const created = new this.model(data);
        return await created.save();
    }
    
    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
       
    }

    async findOne(filter: FilterQuery<T>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    }

    async findOneWithPopulate(filter: FilterQuery<T>, populateOptions: PopulateOptions | PopulateOptions[]) : Promise<T | null>  {
        return this.model.findOne(filter).populate(populateOptions).exec()
    }

    async find(filter: FilterQuery<T>): Promise<T[]> {
        return this.model.find(filter).exec();
    }

    async update(id: string, data: UpdateQuery<T> | Partial<T>): Promise<T | null> {
        // If the update includes MongoDB operators ($set, $push, etc.), use it directly
        // Otherwise, wrap it in $set
        const updateData = '$set' in data ? data : {$set: data};
        return this.model.findByIdAndUpdate(id, updateData as UpdateQuery<T>, { new: true, overwrite: false }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async updateMany(filter: Record<string, any>, update:Record<string, any>) : Promise<any> {
        return this.model.updateMany(filter,update)
    }
}
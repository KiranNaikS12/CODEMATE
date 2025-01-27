import { Model, Document, FilterQuery, PopulateOptions } from "mongoose";

export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string) : Promise<T | null>;
    findOne(filter: FilterQuery<T>) : Promise<T | null>;
    findOneWithPopulate(filter: FilterQuery<T>, populateOptions: PopulateOptions | PopulateOptions[]) : Promise<T | null>
    find(filter: FilterQuery<T>) : Promise<T[]>;
    update(id: string, data: Partial<T> | Partial<T>) : Promise<T | null>;
    delete(id: string) : Promise<boolean>
    setModel(newModel: Model<T>): void;
    deleteMany(filter: FilterQuery<T>): Promise<boolean>
    updateMany(filter: Record<string, any>, update: Record<string, any>) : Promise<any>
}
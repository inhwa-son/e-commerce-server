import dayjs from './dayjs';

export class EntityUtil {
  static update<T>(entity: T & { updatedAt: Date }, updateDTO: Record<string, any>): T {
    Object.entries(updateDTO).forEach(([key, value]) => {
      if (entity.hasOwnProperty(key) && value !== undefined) {
        entity[key] = value;
      }
    });

    entity.updatedAt = dayjs().toDate();

    return entity;
  }

  static delete<T>(entity: T & { deletedAt: Date }): T {
    entity.deletedAt = dayjs().toDate();

    return entity;
  }
}

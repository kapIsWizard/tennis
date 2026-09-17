import { defineEntity, p } from '@mikro-orm/postgresql';

export const SportSchema = defineEntity({
  name: 'Sport',
  tableName: 'sports',
  properties: {
    id: p.uuid().primary(),
    code: p.text().unique(),
    name: p.text(),
  },
});

export class Sport extends SportSchema.class {}

SportSchema.setClass(Sport);

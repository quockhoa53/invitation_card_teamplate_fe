export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'datetime'
  | 'number'
  | 'image'
  | 'gallery'
  | 'music'
  | 'keywords'
  | 'color'
  | 'select';

export interface TemplateFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  section?: string;
  placeholder?: string;
  defaultValue?: any;
  helperText?: string;
  rows?: number;
  options?: { label: string; value: string }[];
}

export interface TemplateSectionGroup {
  id: string;
  title: string;
  icon?: string;
  fields: TemplateFieldSchema[];
}

export interface TemplateSchemaKey {
  id: string;
  keyName: string;
  label: string;
  fieldType: FieldType;
  sectionName: string;
  placeholder?: string;
  description?: string;
  defaultValue?: string;
  isRequired?: boolean;
  displayOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

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

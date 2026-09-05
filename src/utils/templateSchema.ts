import { TemplateFieldSchema, TemplateSectionGroup, TemplateSchemaKey } from '../types/schema';

// Canonical system schema definitions (serving as immediate built-in keys and fallbacks)
export const KNOWN_FIELD_META: Record<string, Partial<TemplateFieldSchema>> = {
  recipientName: { label: 'Tên Người Nhận', type: 'text', section: 'Nội Dung Lời Chúc' },
  senderName: { label: 'Tên Người Gửi', type: 'text', section: 'Nội Dung Lời Chúc' },
  greetingTitle: { label: 'Tiêu Đề Lời Chúc', type: 'text', section: 'Nội Dung Lời Chúc' },
  greetingMessage: { label: 'Nội Dung Lời Chúc', type: 'textarea', section: 'Nội Dung Lời Chúc', rows: 4 },
  eventDate: { label: 'Ngày Diễn Ra Sự Kiện', type: 'date', section: 'Thời Gian & Địa Điểm' },
  eventTime: { label: 'Giờ Diễn Ra', type: 'text', section: 'Thời Gian & Địa Điểm' },
  eventLocation: { label: 'Địa Điểm Tổ Chức', type: 'text', section: 'Thời Gian & Địa Điểm' },
  eventMapUrl: { label: 'Link Bản Đồ Google Maps', type: 'text', section: 'Thời Gian & Địa Điểm' },
  loveStartDate: { label: 'Ngày Bắt Đầu Tình Yêu', type: 'date', section: 'Thời Gian & Địa Điểm' },
  senderAvatar: { label: 'Ảnh Đại Diện Người Gửi', type: 'image', section: 'Hình Ảnh & Bản Đồ' },
  recipientAvatar: { label: 'Ảnh Đại Diện Người Nhận', type: 'image', section: 'Hình Ảnh & Bản Đồ' },
  senderNickname: { label: 'Biệt Danh Người Gửi', type: 'text', section: 'Hình Ảnh & Bản Đồ' },
  senderLocation: { label: 'Vị Trí Người Gửi', type: 'text', section: 'Bản Đồ & Khoảng Cách' },
  recipientLocation: { label: 'Vị Trí Người Nhận', type: 'text', section: 'Bản Đồ & Khoảng Cách' },
  distanceKm: { label: 'Khoảng Cách (km)', type: 'number', section: 'Bản Đồ & Khoảng Cách' },
  coordinates: { label: 'Tọa Độ Địa Lý', type: 'text', section: 'Bản Đồ & Khoảng Cách' },
  photos: { label: 'Ảnh Kỷ Niệm / Album', type: 'image', section: 'Album Ảnh Kỷ Niệm' },
  coverImage: { label: 'Ảnh Bìa Thiệp Mời', type: 'image', section: 'Album Ảnh Kỷ Niệm' },
  musicUrl: { label: 'Nhạc Nền Thiệp Mời', type: 'music', section: 'Nhạc Nền Thiệp Mời' },
  keyword1: { label: 'Từ Khóa Rơi 1', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  keyword2: { label: 'Từ Khóa Rơi 2', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  keyword3: { label: 'Từ Khóa Rơi 3', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  keyword4: { label: 'Từ Khóa Rơi 4', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  keyword5: { label: 'Từ Khóa Rơi 5', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  fallingKeywords: { label: 'Danh Sách Từ Khóa Rơi', type: 'keywords', section: 'Hiệu Ứng Từ Khóa Rơi' },
  milestoneUnit: { label: 'Đơn Vị Mốc Thời Gian', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  milestoneText: { label: 'Dòng Chữ Mốc Kỷ Niệm', type: 'text', section: 'Hiệu Ứng Từ Khóa Rơi' },
  birthdayDate: { label: 'Ngày Sinh Nhật', type: 'date', section: 'Thời Gian & Địa Điểm' },
  moment1Photo: { label: 'Ảnh Khoảnh Khắc 1', type: 'image', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment1Text: { label: 'Nội Dung Khoảnh Khắc 1', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment1Date: { label: 'Ngày Khoảnh Khắc 1', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment2Photo: { label: 'Ảnh Khoảnh Khắc 2', type: 'image', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment2Text: { label: 'Nội Dung Khoảnh Khắc 2', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment2Date: { label: 'Ngày Khoảnh Khắc 2', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment3Photo: { label: 'Ảnh Khoảnh Khắc 3', type: 'image', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment3Text: { label: 'Nội Dung Khoảnh Khắc 3', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment3Date: { label: 'Ngày Khoảnh Khắc 3', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment4Photo: { label: 'Ảnh Khoảnh Khắc 4', type: 'image', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment4Text: { label: 'Nội Dung Khoảnh Khắc 4', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment4Date: { label: 'Ngày Khoảnh Khắc 4', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment5Photo: { label: 'Ảnh Khoảnh Khắc 5', type: 'image', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment5Text: { label: 'Nội Dung Khoảnh Khắc 5', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  moment5Date: { label: 'Ngày Khoảnh Khắc 5', type: 'text', section: '5 Khoảnh Khắc Kỷ Niệm' },
  letterMessage: { label: 'Nội Dung Thư Tay Khi Mở', type: 'textarea', section: 'Thư Chúc Mừng', rows: 4 },
  footerNote: { label: 'Dòng Chữ Dưới Chân Trang', type: 'text', section: 'Thông Tin Khác' },
};

// Keys that are metadata or shouldn't be rendered as direct inputs
const IGNORED_KEYS = new Set(['_schema', 'musicTitle', 'isPublished']);

/**
 * Validates keys in a template's defaultConfig JSON against the master schema keys database and system standards.
 */
export function validateConfigKeys(
  configJson: string | Record<string, any>,
  validSchemaKeys: TemplateSchemaKey[]
): { isValid: boolean; invalidKeys: string[]; allKeys: string[] } {
  let parsed: Record<string, any> = {};
  if (typeof configJson === 'string') {
    try {
      parsed = JSON.parse(configJson);
    } catch {
      return { isValid: false, invalidKeys: [], allKeys: [] };
    }
  } else if (typeof configJson === 'object' && configJson !== null) {
    parsed = configJson;
  }

  // Prepopulate lookup set with all canonical system schema keys
  const validKeySet = new Set<string>(Object.keys(KNOWN_FIELD_META));
  if (Array.isArray(validSchemaKeys)) {
    for (const k of validSchemaKeys) {
      if (k.keyName) {
        validKeySet.add(k.keyName.trim());
      }
    }
  }

  const allKeys = Object.keys(parsed).filter((k) => !IGNORED_KEYS.has(k));
  const invalidKeys = allKeys.filter((k) => !validKeySet.has(k));

  return {
    isValid: invalidKeys.length === 0,
    invalidKeys,
    allKeys,
  };
}

/**
 * Parses template config to extract explicit schema, DB master keys, or auto-infer fields.
 */
export function parseTemplateSchema(
  defaultConfigRaw: string | any,
  customData: any = {},
  dbSchemaKeys?: TemplateSchemaKey[]
): TemplateFieldSchema[] {
  let parsedConfig: any = {};
  if (typeof defaultConfigRaw === 'string') {
    try {
      parsedConfig = JSON.parse(defaultConfigRaw);
    } catch (e) {
      parsedConfig = {};
    }
  } else if (typeof defaultConfigRaw === 'object' && defaultConfigRaw !== null) {
    parsedConfig = defaultConfigRaw;
  }

  // 1. Explicit schema defined by Admin
  if (Array.isArray(parsedConfig._schema) && parsedConfig._schema.length > 0) {
    return parsedConfig._schema.map((item: any) => ({
      key: item.key,
      label: item.label || item.key,
      type: item.type || 'text',
      section: item.section || 'Tùy Chỉnh Nội Dung',
      placeholder: item.placeholder,
      defaultValue: item.defaultValue,
      helperText: item.helperText,
      rows: item.rows,
      options: item.options,
    }));
  }

  // Build DB key lookup map if provided
  const dbKeyMap = new Map<string, TemplateSchemaKey>();
  if (dbSchemaKeys && Array.isArray(dbSchemaKeys)) {
    for (const k of dbSchemaKeys) {
      if (k.keyName) {
        dbKeyMap.set(k.keyName.trim(), k);
      }
    }
  }

  // 2. Inference: Analyze keys present in defaultConfig and customData
  const combinedData = { ...parsedConfig, ...customData };
  const fields: TemplateFieldSchema[] = [];
  const processedKeys = new Set<string>();

  // Add keys that exist in data
  for (const key of Object.keys(combinedData)) {
    if (IGNORED_KEYS.has(key)) continue;
    if (processedKeys.has(key)) continue;
    processedKeys.add(key);

    const val = combinedData[key];

    // Priority 1: Check master DB schema keys
    if (dbKeyMap.has(key)) {
      const dbKey = dbKeyMap.get(key)!;
      fields.push({
        key,
        label: dbKey.label || key,
        type: (dbKey.fieldType as TemplateFieldSchema['type']) || 'text',
        section: dbKey.sectionName || 'Tùy Chỉnh Nội Dung',
        placeholder: dbKey.placeholder || undefined,
        defaultValue: dbKey.defaultValue || undefined,
        rows: dbKey.fieldType === 'textarea' ? 4 : undefined,
      });
      continue;
    }

    // Priority 2: Check standard built-in known fields
    const known = KNOWN_FIELD_META[key];
    if (known) {
      fields.push({
        key,
        label: known.label || key,
        type: known.type || 'text',
        section: known.section || 'Tùy Chỉnh Nội Dung',
        placeholder: known.placeholder,
        rows: known.rows,
      });
      continue;
    }

    // Priority 3: Dynamic type inference
    let type: TemplateFieldSchema['type'] = 'text';
    let section = 'Tùy Chỉnh Nội Dung';

    const lowerKey = key.toLowerCase();

    if (Array.isArray(val)) {
      if (lowerKey.includes('photo') || lowerKey.includes('image') || lowerKey.includes('gallery')) {
        type = 'gallery';
        section = 'Album Ảnh Kỷ Niệm';
      } else {
        type = 'keywords';
      }
    } else if (lowerKey === 'musicurl' || lowerKey === 'audio') {
      type = 'music';
      section = 'Nhạc Nền Thiệp Mời';
    } else if (lowerKey.includes('avatar') || lowerKey.includes('photo') || lowerKey.includes('image') || lowerKey.includes('thumb')) {
      type = 'image';
      section = 'Hình Ảnh & Bản Đồ';
    } else if (lowerKey.includes('datetime')) {
      type = 'datetime';
      section = 'Thời Gian & Địa Điểm';
    } else if (lowerKey.includes('date') || lowerKey.includes('day')) {
      type = 'date';
      section = 'Thời Gian & Địa Điểm';
    } else if (typeof val === 'number' || lowerKey.includes('distance') || lowerKey.includes('km') || lowerKey.includes('age')) {
      type = 'number';
    } else if (
      lowerKey.includes('message') ||
      lowerKey.includes('letter') ||
      lowerKey.includes('content') ||
      lowerKey.includes('wish') ||
      (typeof val === 'string' && val.length > 50)
    ) {
      type = 'textarea';
      section = 'Nội Dung Lời Chúc';
    }

    // Capitalize key name for default label
    const formattedLabel = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());

    fields.push({
      key,
      label: formattedLabel,
      type,
      section,
      placeholder: `Nhập ${formattedLabel.toLowerCase()}...`,
    });
  }

  // Always ensure musicUrl is supported if the template data has musicUrl or customData has musicUrl
  if (!processedKeys.has('musicUrl')) {
    fields.push({
      key: 'musicUrl',
      label: 'Nhạc Nền Thiệp Mời',
      type: 'music',
      section: 'Nhạc Nền Thiệp Mời',
    });
  }

  return fields;
}

/**
 * Groups field schemas into sections for collapsible Accordion rendering.
 */
export function groupFieldsBySection(fields: TemplateFieldSchema[]): TemplateSectionGroup[] {
  const sectionMap = new Map<string, TemplateFieldSchema[]>();

  // Defined display order for common sections
  const preferredOrder = [
    'Thông Tin Cơ Bản',
    'Nội Dung Lời Chúc',
    'Thời Gian & Địa Điểm',
    '5 Khoảnh Khắc Kỷ Niệm',
    'Thư Chúc Mừng',
    'Bản Đồ Tọa Độ & Khoảng Cách',
    'Hiệu Ứng Từ Khóa Rơi',
    'Hình Ảnh & Bản Đồ',
    'Nhạc Nền Thiệp Mời',
    'Album Ảnh Kỷ Niệm',
    'Tùy Chỉnh Nội Dung',
  ];

  for (const f of fields) {
    const sName = f.section || 'Tùy Chỉnh Nội Dung';
    if (!sectionMap.has(sName)) {
      sectionMap.set(sName, []);
    }
    sectionMap.get(sName)!.push(f);
  }

  const result: TemplateSectionGroup[] = [];
  const processedSections = new Set<string>();

  for (const p of preferredOrder) {
    if (sectionMap.has(p)) {
      result.push({
        id: slugify(p),
        title: p,
        fields: sectionMap.get(p)!,
      });
      processedSections.add(p);
    }
  }

  // Add any other dynamic sections that Admin created
  for (const [secName, secFields] of sectionMap.entries()) {
    if (!processedSections.has(secName)) {
      result.push({
        id: slugify(secName),
        title: secName,
        fields: secFields,
      });
    }
  }

  return result;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

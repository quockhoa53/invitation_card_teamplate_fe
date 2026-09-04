import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Template, TemplateCategory, TemplateSchemaKey } from '../../types';
import { DynamicCodeRenderer } from '../../templates/DynamicCodeRenderer';
import { validateConfigKeys } from '../../utils/templateSchema';
import { Pagination } from '../../components/common/Pagination';
import { UserCardSkeleton } from '../../components/common/Skeleton';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Code,
  Sparkles,
  Eye,
  UploadCloud,
  FileCheck,
  X,
  Send,
  Lock,
  Globe,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Save,
  KeyRound,
  Copy,
  ExternalLink,
  AlertCircle,
  Wand2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AdminTemplatesPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Schema Keys state from DB
  const [schemaKeys, setSchemaKeys] = useState<TemplateSchemaKey[]>([]);
  const [showSchemaCheatSheet, setShowSchemaCheatSheet] = useState(true);
  const [schemaSearchQuery, setSchemaSearchQuery] = useState('');

  // Active view tab: 'drafts' (Bản nháp) | 'published' (Bản công khai)
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');

  // Pagination states for Drafts & Published
  const [draftPage, setDraftPage] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor'>('list');
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('BIRTHDAY_LOVER');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [defaultConfig, setDefaultConfig] = useState('{}');
  const [templateType, setTemplateType] = useState<'BUILT_IN' | 'CUSTOM_CODE'>('CUSTOM_CODE');

  // Custom Code Tabs (Removed visual builder, pure code and JSON config)
  const [activeCodeTab, setActiveCodeTab] = useState<'preview' | 'html' | 'css' | 'js' | 'config'>('preview');
  const [customHtml, setCustomHtml] = useState('');
  const [customCss, setCustomCss] = useState('');
  const [customJs, setCustomJs] = useState('');

  // Upload Feedback
  const [uploadedFilesInfo, setUploadedFilesInfo] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [tplRes, catRes, keysRes] = await Promise.all([
        api.getAdminTemplates(),
        api.getAdminCategories(),
        api.getAdminSchemaKeys(),
      ]);
      if (tplRes.success && tplRes.data) {
        setTemplates(tplRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
      if (keysRes.success && keysRes.data) {
        setSchemaKeys(keysRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingTemplate) {
      setSlug(slugify(val));
    }
  };

  // Real-time JSON validation against Schema Keys
  const configValidation = React.useMemo(() => {
    if (!defaultConfig || defaultConfig.trim() === '' || defaultConfig.trim() === '{}') {
      return { isValid: true, invalidKeys: [], allKeys: [], parseError: null };
    }
    try {
      const parsed = JSON.parse(defaultConfig);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        return { isValid: false, invalidKeys: [], allKeys: [], parseError: 'JSON phải là một đối tượng Object {}' };
      }
      const validation = validateConfigKeys(parsed, schemaKeys);
      return { ...validation, parseError: null };
    } catch (e: any) {
      return { isValid: false, invalidKeys: [], allKeys: [], parseError: e.message || 'Cú pháp JSON không hợp lệ' };
    }
  }, [defaultConfig, schemaKeys]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(defaultConfig);
      setDefaultConfig(JSON.stringify(parsed, null, 2));
      toast.success('Đã định dạng JSON chuẩn đẹp!');
    } catch (e: any) {
      toast.error('Không thể định dạng', 'Cú pháp JSON đang bị lỗi: ' + e.message);
    }
  };

  const copyKeyToClipboard = (keyName: string) => {
    navigator.clipboard.writeText(keyName);
    toast.success(`Đã copy key "${keyName}" vào bộ nhớ tạm!`);
  };

  // Parse standalone HTML file
  const parseHtmlContent = (htmlText: string) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const docTitle = doc.querySelector('title')?.innerText;
      if (docTitle && (!title || title === 'Thiệp Mẫu')) {
        setTitle(docTitle);
        setSlug(slugify(docTitle));
      }

      const styleTags = doc.querySelectorAll('style');
      let extractedCss = '';
      styleTags.forEach((s) => {
        extractedCss += s.innerHTML + '\n';
        s.remove();
      });

      const scriptTags = doc.querySelectorAll('script');
      let extractedJs = '';
      scriptTags.forEach((s) => {
        if (!s.src) {
          extractedJs += s.innerHTML + '\n';
          s.remove();
        }
      });

      const extractedHtml = doc.body ? doc.body.innerHTML.trim() : htmlText;

      return {
        html: extractedHtml || htmlText,
        css: extractedCss.trim(),
        js: extractedJs.trim(),
      };
    } catch (e) {
      return { html: htmlText, css: '', js: '' };
    }
  };

  // Process File Uploads
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileNames: string[] = [];
    let newHtml = customHtml;
    let newCss = customCss;
    let newJs = customJs;
    let newConfig = defaultConfig;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileNames.push(file.name);
      const text = await file.text();

      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'html' || ext === 'htm') {
        const parsed = parseHtmlContent(text);
        newHtml = parsed.html;
        if (parsed.css) newCss = (newCss ? newCss + '\n' : '') + parsed.css;
        if (parsed.js) newJs = (newJs ? newJs + '\n' : '') + parsed.js;

        if (!title) {
          const autoName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setTitle(autoName.charAt(0).toUpperCase() + autoName.slice(1));
          setSlug(slugify(autoName));
        }
      } else if (ext === 'css') {
        newCss = text;
      } else if (ext === 'js') {
        newJs = text;
      } else if (ext === 'json') {
        newConfig = text;
      }
    }

    setCustomHtml(newHtml);
    setCustomCss(newCss);
    setCustomJs(newJs);
    if (newConfig && newConfig !== '{}') {
      setDefaultConfig(newConfig);
      try {
        const parsed = JSON.parse(newConfig);
        if (schemaKeys.length > 0) {
          const val = validateConfigKeys(parsed, schemaKeys);
          if (!val.isValid) {
            toast.warning(
              'File Config JSON có key chưa đăng ký!',
              `Phát hiện ${val.invalidKeys.length} key: [${val.invalidKeys.join(', ')}]. Bạn có thể xem tab Config (JSON) hoặc bổ sung vào Quản Lý Schema Keys.`
            );
          } else {
            toast.success('File Config JSON hợp lệ!', `Đã nhận diện thành công ${val.allKeys.length} trường cấu hình.`);
          }
        }
      } catch (e) {
        toast.warning('File JSON không đúng cú pháp!', 'Vui lòng kiểm tra lại nội dung file JSON.');
      }
    }
    setTemplateType('CUSTOM_CODE');
    setUploadedFilesInfo(fileNames);
    setUploadStatus(`Đã nạp ${fileNames.length} file: ${fileNames.join(', ')}`);
    setActiveCodeTab('preview');
  };

  // Preset Template Code sample
  const loadPresetSample = () => {
    setTitle('Thiệp Sinh Nhật 3D Neon');
    setSlug('sinh-nhat-3d-neon-' + Math.floor(Math.random() * 1000));
    setDescription('Thiệp sinh nhật hiệu ứng Neon phát sáng, nổ pháo hoa canvas và nhạc nền sinh động render trực tiếp từ code admin.');
    setThumbnailUrl('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600');
    setTemplateType('CUSTOM_CODE');
    setDefaultConfig(JSON.stringify({
      recipientName: 'Bạn Thân',
      greetingTitle: 'HAPPY BIRTHDAY TO YOU 🎉',
      greetingMessage: 'Chúc bạn tuổi mới thật nhiều niềm vui, sức khỏe dồi dào, vạn sự hanh thông và luôn rạng rỡ như ánh sao băng!',
      musicUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=happy-birthday-party-10497.mp3',
    }, null, 2));

    setCustomHtml(`
<div class="neon-wrapper">
  <div class="floating-stars">✨ ✨ ✨ ✨ ✨</div>
  <div class="card-box">
    <div class="badge">💌 THIỆP SINH NHẬT ĐẶC BIỆT</div>
    <h1 class="title">{{greetingTitle}}</h1>
    <h2 class="subtitle">Gửi tặng: <span>{{recipientName}}</span></h2>
    <div class="message-box">
      <p>{{greetingMessage}}</p>
    </div>
    <div class="interactive-btn-group">
      <button id="btn-fireworks" class="btn-glow">💥 Bắn Pháo Hoa</button>
      <button id="btn-music" class="btn-outline">🎵 Phát Nhạc</button>
    </div>
  </div>
</div>
    `.trim());

    setCustomCss(`
.neon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%);
  text-align: center;
}
.card-box {
  max-width: 480px;
  width: 100%;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(244, 63, 94, 0.4);
  border-radius: 28px;
  padding: 36px 24px;
  box-shadow: 0 0 40px rgba(244, 63, 94, 0.25);
  backdrop-filter: blur(12px);
}
.badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 999px;
  background: rgba(244, 63, 94, 0.2);
  color: #fda4af;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  margin-bottom: 16px;
}
.title {
  font-size: 26px;
  font-weight: 900;
  background: linear-gradient(135deg, #f43f5e, #fb7185, #fef08a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
}
.subtitle {
  font-size: 15px;
  color: #cbd5e1;
  margin-bottom: 20px;
}
.subtitle span {
  color: #f43f5e;
  font-weight: 800;
}
.message-box {
  background: rgba(30, 41, 59, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  padding: 20px;
  font-size: 14px;
  line-height: 1.7;
  color: #f1f5f9;
  margin-bottom: 24px;
}
.interactive-btn-group {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.btn-glow {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(244, 63, 94, 0.4);
  transition: transform 0.2s;
}
.btn-glow:active { transform: scale(0.95); }
.btn-outline {
  background: transparent;
  color: #f43f5e;
  border: 1px solid #f43f5e;
  padding: 12px 20px;
  border-radius: 14px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-outline:hover { background: rgba(244, 63, 94, 0.1); }
    `.trim());

    setCustomJs(`
document.getElementById('btn-fireworks').addEventListener('click', () => {
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 }
  });
});

let musicHowl = null;
let isPlaying = false;
document.getElementById('btn-music').addEventListener('click', () => {
  if (!musicHowl && window.CARD_DATA.musicUrl) {
    musicHowl = new Howl({
      src: [window.CARD_DATA.musicUrl],
      html5: true,
      loop: true,
      volume: 0.6
    });
  }
  if (musicHowl) {
    if (isPlaying) {
      musicHowl.pause();
      isPlaying = false;
      document.getElementById('btn-music').innerText = '🎵 Phát Nhạc';
    } else {
      musicHowl.play();
      isPlaying = true;
      document.getElementById('btn-music').innerText = '⏸️ Dừng Nhạc';
    }
  }
});
    `.trim());
    setUploadedFilesInfo(['Sample_3D_Neon.html']);
    setUploadStatus('Đã nạp thành công mẫu Code 3D Neon!');
    setActiveCodeTab('preview');
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setCategory('BIRTHDAY_LOVER');
    setThumbnailUrl('https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600');
    setIsFree(true);
    setPrice(0);
    setDefaultConfig(JSON.stringify({
      greetingTitle: 'Chúc Mừng Sinh Nhật',
      recipientName: 'Bạn Thân',
      greetingMessage: 'Lời chúc của bạn...',
      musicUrl: '',
    }, null, 2));
    setTemplateType('CUSTOM_CODE');
    setCustomHtml('');
    setCustomCss('');
    setCustomJs('');
    setUploadedFilesInfo([]);
    setUploadStatus(null);
    setActiveCodeTab('preview');
    setViewMode('editor');
  };

  const openEditModal = (tpl: Template) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setSlug(tpl.slug);
    setDescription(tpl.description);
    setCategory(tpl.category);
    setThumbnailUrl(tpl.thumbnailUrl);
    setIsFree(tpl.isFree);
    setPrice(tpl.price);
    setDefaultConfig(tpl.defaultConfig);
    setTemplateType(tpl.templateType || 'BUILT_IN');
    setCustomHtml(tpl.customHtml || '');
    setCustomCss(tpl.customCss || '');
    setCustomJs(tpl.customJs || '');
    setUploadedFilesInfo([]);
    setUploadStatus(null);
    setActiveCodeTab('preview');
    setViewMode('editor');
  };

  const handleBackToList = () => {
    setViewMode('list');
  };

  // Save template form handler - Always saves as Draft when creating new
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên template');
      return;
    }
    if (!slug.trim()) {
      toast.error('Vui lòng nhập slug (URL) cho template');
      return;
    }

    // Strict validation of Config JSON keys against Schema Keys
    if (configValidation.parseError) {
      toast.error('Lỗi cú pháp Config JSON', configValidation.parseError);
      setActiveCodeTab('config');
      return;
    }
    if (schemaKeys.length > 0 && !configValidation.isValid) {
      toast.error(
        'Config JSON chứa key chưa đăng ký trong Schema!',
        `Các trường [${configValidation.invalidKeys.join(', ')}] chưa có trong từ điển hệ thống. Vui lòng thêm tại "Quản Lý Schema Keys" hoặc điều chỉnh JSON.`
      );
      setActiveCodeTab('config');
      return;
    }

    try {
      const publishStatus = editingTemplate ? (editingTemplate.isPublished ?? false) : false;

      const payload: any = {
        title,
        slug,
        description,
        category,
        thumbnailUrl,
        isFree,
        price: isFree ? 0 : price,
        defaultConfig,
        schemaRules: '{}',
        templateType,
        customHtml,
        customCss,
        customJs,
        isPublished: publishStatus,
        isActive: true,
      };

      if (editingTemplate) {
        await api.updateAdminTemplate(editingTemplate.id, payload);
      } else {
        await api.createAdminTemplate(payload);
      }

      setViewMode('list');
      fetchTemplates();
      if (editingTemplate) {
        toast.success('Đã cập nhật template thành công!', `Mẫu "${title}" đã được cập nhật.`);
      } else {
        toast.success('Bản nháp đã được lưu thành công!', 'Bạn có thể xem thử và bấm [Xuất Bản] ở tab Bản Nháp khi sẵn sàng.');
      }
    } catch (err: any) {
      toast.error('Không thể lưu template', err.response?.data?.message);
    }
  };

  // Publish Trigger from Drafts Page
  const handlePublish = (id: string, titleStr: string) => {
    confirmModal({
      title: 'Xuất Bản Template',
      message: `Bạn có chắc chắn muốn Xuất Bản (Publish) template "${titleStr}"?\n\nSau khi xuất bản, template sẽ chính thức hiển thị công khai cho toàn bộ người dùng tạo thiệp.`,
      confirmText: '🚀 Xuất Bản Ngay',
      type: 'warning',
      onConfirm: async () => {
        try {
          const res = await api.publishAdminTemplate(id);
          if (res.success) {
            setTemplates((prev) =>
              prev.map((t) => (t.id === id ? { ...t, isPublished: true } : t))
            );
            toast.success(`Đã xuất bản "${titleStr}" thành công!`, 'Template đã chuyển sang mục Bản Công Khai.');
          }
        } catch (err: any) {
          toast.error('Không thể xuất bản template', err.response?.data?.message);
        }
      },
    });
  };

  // Delete Draft Template
  const handleDelete = (tpl: Template) => {
    if (tpl.isPublished) {
      toast.warning('Không Thể Xóa', 'Template này đã xuất bản và đang phục vụ người dùng để bảo toàn dữ liệu.');
      return;
    }

    confirmModal({
      title: 'Xóa Bản Nháp',
      message: `Bạn có chắc chắn muốn xóa bản nháp "${tpl.title}"?\nHành động này không thể hoàn tác.`,
      confirmText: 'Xóa Vĩnh Viễn',
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.deleteAdminTemplate(tpl.id);
          setTemplates((prev) => prev.filter((t) => t.id !== tpl.id));
          toast.success('Đã xóa bản nháp thành công!');
        } catch (err: any) {
          toast.error('Không thể xóa template', err.response?.data?.message);
        }
      },
    });
  };

  // Filter templates based on active tab and category filter
  const filteredTemplates = templates.filter(
    (t) => selectedCategoryFilter === 'ALL' || t.category === selectedCategoryFilter
  );
  const draftTemplates = filteredTemplates.filter((t) => !t.isPublished);
  const publishedTemplates = filteredTemplates.filter((t) => t.isPublished);
  const currentList = activeTab === 'drafts' ? draftTemplates : publishedTemplates;

  // Pagination calculation
  const currentPage = activeTab === 'drafts' ? draftPage : publishedPage;
  const setCurrentPage = activeTab === 'drafts' ? setDraftPage : setPublishedPage;
  const totalPages = Math.ceil(currentList.length / pageSize) || 1;
  const pagedList = currentList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // FULL PAGE TEMPLATE STUDIO / EDITOR VIEW
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 animate-fadeIn pb-24">
        {/* Full-Page Top Bar / Navigation */}
        <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
          isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToList}
              className={`p-2.5 rounded-2xl border transition flex items-center gap-2 text-xs font-bold ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Quay Lại
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-editorial text-2xl font-bold">
                  {!editingTemplate
                    ? 'Nạp Mẫu Template Mới (Bản Nháp)'
                    : `Chỉnh Sửa: ${title || 'Template'}`}
                </h2>
                {editingTemplate?.isPublished ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> Đang Công Khai
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Bản Nháp (Draft)
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  {templateType === 'CUSTOM_CODE' ? '⚡ Custom Code' : '🎨 Built-In'}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Không gian thiết kế template chuyên nghiệp — Tùy chỉnh thông tin, kéo thả mã nguồn và cấu hình Form Builder trực quan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={loadPresetSample}
              className="px-3.5 py-2 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/25 transition active:scale-95"
              title="Nạp nhanh code mẫu thiệp 3D Neon"
            >
              <Sparkles className="w-4 h-4" /> Mẫu Demo 3D
            </button>

            {customHtml && (
              <button
                type="button"
                onClick={() => setShowFullscreenPreview(true)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <Eye className="w-4 h-4" /> Xem Thiết Bị Mobile
              </button>
            )}

            <button
              type="button"
              onClick={handleBackToList}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition ${
                isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-stone-300 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:brightness-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>
                {!editingTemplate
                  ? '💾 Lưu Bản Nháp'
                  : editingTemplate.isPublished
                  ? '💾 Lưu Cập Nhật'
                  : '💾 Lưu Bản Nháp'}
              </span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Source Upload & Template Metadata (4 of 12 cols on XL screens) */}
          <div className="xl:col-span-4 space-y-5">
            {/* Status notice */}
            {editingTemplate?.isPublished ? (
              <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Template này <strong>Đang Công Khai</strong>. Mọi chỉnh sửa được cập nhật ngay cho người dùng.</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Mọi thay đổi sẽ được lưu vào <strong>Bản Nháp</strong>. Bạn có thể ra trang Bản Nháp bấm <strong>[Xuất Bản]</strong> khi sẵn sàng.</span>
              </div>
            )}

            {/* Source Code Drag & Drop Card */}
            <div className={`p-4 rounded-3xl border space-y-3 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-orange-500" /> Tải Lên Mã Nguồn Template
              </h4>

              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".html,.htm,.css,.js,.json"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center space-y-2 ${
                  isDragging
                    ? 'border-orange-500 bg-orange-500/10'
                    : isDark
                    ? 'border-slate-700/80 bg-slate-900/60 hover:border-orange-500/60 hover:bg-slate-900'
                    : 'border-stone-300 bg-stone-50 hover:border-orange-400 hover:bg-orange-50/30'
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs">
                    Kéo thả file vào đây hoặc <span className="text-orange-500 underline">Bấm để chọn file</span>
                  </p>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    Hỗ trợ file <strong>.html</strong> (tự tách CSS, JS) hoặc các file rời <strong>.html, .css, .js, .json</strong>
                  </p>
                </div>
                {uploadedFilesInfo.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    {uploadedFilesInfo.map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]"
                      >
                        <FileCheck className="w-3 h-3" /> {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Template Information Card */}
            <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
            }`}>
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" /> Thông Tin Cơ Bản
              </h4>

              {/* Title */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Tên Template *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ví dụ: Thiệp Sinh Nhật 3D Neon"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Slug (URL Định Danh) *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="slug-duy-nhat"
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Danh Mục Template</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.emoji || '✨'} {c.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="BIRTHDAY_LOVER">✨ Sinh nhật người yêu</option>
                      <option value="BIRTHDAY_FRIENDS">🎉 Sinh nhật bạn bè</option>
                      <option value="LOVE_ANNIVERSARY">💍 Kỷ niệm tình yêu</option>
                      <option value="EVENT_INVITATION">💌 Thư mời sự kiện</option>
                    </>
                  )}
                </select>
              </div>

              {/* Thumbnail URL with Live Preview */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Ảnh Đại Diện (Thumbnail URL)</label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
                {thumbnailUrl && (
                  <div className="mt-2 relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] px-2 py-0.5 rounded bg-black/70 text-white font-bold backdrop-blur-xs">
                      Xem trước ảnh bìa
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className={`p-3 rounded-2xl border space-y-2 ${
                isDark ? 'border-slate-800 bg-slate-900/40' : 'border-stone-200 bg-stone-50'
              }`}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-500">Template Miễn Phí (Free)</span>
                </label>

                {!isFree && (
                  <div className="pt-2 border-t border-slate-800/40">
                    <label className="block font-semibold mb-1 text-[11px]">Giá Bán (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="20000"
                      className={`w-full px-3 py-1.5 rounded-xl border text-xs focus:outline-none ${
                        isDark
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-orange-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold mb-1 text-xs">Mô Tả Ngắn Gọn</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả hiệu ứng, phong cách và điểm nổi bật của mẫu thiệp này..."
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none transition ${
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-white focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Spacious Workspace (Tabs + Live Preview / Form Builder / Editors) */}
          <div className="xl:col-span-8 space-y-4">
            <div className={`p-4 sm:p-6 rounded-3xl border space-y-4 ${
              isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200 shadow-sm'
            }`}>
              {/* Studio Workspace Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('preview')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      activeCodeTab === 'preview'
                        ? 'bg-emerald-500 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" /> Xem Thử Live
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('html')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition ${
                      activeCodeTab === 'html'
                        ? 'bg-orange-500 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    HTML {customHtml ? `(${customHtml.length} ký tự)` : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('css')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition ${
                      activeCodeTab === 'css'
                        ? 'bg-orange-500 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    CSS {customCss ? `(${customCss.length} ký tự)` : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('js')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition ${
                      activeCodeTab === 'js'
                        ? 'bg-orange-500 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    JS {customJs ? `(${customJs.length} ký tự)` : ''}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('config')}
                    className={`px-3 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      activeCodeTab === 'config'
                        ? 'bg-orange-500 text-white shadow-md'
                        : isDark
                        ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Config (JSON)</span>
                    {configValidation.parseError ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        Lỗi JSON
                      </span>
                    ) : configValidation.invalidKeys.length > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {configValidation.invalidKeys.length} key lạ
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-75">
                        ({configValidation.allKeys.length} keys)
                      </span>
                    )}
                  </button>
                </div>

                {customHtml && (
                  <button
                    type="button"
                    onClick={() => setShowFullscreenPreview(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Mở Popup Trải Nghiệm Full
                  </button>
                )}
              </div>

              {/* Tab: Live Preview */}
              {activeCodeTab === 'preview' && (
                <div className="h-[620px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex flex-col">
                  {customHtml ? (
                    <div className="flex-1 w-full h-full overflow-y-auto">
                      <DynamicCodeRenderer
                        customHtml={customHtml}
                        customCss={customCss}
                        customJs={customJs}
                        data={defaultConfig || {
                          greetingTitle: 'Chúc Mừng Sinh Nhật ✨',
                          recipientName: 'Bạn Thân',
                          senderName: 'Anh Khoa',
                          greetingMessage: 'Chúc bạn tuổi mới luôn ngập tràn niềm vui, hạnh phúc và thành công rực rỡ!',
                          musicUrl: '',
                          eventDate: '20/10/2026',
                          eventTime: '18:30',
                          eventLocation: 'Trung Tâm Sự Kiện White Palace',
                          loveStartDate: '2022-02-14',
                          coordinates: '10.7769° N, 106.7009° E',
                        }}
                        title="Live Preview"
                        isPreview={true}
                      />
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                      <Code className="w-8 h-8 opacity-30" />
                      <p className="text-xs">Chưa có code template. Hãy kéo thả file HTML/CSS/JS ở bên trái hoặc chọn nút "Mẫu Demo 3D".</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: HTML Editor */}
              {activeCodeTab === 'html' && (
                <textarea
                  rows={26}
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="<div><h1>{{greetingTitle}}</h1><p>{{greetingMessage}}</p></div>"
                  className={`w-full p-4 rounded-2xl border text-xs font-mono leading-relaxed focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              )}

              {/* Tab: CSS Editor */}
              {activeCodeTab === 'css' && (
                <textarea
                  rows={26}
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder=".card-box { background: #111; color: #fff; padding: 20px; border-radius: 16px; }"
                  className={`w-full p-4 rounded-2xl border text-xs font-mono leading-relaxed focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              )}

              {/* Tab: JS Editor */}
              {activeCodeTab === 'js' && (
                <textarea
                  rows={26}
                  value={customJs}
                  onChange={(e) => setCustomJs(e.target.value)}
                  placeholder="// window.CARD_DATA chứa dữ liệu người dùng nhập&#10;console.log(window.CARD_DATA);"
                  className={`w-full p-4 rounded-2xl border text-xs font-mono leading-relaxed focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-orange-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                  }`}
                />
              )}

              {/* Tab: Config JSON Editor & Master Schema Key Validator */}
              {activeCodeTab === 'config' && (
                <div className="space-y-3">
                  {/* Top Bar: Actions & Links */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl border bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-bold text-orange-300">Từ Điển Schema Keys & Đối Soát JSON</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={formatJson}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Format JSON
                      </button>

                      <a
                        href="/admin/schema-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-600/80 hover:bg-indigo-600 text-white flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Quản Lý Schema Keys
                      </a>

                      <button
                        type="button"
                        onClick={() => setShowSchemaCheatSheet(!showSchemaCheatSheet)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition active:scale-95 ${
                          showSchemaCheatSheet
                            ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                            : isDark
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                            : 'bg-white text-stone-700 border-stone-200'
                        }`}
                      >
                        <span>Tra cứu Key ({schemaKeys.length})</span>
                        {showSchemaCheatSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Validation Alerts */}
                  {configValidation.parseError && (
                    <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span><strong>Lỗi Cú Pháp JSON:</strong> {configValidation.parseError}</span>
                    </div>
                  )}

                  {!configValidation.parseError && configValidation.invalidKeys.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-bold text-red-300">
                        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>Phát hiện {configValidation.invalidKeys.length} key trong JSON chưa được khai báo trong hệ thống:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {configValidation.invalidKeys.map((k) => (
                          <span key={k} className="px-2 py-0.5 rounded-lg bg-red-500/20 text-red-200 border border-red-500/40 font-mono text-[11px] font-bold">
                            "{k}"
                          </span>
                        ))}
                      </div>
                      <p className="pl-6 text-[11px] text-red-300/80 leading-relaxed">
                        ⚠️ Khi người dùng tạo thiệp, hệ thống sẽ <strong>không thể tạo ô nhập form</strong> cho các key trên. Hãy vào trang{' '}
                        <a href="/admin/schema-keys" target="_blank" rel="noreferrer" className="underline text-red-200 font-bold hover:text-white inline-flex items-center gap-0.5">
                          Quản Lý Schema Keys <ExternalLink className="w-2.5 h-2.5" />
                        </a>{' '}
                        để đăng ký định dạng (Text, Image, Âm nhạc...) hoặc xóa các key này khỏi JSON để lưu template.
                      </p>
                    </div>
                  )}

                  {!configValidation.parseError && configValidation.invalidKeys.length === 0 && configValidation.allKeys.length > 0 && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>Tất cả {configValidation.allKeys.length} key trong JSON đều hợp lệ và tương thích 100% với form tùy biến người dùng!</span>
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        STATUS: READY
                      </span>
                    </div>
                  )}

                  {/* Quick-Lookup Cheat Sheet */}
                  {showSchemaCheatSheet && (
                    <div className={`p-3.5 rounded-2xl border text-xs space-y-2.5 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-stone-50 border-stone-200'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                          <span className="font-bold">Danh Sách Key Hợp Lệ Trong Hệ Thống:</span>
                          <span className="text-[11px] text-stone-400">(Bấm vào key để copy nhanh)</span>
                        </div>
                        <div className="relative w-48">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                          <input
                            type="text"
                            value={schemaSearchQuery}
                            onChange={(e) => setSchemaSearchQuery(e.target.value)}
                            placeholder="Lọc key..."
                            className={`w-full pl-8 pr-2.5 py-1 rounded-xl text-xs border outline-none ${
                              isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-orange-500' : 'bg-white border-stone-200 text-stone-900 focus:border-orange-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="max-h-36 overflow-y-auto flex flex-wrap gap-1.5 pr-1">
                        {schemaKeys
                          .filter((k) =>
                            !schemaSearchQuery ||
                            k.keyName.toLowerCase().includes(schemaSearchQuery.toLowerCase()) ||
                            k.label.toLowerCase().includes(schemaSearchQuery.toLowerCase()) ||
                            (k.sectionName && k.sectionName.toLowerCase().includes(schemaSearchQuery.toLowerCase()))
                          )
                          .map((k) => (
                            <button
                              key={k.keyName}
                              type="button"
                              onClick={() => copyKeyToClipboard(k.keyName)}
                              title={`Click để copy "${k.keyName}"\nNhãn: ${k.label}\nLoại: ${k.fieldType}\nNhóm: ${k.sectionName}`}
                              className={`px-2 py-1 rounded-lg border font-mono text-[11px] flex items-center gap-1.5 transition active:scale-95 ${
                                isDark
                                  ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-300'
                                  : 'bg-white border-stone-200 text-stone-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
                              }`}
                            >
                              <span>{k.keyName}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-stone-500/20 text-stone-400 font-sans font-bold">
                                {k.fieldType}
                              </span>
                              <Copy className="w-2.5 h-2.5 opacity-50" />
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Config JSON Textarea */}
                  <textarea
                    rows={20}
                    value={defaultConfig}
                    onChange={(e) => setDefaultConfig(e.target.value)}
                    placeholder='{\n  "greetingTitle": "Chúc Mừng Sinh Nhật",\n  "recipientName": "Em Yêu"\n}'
                    className={`w-full p-4 rounded-2xl border text-xs font-mono leading-relaxed focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-amber-300 focus:border-orange-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-orange-500'
                    }`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Bottom Sticky Bar */}
        <div className={`fixed bottom-4 left-4 md:left-72 right-4 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-lg flex items-center justify-between z-40 transition-all ${
          isDark ? 'bg-slate-950/90 border-slate-800 text-white' : 'bg-white/95 border-stone-200 text-stone-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-400">Đang thao tác:</span>
            <span className="text-xs font-bold text-orange-400 truncate max-w-[200px] md:max-w-md">
              {title || 'Chưa đặt tên template'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBackToList}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition ${
                isDark ? 'border-slate-800 text-slate-400 hover:bg-slate-900' : 'border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:brightness-105 active:scale-95 transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>
                {!editingTemplate
                  ? '💾 Lưu Bản Nháp'
                  : editingTemplate.isPublished
                  ? '💾 Lưu Cập Nhật'
                  : '💾 Lưu Bản Nháp'}
              </span>
            </button>
          </div>
        </div>

        {/* Fullscreen Mobile Device Preview Modal */}
        {showFullscreenPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="relative max-w-md w-full h-[90vh] bg-slate-950 border border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col">
              <div className="h-10 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                  {title || 'Xem Thử Template'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFullscreenPreview(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-950">
                <DynamicCodeRenderer
                  customHtml={customHtml}
                  customCss={customCss}
                  customJs={customJs}
                  data={defaultConfig || {
                    greetingTitle: 'Chúc Mừng Sinh Nhật ✨',
                    recipientName: 'Bạn Thân',
                    senderName: 'Anh Khoa',
                    greetingMessage: 'Chúc bạn tuổi mới luôn ngập tràn niềm vui, hạnh phúc và thành công rực rỡ!',
                    musicUrl: '',
                    eventDate: '20/10/2026',
                    eventTime: '18:30',
                    eventLocation: 'Trung Tâm Sự Kiện White Palace',
                    loveStartDate: '2022-02-14',
                    coordinates: '10.7769° N, 106.7009° E',
                  }}
                  title={title || 'Template Demo'}
                  isPreview={true}
                />
              </div>

              <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">⚡ Chế độ thử nghiệm tương tác thật</span>
                <button
                  type="button"
                  onClick={() => setShowFullscreenPreview(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-orange-500" /> Quản Lý Kho Template KD
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Tách biệt rõ ràng giữa <strong>Bản Nháp (Drafts)</strong> và <strong>Bản Công Khai (Public)</strong>. Tích hợp phân trang mượt mà và trực quan.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition shrink-0"
        >
          <Plus className="w-4 h-4" /> Nạp Mẫu Bản Nháp Mới
        </button>
      </div>

      {/* 2-PAGE TAB NAVIGATION SWITCHER */}
      <div className={`flex items-center gap-2 p-1.5 rounded-2xl border w-fit ${
        isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-stone-100 border-stone-200'
      }`}>
        <button
          onClick={() => {
            setActiveTab('drafts');
            setDraftPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200 ${
            activeTab === 'drafts'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📝 Quản Lý Bản Nháp</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'drafts' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {draftTemplates.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('published');
            setPublishedPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition duration-200 ${
            activeTab === 'published'
              ? 'bg-emerald-500 text-white shadow-md'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>🌐 Quản Lý Bản Công Khai</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            activeTab === 'published' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-300'
          }`}>
            {publishedTemplates.length}
          </span>
        </button>
      </div>

      {/* Tab Context Description Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
        activeTab === 'drafts'
          ? isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
          : isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-center gap-2.5">
          {activeTab === 'drafts' ? <FileText className="w-5 h-5 shrink-0 text-amber-500" /> : <Globe className="w-5 h-5 shrink-0 text-emerald-500" />}
          <div>
            <p className="font-bold">
              {activeTab === 'drafts'
                ? 'Khu vực Bản Nháp (Drafts) — Hoàn toàn ẩn với người dùng'
                : 'Khu vực Bản Công Khai (Public) — Đang hiển thị trực tiếp ngoài kho thiệp'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {activeTab === 'drafts'
                ? 'Bạn có thể thử nghiệm, chỉnh sửa code hoặc bấm [Xuất Bản] để đưa template ra mắt người dùng.'
                : 'Template tại đây đang phục vụ người dùng nên ĐƯỢC KHÓA BẢO VỆ KHÔNG CHO XÓA. Bạn vẫn có thể chỉnh sửa & cập nhật thông tin.'}
            </p>
          </div>
        </div>

        {activeTab === 'drafts' && (
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shrink-0 hover:brightness-105 active:scale-95 transition"
          >
            + Tạo Bản Nháp
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setSelectedCategoryFilter('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
            selectedCategoryFilter === 'ALL'
              ? 'bg-orange-500 text-white shadow-sm'
              : isDark
              ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
          }`}
        >
          ✨ Tất Cả ({templates.filter((t) => (activeTab === 'drafts' ? !t.isPublished : t.isPublished)).length})
        </button>

        {categories.map((cat) => {
          const count = templates.filter(
            (t) => t.category === cat.code && (activeTab === 'drafts' ? !t.isPublished : t.isPublished)
          ).length;
          const isActiveCat = selectedCategoryFilter === cat.code;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategoryFilter(cat.code);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                isActiveCat
                  ? 'bg-orange-500 text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{cat.emoji || '📂'}</span>
              <span>{cat.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActiveCat ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {currentList.length === 0 && !loading && (
        <div className={`p-12 rounded-3xl border text-center space-y-3 ${
          isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-stone-50 border-stone-200 text-stone-500'
        }`}>
          <Layers className="w-10 h-10 mx-auto opacity-30" />
          <p className="font-bold text-sm">
            {activeTab === 'drafts' ? 'Hiện không có bản nháp nào' : 'Hiện chưa có template nào được xuất bản'}
          </p>
          <p className="text-xs">
            {activeTab === 'drafts'
              ? 'Hãy bấm "Nạp Mẫu Bản Nháp Mới" ở trên để tải file code lên và thử nghiệm.'
              : 'Hãy chuyển qua tab "Quản Lý Bản Nháp" và bấm [Xuất Bản] template bạn muốn công khai.'}
          </p>
        </div>
      )}

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pagedList.map((tpl) => {
            const isPub = tpl.isPublished ?? false;

          return (
            <div
              key={tpl.id}
              className={`rounded-3xl border p-5 flex flex-col justify-between space-y-4 shadow-sm transition-colors relative ${
                isDark ? 'bg-[#121824] border-slate-800' : 'bg-white border-stone-200'
              }`}
            >
              {/* Thumbnail with Dual Status Badges */}
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950">
                <img src={tpl.thumbnailUrl} alt={tpl.title} className="w-full h-full object-cover" />

                {/* Status Badges */}
                <div className="absolute top-2.5 left-2.5">
                  {isPub ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1 shadow-md">
                      <Globe className="w-3 h-3" /> Công Khai
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md flex items-center gap-1 shadow-md">
                      <FileText className="w-3 h-3" /> Bản Nháp
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    tpl.templateType === 'CUSTOM_CODE'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-black/70 text-white'
                  }`}>
                    {tpl.templateType === 'CUSTOM_CODE' ? '⚡ Custom Code' : '🎨 Built-In'}
                  </span>
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isDark ? 'bg-slate-800 text-orange-300' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {tpl.category}
                  </span>
                  <span className="text-xs font-bold text-emerald-500">
                    {tpl.isFree ? 'Miễn phí' : `${tpl.price.toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
                <h3 className="font-editorial text-base font-bold">{tpl.title}</h3>
                <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  {tpl.description}
                </p>
              </div>

              {/* Bottom Actions */}
              <div className={`pt-3 border-t flex items-center justify-between gap-2 ${
                isDark ? 'border-slate-800' : 'border-stone-100'
              }`}>
                <span className={`text-[11px] font-medium ${isDark ? 'text-slate-500' : 'text-stone-400'}`}>
                  {tpl.usageCount} lượt dùng
                </span>

                <div className="flex items-center gap-1.5">
                  {/* TAB 1: DRAFTS ACTION BUTTONS */}
                  {!isPub && (
                    <>
                      <button
                        onClick={() => handlePublish(tpl.id, tpl.title)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-110 text-white font-bold text-[11px] flex items-center gap-1 shadow-md active:scale-95 transition"
                        title="Xuất bản công khai cho người dùng"
                      >
                        <Send className="w-3 h-3" /> Xuất Bản
                      </button>

                      <button
                        onClick={() => openEditModal(tpl)}
                        className={`p-1.5 rounded-xl border transition flex items-center gap-1 text-[11px] font-semibold ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                        title="Chỉnh sửa bản nháp"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(tpl)}
                        className={`p-1.5 rounded-xl transition ${
                          isDark
                            ? 'bg-slate-800 hover:bg-orange-500/20 text-slate-400 hover:text-orange-400'
                            : 'bg-stone-50 hover:bg-orange-50 text-stone-400 hover:text-orange-600 border border-stone-200'
                        }`}
                        title="Xóa bản nháp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* TAB 2: PUBLISHED ACTION BUTTONS */}
                  {isPub && (
                    <>
                      <button
                        onClick={() => openEditModal(tpl)}
                        className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 text-[11px] font-semibold ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <Edit2 className="w-3 h-3 text-amber-400" /> Cập Nhật
                      </button>

                      <span
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800/50 text-slate-400 border border-slate-700/50 text-[10px] font-bold flex items-center gap-1 cursor-not-allowed"
                        title="Template đang công khai phục vụ người dùng - Khóa không thể xóa"
                      >
                        <Lock className="w-3 h-3 text-slate-400" /> Khóa Xóa
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )}

      {/* Pagination Bar */}
      {currentList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={currentList.length}
          itemsPerPage={pageSize}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(sz) => {
            setPageSize(sz);
            setCurrentPage(1);
          }}
          labelItem={activeTab === 'drafts' ? 'bản nháp' : 'template công khai'}
        />
      )}

      {/* FULLSCREEN / PHONE DEVICE PREVIEW MODAL */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full h-[90vh] bg-slate-950 border border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col">
            {/* Top Phone Mockup Header Bar */}
            <div className="h-10 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">
                {title || 'Xem Thử Template'}
              </span>

              <button
                type="button"
                onClick={() => setShowFullscreenPreview(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Template Interactive Preview Body */}
            <div className="flex-1 overflow-y-auto bg-slate-950">
              <DynamicCodeRenderer
                customHtml={customHtml}
                customCss={customCss}
                customJs={customJs}
                data={defaultConfig || {
                  greetingTitle: 'Chúc Mừng Sinh Nhật ✨',
                  recipientName: 'Bạn Thân',
                  senderName: 'Anh Khoa',
                  greetingMessage: 'Chúc bạn tuổi mới luôn ngập tràn niềm vui, hạnh phúc và thành công rực rỡ!',
                  musicUrl: '',
                  eventDate: '20/10/2026',
                  eventTime: '18:30',
                  eventLocation: 'Trung Tâm Sự Kiện White Palace',
                  loveStartDate: '2022-02-14',
                  coordinates: '10.7769° N, 106.7009° E',
                }}
                title={title || 'Template Demo'}
                isPreview={true}
              />
            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">⚡ Chế độ thử nghiệm tương tác thật</span>
              <button
                type="button"
                onClick={() => setShowFullscreenPreview(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

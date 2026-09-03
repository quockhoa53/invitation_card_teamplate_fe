import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Template, TemplateCategory } from '../../types';
import { DynamicCodeRenderer } from '../../templates/DynamicCodeRenderer';
import { Pagination } from '../../components/common/Pagination';
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
} from 'lucide-react';

export const AdminTemplatesPage: React.FC = () => {
  const { theme } = useTheme();
  const { toast, confirmModal } = useToast();
  const isDark = theme === 'dark';

  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Active view tab: 'drafts' (Bản nháp) | 'published' (Bản công khai)
  const [activeTab, setActiveTab] = useState<'drafts' | 'published'>('drafts');

  // Pagination states for Drafts & Published
  const [draftPage, setDraftPage] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showModal, setShowModal] = useState(false);
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

  // Custom Code Tabs
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
    try {
      const [tplRes, catRes] = await Promise.all([
        api.getAdminTemplates(),
        api.getAdminCategories(),
      ]);
      if (tplRes.success && tplRes.data) {
        setTemplates(tplRes.data);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
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
    if (newConfig && newConfig !== '{}') setDefaultConfig(newConfig);
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
  <div class="floating-stars">✨ ✨ 💖 ✨ ✨</div>
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
    setShowModal(true);
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
    setShowModal(true);
  };

  // Save template form handler - Always saves as Draft when creating new
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

      setShowModal(false);
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

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6 text-rose-500" /> Quản Lý Kho Template KD
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
            Tách biệt rõ ràng giữa <strong>Bản Nháp (Drafts)</strong> và <strong>Bản Công Khai (Public)</strong>. Tích hợp phân trang mượt mà và trực quan.
          </p>
        </div>

        {activeTab === 'drafts' && (
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 active:scale-95 transition shrink-0"
          >
            <Plus className="w-4 h-4" /> Nạp Mẫu Bản Nháp Mới
          </button>
        )}
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
              ? 'bg-rose-500 text-white shadow-sm'
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
                  ? 'bg-rose-500 text-white shadow-sm'
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
                    isDark ? 'bg-slate-800 text-rose-300' : 'bg-rose-50 text-rose-700'
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
                            ? 'bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400'
                            : 'bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-stone-200'
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

      {/* ULTRA-COMPACT TEMPLATE UPLOAD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className={`max-w-3xl w-full border rounded-[28px] p-5 sm:p-6 shadow-2xl space-y-4 max-h-[94vh] overflow-y-auto transition-colors ${
            isDark ? 'bg-[#10141e] border-slate-800 text-slate-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${
              isDark ? 'border-slate-800' : 'border-stone-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-editorial text-lg font-bold flex items-center gap-2">
                    <span>
                      {!editingTemplate
                        ? 'Nạp Mẫu Bản Nháp Mới'
                        : editingTemplate.isPublished
                        ? 'Cập Nhật Template Công Khai'
                        : 'Chỉnh Sửa Bản Nháp'}
                    </span>
                    {editingTemplate?.isPublished ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Đang Công Khai
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                        Bản Nháp (Draft)
                      </span>
                    )}
                  </h4>
                  <span className={`text-[11px] block ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                    {!editingTemplate
                      ? 'Template sẽ được lưu vào danh mục Bản Nháp. Bạn có thể ra trang Bản Nháp để Xuất Bản sau.'
                      : 'Cập nhật thông tin hoặc mã nguồn render động'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadPresetSample}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1 hover:bg-amber-500/25 transition active:scale-95"
                  title="Nạp nhanh code mẫu thiệp 3D"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Mẫu Demo 3D
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800/40 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Alert Notice */}
              {editingTemplate?.isPublished ? (
                <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Template này <strong>Đang Công Khai</strong>. Bạn có thể cập nhật thông tin và mã nguồn HTML/CSS/JS bất cứ lúc nào mà không làm gián đoạn người dùng.
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-500" />
                  <span>
                    Mọi thay đổi sẽ được lưu vào <strong>Bản Nháp</strong>. Sau khi kiểm tra ưng ý, hãy ra ngoài trang <strong>Quản Lý Bản Nháp</strong> và bấm <strong>[Xuất Bản]</strong>.
                  </span>
                </div>
              )}

              {/* COMPACT HORIZONTAL UPLOAD DROPZONE */}
              <div>
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
                  className={`p-3 sm:p-3.5 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 ${
                    isDragging
                      ? 'border-rose-500 bg-rose-500/10'
                      : isDark
                      ? 'border-slate-700/80 bg-slate-900/60 hover:border-rose-500/60 hover:bg-slate-900'
                      : 'border-stone-300 bg-stone-50 hover:border-rose-400 hover:bg-rose-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xs">
                        Kéo thả file vào đây hoặc <span className="text-rose-500 underline">Bấm để chọn file</span>
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                        Hỗ trợ file <strong>.html</strong> (tự bóc tách CSS, JS) hoặc các file rời <strong>.html, .css, .js, .json</strong>
                      </p>
                    </div>
                  </div>

                  {uploadedFilesInfo.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {uploadedFilesInfo.map((f, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 font-bold text-[10px]"
                        >
                          <FileCheck className="w-3 h-3" /> {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-rose-400 px-2 py-1 rounded-lg bg-rose-500/10 shrink-0">
                      Auto-DOM Parser
                    </span>
                  )}
                </div>
              </div>

              {/* COMPACT METADATA FORM GRID */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  {/* Title */}
                  <div className="sm:col-span-5">
                    <label className="block font-semibold mb-1 text-[11px]">Tên Template</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Ví dụ: Thiệp Sinh Nhật 3D Neon"
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  {/* Slug */}
                  <div className="sm:col-span-4">
                    <label className="block font-semibold mb-1 text-[11px]">Slug (URL)</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="slug-duy-nhat"
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  {/* Category */}
                  <div className="sm:col-span-3">
                    <label className="block font-semibold mb-1 text-[11px]">Danh Mục</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-none cursor-pointer transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                      }`}
                    >
                      {categories.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.emoji || '✨'} {c.name}
                        </option>
                      ))}
                      {categories.length === 0 && (
                        <>
                          <option value="BIRTHDAY_LOVER">💖 Sinh nhật người yêu</option>
                          <option value="BIRTHDAY_FRIENDS">🎉 Sinh nhật bạn bè</option>
                          <option value="LOVE_ANNIVERSARY">💍 Kỷ niệm tình yêu</option>
                          <option value="EVENT_INVITATION">💌 Thư mời sự kiện</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  {/* Thumbnail URL */}
                  <div className="sm:col-span-7">
                    <label className="block font-semibold mb-1 text-[11px]">Thumbnail Image URL</label>
                    <input
                      type="text"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500'
                          : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                      }`}
                    />
                  </div>

                  {/* Pricing Toggle */}
                  <div className="sm:col-span-5 flex items-center gap-2 pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold select-none text-xs">
                      <input
                        type="checkbox"
                        checked={isFree}
                        onChange={(e) => setIsFree(e.target.checked)}
                        className="rounded text-rose-500 focus:ring-0"
                      />
                      <span>Miễn Phí</span>
                    </label>

                    {!isFree && (
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        placeholder="Giá VNĐ"
                        className={`flex-1 px-3 py-2 rounded-xl border text-xs font-bold ${
                          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-stone-50 border-stone-200'
                        }`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* TABBED CODE & LIVE PREVIEW PANEL */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab('preview')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition flex items-center gap-1 ${
                        activeCodeTab === 'preview'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : isDark
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem Thử Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveCodeTab('html')}
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        activeCodeTab === 'html'
                          ? 'bg-rose-500 text-white'
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
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        activeCodeTab === 'css'
                          ? 'bg-rose-500 text-white'
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
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        activeCodeTab === 'js'
                          ? 'bg-rose-500 text-white'
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
                      className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition ${
                        activeCodeTab === 'config'
                          ? 'bg-rose-500 text-white'
                          : isDark
                          ? 'bg-slate-800/60 text-slate-400 hover:text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      Config (JSON) {defaultConfig && defaultConfig !== '{}' ? `(${defaultConfig.length} ký tự)` : ''}
                    </button>
                  </div>

                  {customHtml && (
                    <button
                      type="button"
                      onClick={() => setShowFullscreenPreview(true)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Mở Popup Trải Nghiệm Full
                    </button>
                  )}
                </div>

                {/* Preview Box */}
                {activeCodeTab === 'preview' && (
                  <div className="h-[440px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex flex-col">
                    {customHtml ? (
                      <div className="flex-1 w-full h-full overflow-y-auto">
                        <DynamicCodeRenderer
                          customHtml={customHtml}
                          customCss={customCss}
                          customJs={customJs}
                          data={defaultConfig || {
                            greetingTitle: 'Chúc Mừng Sinh Nhật 💖',
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
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1.5">
                        <Code className="w-6 h-6 opacity-30" />
                        <p className="text-[11px]">Chưa có code template. Hãy kéo thả file HTML/CSS/JS lên ở trên hoặc chọn mẫu có sẵn.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* HTML Editor */}
                {activeCodeTab === 'html' && (
                  <textarea
                    rows={8}
                    value={customHtml}
                    onChange={(e) => setCustomHtml(e.target.value)}
                    placeholder="<div><h1>{{greetingTitle}}</h1><p>{{greetingMessage}}</p></div>"
                    className={`w-full p-3 rounded-2xl border text-xs font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                )}

                {/* CSS Editor */}
                {activeCodeTab === 'css' && (
                  <textarea
                    rows={8}
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    placeholder=".card-box { background: #111; color: #fff; padding: 20px; border-radius: 16px; }"
                    className={`w-full p-3 rounded-2xl border text-xs font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                )}

                {/* JS Editor */}
                {activeCodeTab === 'js' && (
                  <textarea
                    rows={8}
                    value={customJs}
                    onChange={(e) => setCustomJs(e.target.value)}
                    placeholder="// window.CARD_DATA chứa dữ liệu người dùng nhập&#10;console.log(window.CARD_DATA);"
                    className={`w-full p-3 rounded-2xl border text-xs font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                )}

                {/* Config JSON Editor */}
                {activeCodeTab === 'config' && (
                  <textarea
                    rows={8}
                    value={defaultConfig}
                    onChange={(e) => setDefaultConfig(e.target.value)}
                    placeholder='{\n  "greetingTitle": "Chúc Mừng Sinh Nhật",\n  "recipientName": "Em Yêu"\n}'
                    className={`w-full p-3 rounded-2xl border text-xs font-mono focus:outline-none ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-amber-300 focus:border-rose-500'
                        : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-rose-500'
                    }`}
                  />
                )}
              </div>

              {/* Action Buttons: Chỉ có nút Lưu Bản Nháp (khi tạo mới) / Lưu Cập Nhật (khi sửa) */}
              <div className="flex gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`px-5 py-2.5 rounded-xl border font-semibold text-xs transition ${
                    isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:brightness-105 active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <span>
                    {!editingTemplate
                      ? '💾 Lưu Bản Nháp'
                      : editingTemplate.isPublished
                      ? '💾 Lưu Cập Nhật'
                      : '💾 Lưu Bản Nháp'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN / PHONE DEVICE PREVIEW MODAL */}
      {showFullscreenPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="relative max-w-md w-full h-[90vh] bg-slate-950 border border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col">
            {/* Top Phone Mockup Header Bar */}
            <div className="h-10 bg-slate-900 border-b border-slate-800 px-5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
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
                  greetingTitle: 'Chúc Mừng Sinh Nhật 💖',
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

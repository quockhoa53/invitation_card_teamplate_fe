import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Template, Card } from '../types';
import { api } from '../services/api';
import { CardEditor } from '../components/editor/CardEditor';
import { useAuth } from '../context/AuthContext';
import { PurchaseTemplateModal } from '../components/templates/PurchaseTemplateModal';

import { useTheme } from '../context/ThemeContext';
import { Sparkles, Palette, Smartphone, Monitor } from 'lucide-react';

export const CardEditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isTemplateOwned } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const templateId = searchParams.get('templateId');
  const cardId = searchParams.get('cardId');

  const [template, setTemplate] = useState<Template | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (cardId) {
          const res = await api.getCardById(cardId);
          if (res.success && res.data) {
            setCard(res.data);
            setTemplate(res.data.template);
          }
        } else if (templateId) {
          const res = await api.getTemplates();
          if (res.success && res.data) {
            const found = res.data.find((t) => t.id === templateId);
            if (found) setTemplate(found);
          }
        } else {
          // Default to first template
          const res = await api.getTemplates();
          if (res.success && res.data && res.data.length > 0) {
            setTemplate(res.data[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [templateId, cardId]);

  useEffect(() => {
    if (!loading && template && !card && !isTemplateOwned(template)) {
      setShowPurchaseModal(true);
    }
  }, [loading, template, card, isTemplateOwned]);

  if (loading || !template) {
    return (
      <div className={`min-h-screen relative overflow-hidden flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-[#0b0f17] text-slate-100' : 'bg-[#faf8f5] text-stone-800'
      }`}>
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[580px] h-[580px] bg-gradient-to-tr from-orange-500/15 via-amber-400/10 to-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[420px] h-[420px] bg-gradient-to-tl from-indigo-500/10 to-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar placeholder */}
        <div className={`h-14 px-6 border-b flex items-center justify-between backdrop-blur-md transition-colors ${
          isDark ? 'bg-[#121824]/80 border-slate-800' : 'bg-white/80 border-stone-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-8 w-24 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-stone-200/70'} animate-pulse`} />
            <div className={`h-4 w-44 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-stone-200/70'} animate-pulse`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-8 w-32 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-stone-200/70'} animate-pulse`} />
            <div className={`h-8 w-28 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-stone-200/70'} animate-pulse`} />
          </div>
        </div>

        {/* Main Content Area: Centered Luxury Studio Loader with soft backdrop layout */}
        <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6">
          {/* Subtle Background Layout Silhouette */}
          <div className="absolute inset-4 sm:inset-6 grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-30 pointer-events-none blur-[1px]">
            <div className={`h-full rounded-3xl border p-6 space-y-4 ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/40 border-stone-200'
            }`}>
              <div className={`h-7 w-40 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
              <div className={`h-12 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
              <div className={`h-24 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
              <div className={`h-12 w-full rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-stone-200'}`} />
            </div>
            <div className={`h-full rounded-3xl border p-6 flex flex-col items-center justify-center ${
              isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white/40 border-stone-200'
            }`}>
              <div className={`w-[280px] h-[480px] rounded-[36px] border-4 ${
                isDark ? 'border-slate-800 bg-slate-900/60' : 'border-stone-200 bg-stone-100/60'
              }`} />
            </div>
          </div>

          {/* Luxury Studio Floating Card */}
          <div className={`relative z-20 w-full max-w-sm sm:max-w-md p-8 sm:p-10 rounded-3xl border shadow-2xl backdrop-blur-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800/90 shadow-black/40'
              : 'bg-white/95 border-amber-100 shadow-amber-900/10'
          }`}>
            {/* Glowing Luminous Badge Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-orange-500 via-amber-400 to-rose-500 animate-spin opacity-75 blur-md"
                style={{ animationDuration: '4s' }}
              />
              <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg ${
                isDark
                  ? 'bg-slate-950 border-slate-700/80 text-orange-400'
                  : 'bg-gradient-to-b from-white to-amber-50/80 border-amber-200/80 text-orange-500'
              }`}>
                <Sparkles className="w-8 h-8 animate-bounce" style={{ animationDuration: '2.2s' }} />
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight">
                Đang Mở Không Gian Sáng Tạo
              </h3>
              <p className={`text-xs sm:text-sm font-medium leading-relaxed max-w-xs mx-auto ${
                isDark ? 'text-slate-400' : 'text-stone-500'
              }`}>
                Đang chuẩn bị bộ công cụ tùy biến, phông chữ mỹ thuật & hiệu ứng tương tác 3D...
              </p>
            </div>

            {/* Smooth Animated Gradient Beam Progress */}
            <div className="space-y-2.5 pt-1">
              <div className={`h-2 w-full rounded-full overflow-hidden relative ${
                isDark ? 'bg-slate-800' : 'bg-stone-100'
              }`}>
                <div
                  className="h-full w-full bg-gradient-to-r from-orange-500 via-amber-400 to-rose-500 rounded-full animate-pulse"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  <Palette className="w-3.5 h-3.5 text-orange-500" />
                  Studio Tương Tác
                </span>
                <span className="text-orange-500 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                  Sẵn sàng trải nghiệm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CardEditor
        initialCard={card}
        selectedTemplate={template}
        onSaved={() => navigate('/dashboard')}
        onCancel={() => navigate('/dashboard')}
      />

      <PurchaseTemplateModal
        template={template}
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          if (!card && !isTemplateOwned(template)) {
            navigate('/templates');
          }
        }}
        onSuccess={() => {
          setShowPurchaseModal(false);
        }}
      />
    </>
  );
};

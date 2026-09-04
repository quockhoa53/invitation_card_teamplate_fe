import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Template, Card } from '../types';
import { api } from '../services/api';
import { CardEditor } from '../components/editor/CardEditor';
import { useAuth } from '../context/AuthContext';
import { PurchaseTemplateModal } from '../components/templates/PurchaseTemplateModal';

export const CardEditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isTemplateOwned } = useAuth();
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
      <div className="min-h-screen bg-slate-950 p-4 sm:p-6 space-y-6 animate-pulse">
        {/* Top bar skeleton */}
        <div className="h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between px-6">
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="flex gap-3">
            <div className="h-9 w-24 bg-slate-800 rounded-xl" />
            <div className="h-9 w-28 bg-slate-800 rounded-xl" />
          </div>
        </div>
        {/* Split editor skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[650px] rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4">
            <div className="h-8 w-40 bg-slate-800 rounded-xl" />
            <div className="h-12 w-full bg-slate-800 rounded-xl" />
            <div className="h-28 w-full bg-slate-800 rounded-xl" />
            <div className="h-12 w-full bg-slate-800 rounded-xl" />
            <div className="h-12 w-full bg-slate-800 rounded-xl" />
          </div>
          <div className="h-[650px] rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-center items-center">
            <div className="w-4/5 h-4/5 rounded-2xl bg-slate-800" />
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

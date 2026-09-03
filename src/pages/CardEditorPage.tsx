import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Template, Card } from '../types';
import { api } from '../services/api';
import { CardEditor } from '../components/editor/CardEditor';

export const CardEditorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const templateId = searchParams.get('templateId');
  const cardId = searchParams.get('cardId');

  const [template, setTemplate] = useState<Template | null>(null);
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading || !template) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CardEditor
      initialCard={card}
      selectedTemplate={template}
      onSaved={() => navigate('/dashboard')}
      onCancel={() => navigate('/dashboard')}
    />
  );
};

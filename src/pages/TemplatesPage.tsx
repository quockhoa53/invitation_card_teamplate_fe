import React from 'react';
import { TemplatesCatalog } from '../components/templates/TemplatesCatalog';

export const TemplatesPage: React.FC = () => {
  return (
    <div className="min-h-screen py-6 sm:py-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TemplatesCatalog isStandalonePage={true} />
      </main>
    </div>
  );
};

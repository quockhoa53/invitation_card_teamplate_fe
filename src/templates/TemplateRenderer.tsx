import React from 'react';
import { LoverBirthdayTemplate } from './LoverBirthdayTemplate';
import { FriendsBirthdayTemplate } from './FriendsBirthdayTemplate';
import { LoveAnniversaryTemplate } from './LoveAnniversaryTemplate';
import { LoveRainAnniversaryTemplate } from './LoveRainAnniversaryTemplate';
import { EventInvitationTemplate } from './EventInvitationTemplate';
import { DynamicCodeRenderer } from './DynamicCodeRenderer';
import { CardWish } from '../types';

interface TemplateRendererProps {
  slug: string;
  category?: string;
  templateType?: string;
  customHtml?: string;
  customCss?: string;
  customJs?: string;
  customData: string | any;
  title: string;
  wishes?: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  slug,
  category,
  templateType,
  customHtml,
  customCss,
  customJs,
  customData,
  title,
  wishes = [],
  onSendWish,
  isPreview = false,
}) => {
  let parsedData: any = {};
  if (typeof customData === 'string') {
    try {
      parsedData = JSON.parse(customData);
    } catch (e) {
      console.error('Failed to parse customData JSON', e);
      parsedData = {};
    }
  } else if (typeof customData === 'object' && customData !== null) {
    parsedData = customData;
  }

  // If this template is a dynamic custom code template injected via Admin
  if (templateType === 'CUSTOM_CODE' || (customHtml && customHtml.trim().length > 0)) {
    return (
      <DynamicCodeRenderer
        customHtml={customHtml}
        customCss={customCss}
        customJs={customJs}
        data={parsedData}
        title={title}
        wishes={wishes}
        onSendWish={onSendWish}
        isPreview={isPreview}
      />
    );
  }

  // Match template based on slug or category
  if (slug?.includes('nguoi-yeu') || category === 'BIRTHDAY_LOVER') {
    return (
      <LoverBirthdayTemplate
        data={parsedData}
        title={title}
        wishes={wishes}
        onSendWish={onSendWish}
        isPreview={isPreview}
      />
    );
  }

  if (slug?.includes('ban-be') || category === 'BIRTHDAY_FRIENDS') {
    return (
      <FriendsBirthdayTemplate
        data={parsedData}
        title={title}
        wishes={wishes}
        onSendWish={onSendWish}
        isPreview={isPreview}
      />
    );
  }

  if (slug?.includes('ky-niem') || category === 'LOVE_ANNIVERSARY') {
    if (slug?.includes('vinyl')) {
      return (
        <LoveAnniversaryTemplate
          data={parsedData}
          title={title}
          wishes={wishes}
          onSendWish={onSendWish}
          isPreview={isPreview}
        />
      );
    }
    // Default to the viral Falling Words & Hearts Rain template (Screenshot 2)
    return (
      <LoveRainAnniversaryTemplate
        data={parsedData}
        title={title}
        wishes={wishes}
        onSendWish={onSendWish}
        isPreview={isPreview}
      />
    );
  }

  if (slug?.includes('thu-moi') || category === 'EVENT_INVITATION') {
    return (
      <EventInvitationTemplate
        data={parsedData}
        title={title}
        wishes={wishes}
        onSendWish={onSendWish}
        isPreview={isPreview}
      />
    );
  }

  // Fallback to LoverBirthdayTemplate
  return (
    <LoverBirthdayTemplate
      data={parsedData}
      title={title}
      wishes={wishes}
      onSendWish={onSendWish}
      isPreview={isPreview}
    />
  );
};

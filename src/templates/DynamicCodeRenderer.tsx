import React, { useEffect, useRef } from 'react';
import { CardWish } from '../types';

interface DynamicCodeRendererProps {
  customHtml?: string;
  customCss?: string;
  customJs?: string;
  data?: any;
  title?: string;
  wishes?: CardWish[];
  onSendWish?: (name: string, message: string, emoji?: string) => Promise<void>;
  isPreview?: boolean;
}

export const DynamicCodeRenderer: React.FC<DynamicCodeRendererProps> = ({
  customHtml = '',
  customCss = '',
  customJs = '',
  data = {},
  title = '',
  wishes = [],
  onSendWish,
  isPreview = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Listen for messages from inside iframe (e.g. guestbook wishes)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SEND_WISH' && onSendWish) {
        onSendWish(event.data.name, event.data.message, event.data.emoji);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSendWish]);

  // Parse data if it's a JSON string
  let parsedData: any = {};
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = {};
    }
  } else if (typeof data === 'object' && data !== null) {
    parsedData = { ...data };
  }

  const mergedData = { ...parsedData };

  // Interpolate placeholders in HTML
  let processedHtml =
    customHtml ||
    '<div style="text-align:center;padding:40px;color:#fff;"><h1>{{greetingTitle}}</h1><p>{{greetingMessage}}</p></div>';

  // Replace all {{placeholder}} variables
  Object.keys(mergedData).forEach((key) => {
    const val = mergedData[key];
    if (val !== undefined && val !== null) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      processedHtml = processedHtml.replace(regex, String(val));
    }
  });

  // Bundle entire document with styles and scripts
  const fullHtmlDocument = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>${title || 'KD Interactive Card'}</title>
      
      <!-- Google Fonts & CDN libraries commonly used in templates -->
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Inter:wght@300;400;600;700&family=Outfit:wght@400;600;800&family=Pacifico&family=Playfair+Display:ital,wght@0,600;1,400&display=swap" rel="stylesheet">
      <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>

      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        html, body {
          width: 100%;
          min-height: 100%;
          font-family: 'Inter', sans-serif;
          background: #090d16;
          color: #ffffff;
          overflow-x: hidden;
        }
        /* Sleek transparent scrollbar */
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(160, 160, 160, 0.25);
          border-radius: 999px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(160, 160, 160, 0.5);
        }
        html {
          scrollbar-width: thin;
          scrollbar-color: rgba(160, 160, 160, 0.25) transparent;
        }
        /* Custom User Styles */
        ${customCss}
      </style>
    </head>
    <body>
      ${processedHtml}

      <script>
        // Inject global data for custom JS scripts to access freely
        window.CARD_DATA = ${JSON.stringify(mergedData)};
        window.CARD_WISHES = ${JSON.stringify(wishes)};
        window.IS_PREVIEW = ${isPreview};

        // Helper function for custom templates to post wishes back to backend
        window.sendCardWish = function(name, message, emoji) {
          window.parent.postMessage({
            type: 'SEND_WISH',
            name: name,
            message: message,
            emoji: emoji || '❤️'
          }, '*');
        };

        // Execute Custom User JS
        try {
          ${customJs}
        } catch (e) {
          console.error('Error executing template custom JS:', e);
        }
      </script>
    </body>
    </html>
  `;

  return (
    <div className="w-full h-full relative flex-1 min-h-0">
      <iframe
        ref={iframeRef}
        srcDoc={fullHtmlDocument}
        title={title || 'Template Preview'}
        className="w-full h-full border-0 bg-transparent block absolute inset-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
  );
};

import React, { useId } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Gift, Sparkles } from 'lucide-react';

export type QrShapeType = 'default' | 'heart' | 'square' | 'circle' | 'chat';

interface QrShapeRendererProps {
  value: string;
  size?: number;
  shape: QrShapeType;
  fgColor: string;
  bgColor?: string;
  centerIcon?: 'heart' | 'gift' | 'sparkles' | 'none';
  id?: string;
}

export const QrShapeRenderer: React.FC<QrShapeRendererProps> = ({
  value,
  size = 240,
  shape = 'default',
  fgColor = '#000000',
  bgColor = '#ffffff',
  centerIcon = 'none',
  id = 'qr-modal-svg',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const clipId = `clip-shape-${uniqueId}`;

  // Normalized (0.0 to 1.0) Heart Path for objectBoundingBox
  const heartPathNormalized = `
    M 0.5, 0.95
    C 0.15, 0.65 0.02, 0.45 0.02, 0.28
    C 0.02, 0.12 0.14, 0.02 0.29, 0.02
    C 0.38, 0.02 0.46, 0.07 0.5, 0.14
    C 0.54, 0.07 0.62, 0.02 0.71, 0.02
    C 0.86, 0.02 0.98, 0.12 0.98, 0.28
    C 0.98, 0.45 0.85, 0.65 0.5, 0.95 Z
  `;

  // Normalized Speech Bubble Path
  const chatPathNormalized = `
    M 0.1, 0.05
    H 0.9
    A 0.08,0.08 0 0,1 0.98,0.13
    V 0.68
    A 0.08,0.08 0 0,1 0.9,0.76
    H 0.42
    L 0.22, 0.94
    V 0.76
    H 0.1
    A 0.08,0.08 0 0,1 0.02,0.68
    V 0.13
    A 0.08,0.08 0 0,1 0.1,0.05 Z
  `;

  // Determine actual foreground color (for 'default', default to #0f172a if not specified)
  const activeFgColor = shape === 'default' && fgColor === '#ef4444' ? '#0f172a' : fgColor;
  const isDefault = shape === 'default';

  return (
    <div
      className="relative flex items-center justify-center p-3 bg-white rounded-2xl shadow-inner select-none"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        id={id}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-hidden"
      >
        <defs>
          {/* ObjectBoundingBox allows pixel-perfect 0.0-1.0 clipping without any scale bugs */}
          {shape === 'heart' && (
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={heartPathNormalized} />
            </clipPath>
          )}

          {shape === 'circle' && (
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <circle cx="0.5" cy="0.5" r="0.48" />
            </clipPath>
          )}

          {shape === 'square' && (
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <rect x="0.03" y="0.03" width="0.94" height="0.94" rx="0.12" ry="0.12" />
            </clipPath>
          )}

          {shape === 'chat' && (
            <clipPath id={clipId} clipPathUnits="objectBoundingBox">
              <path d={chatPathNormalized} />
            </clipPath>
          )}
        </defs>

        {/* QR Code Layer */}
        {isDefault ? (
          /* Standard Default QR Code (No clip path, 100% crisp standard QR) */
          <foreignObject x={0} y={0} width={size} height={size}>
            <div
              style={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: bgColor,
              }}
            >
              <QRCodeSVG
                value={value}
                size={size - 8}
                level="M"
                fgColor={activeFgColor}
                bgColor={bgColor}
                includeMargin={false}
              />
            </div>
          </foreignObject>
        ) : (
          /* Styled Masked QR Code with high error correction */
          <g clipPath={`url(#${clipId})`}>
            <foreignObject x={0} y={0} width={size} height={size}>
              <div
                style={{
                  width: size,
                  height: size,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bgColor,
                }}
              >
                <QRCodeSVG
                  value={value}
                  size={shape === 'heart' ? Math.round(size * 1.05) : size}
                  level="H"
                  fgColor={activeFgColor}
                  bgColor={bgColor}
                  includeMargin={false}
                />
              </div>
            </foreignObject>
          </g>
        )}
      </svg>

      {/* Optional Center Icon Badge (Only for styled shapes) */}
      {!isDefault && centerIcon !== 'none' && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 shadow-md flex items-center justify-center border pointer-events-none"
          style={{
            backgroundColor: bgColor,
            borderColor: activeFgColor,
            color: activeFgColor,
          }}
        >
          {centerIcon === 'heart' && <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />}
          {centerIcon === 'gift' && <Gift className="w-3.5 h-3.5" />}
          {centerIcon === 'sparkles' && <Sparkles className="w-3.5 h-3.5" />}
        </div>
      )}
    </div>
  );
};

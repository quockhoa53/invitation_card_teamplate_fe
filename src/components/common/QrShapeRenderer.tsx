import React, { useRef, useId } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Gift, Sparkles, MessageCircle } from 'lucide-react';

export type QrShapeType = 'heart' | 'square' | 'circle' | 'chat';

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
  size = 260,
  shape = 'heart',
  fgColor = '#ef4444',
  bgColor = '#ffffff',
  centerIcon = 'heart',
  id = 'qr-shape-svg',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const clipId = `clip-${shape}-${uniqueId}`;

  // Heart path definition for SVG (normalized 0 to 1)
  const heartPathData = `
    M 0.5, 0.94 
    C 0.12, 0.64 0.02, 0.44 0.02, 0.28 
    C 0.02, 0.12 0.14, 0.02 0.29, 0.02 
    C 0.39, 0.02 0.46, 0.08 0.5, 0.15 
    C 0.54, 0.08 0.61, 0.02 0.71, 0.02 
    C 0.86, 0.02 0.98, 0.12 0.98, 0.28 
    C 0.98, 0.44 0.88, 0.64 0.5, 0.94 Z
  `;

  // Speech bubble path definition
  const chatPathData = `
    M 0.15, 0.05 
    H 0.85 
    A 0.15,0.15 0 0,1 1,0.2 
    V 0.7 
    A 0.15,0.15 0 0,1 0.85,0.85 
    H 0.4 
    L 0.2, 0.98 
    V 0.85 
    H 0.15 
    A 0.15,0.15 0 0,1 0,0.7 
    V 0.2 
    A 0.15,0.15 0 0,1 0.15,0.05 Z
  `;

  const scaleTransform = `scale(${size}, ${size})`;

  return (
    <div className="relative inline-block select-none" style={{ width: size, height: size }}>
      <svg
        id={id}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible drop-shadow-md"
      >
        <defs>
          {shape === 'heart' && (
            <clipPath id={clipId}>
              <path d={heartPathData} transform={scaleTransform} />
            </clipPath>
          )}

          {shape === 'circle' && (
            <clipPath id={clipId}>
              <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} />
            </clipPath>
          )}

          {shape === 'chat' && (
            <clipPath id={clipId}>
              <path d={chatPathData} transform={scaleTransform} />
            </clipPath>
          )}

          {shape === 'square' && (
            <clipPath id={clipId}>
              <rect x={4} y={4} width={size - 8} height={size - 8} rx={24} ry={24} />
            </clipPath>
          )}
        </defs>

        {/* Background Card Silhouette */}
        {shape === 'heart' && (
          <path
            d={heartPathData}
            transform={scaleTransform}
            fill={bgColor}
            stroke={fgColor}
            strokeWidth="4"
            className="transition-colors duration-300"
          />
        )}

        {shape === 'circle' && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 2}
            fill={bgColor}
            stroke={fgColor}
            strokeWidth="4"
          />
        )}

        {shape === 'chat' && (
          <path
            d={chatPathData}
            transform={scaleTransform}
            fill={bgColor}
            stroke={fgColor}
            strokeWidth="4"
          />
        )}

        {shape === 'square' && (
          <rect
            x={2}
            y={2}
            width={size - 4}
            height={size - 4}
            rx={24}
            ry={24}
            fill={bgColor}
            stroke={fgColor}
            strokeWidth="3"
          />
        )}

        {/* Masked QR Code (Always readable with error correction level H) */}
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
                size={Math.round(size * (shape === 'heart' ? 1.06 : 0.94))}
                level="H"
                fgColor={fgColor}
                bgColor={bgColor}
                includeMargin={false}
              />
            </div>
          </foreignObject>
        </g>

        {/* Outer Accent Glow Border for Heart */}
        {shape === 'heart' && (
          <path
            d={heartPathData}
            transform={scaleTransform}
            fill="none"
            stroke={fgColor}
            strokeWidth="3"
            opacity="0.8"
          />
        )}
      </svg>

      {/* Center Icon Badge */}
      {centerIcon !== 'none' && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 shadow-md flex items-center justify-center border"
          style={{
            backgroundColor: bgColor,
            borderColor: fgColor,
            color: fgColor,
          }}
        >
          {centerIcon === 'heart' && <Heart className="w-4 h-4 fill-current animate-pulse" />}
          {centerIcon === 'gift' && <Gift className="w-4 h-4" />}
          {centerIcon === 'sparkles' && <Sparkles className="w-4 h-4" />}
        </div>
      )}
    </div>
  );
};

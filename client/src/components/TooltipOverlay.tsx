import React from 'react';

interface TooltipOverlayProps {
  content: string;
  isVisible: boolean;
  position: { top: number; left: number };
  onClose: () => void;
}

const TooltipOverlay: React.FC<TooltipOverlayProps> = ({ content, isVisible, position, onClose }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
      onMouseLeave={onClose}
    >
      {content}
    </div>
  );
};

export default TooltipOverlay;
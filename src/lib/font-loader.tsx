import React from 'react';

export const FontLoader: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      body {
        font-family: 'Tajawal', sans-serif;
      }
      
      /* Animation for the financial graph */
      @keyframes growBar {
        from { height: 0; }
        to { height: var(--target-height); }
      }
      
      .chart-bar {
        animation: growBar 1s ease-out forwards;
      }
      
      /* Custom scrollbar styling */
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #039089;
        border-radius: 3px;
      }
      
      /* For text selection */
      ::selection {
        background: rgba(3, 144, 137, 0.2);
      }
    `
    }} />
  );
};

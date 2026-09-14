'use client';

import React from 'react';

interface MobileFrameWrapperProps {
  children: React.ReactNode;
}

export default function MobileFrameWrapper({ children }: MobileFrameWrapperProps) {
  return (
    <div className="flex justify-center items-start py-6 px-2 bg-[#EFF3ED] min-h-screen">
      {/* Smartphone Device Frame Mockup */}
      <div className="w-full max-w-[412px] bg-white border-[8px] border-[#162B20] rounded-[48px] shadow-2xl overflow-hidden flex flex-col relative h-[860px]">
        {/* Top Speaker / Dynamic Island */}
        <div className="bg-[#162B20] h-6 flex items-center justify-center relative">
          <div className="w-20 h-4 bg-black rounded-full" />
        </div>

        {/* Smartphone Status Bar */}
        <div className="px-6 py-2 bg-white flex items-center justify-between text-[11px] font-bold text-[#19241C] border-b border-[#DFE6DC]/40 select-none">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>5G</span>
            <span>📶</span>
            <span>🔋 100%</span>
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto bg-[#EFF3ED] p-3 space-y-4">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="bg-white py-2 flex justify-center border-t border-[#DFE6DC]/40">
          <div className="w-32 h-1 bg-[#19241C] rounded-full" />
        </div>
      </div>
    </div>
  );
}

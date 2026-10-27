import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

export const AndroidStatusBar: React.FC = () => {
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, '0');
      const mm = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hh}:${mm}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-[#17365D] text-white/90 text-xs px-4 py-1.5 flex items-center justify-between select-none shrink-0 z-50">
      <span className="font-semibold tracking-tight font-mono">{timeStr}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-medium tracking-wide uppercase text-white/70">5G</span>
        <Signal className="w-3.5 h-3.5 text-white/80" />
        <Wifi className="w-3.5 h-3.5 text-white/80" />
        <BatteryMedium className="w-4 h-4 text-white/90" />
      </div>
    </div>
  );
};

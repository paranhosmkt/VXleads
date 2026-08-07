import React, { useState, useEffect } from 'react';

interface SlotMachineProps {
  isSpinning: boolean;
  prizeText?: string;
}

const ITEMS = ['💎', '7️⃣', '🍒', '🔔', '🍀', '💰'];

export default function SlotMachine({ isSpinning, prizeText }: SlotMachineProps) {
  const [slots, setSlots] = useState(['7️⃣', '7️⃣', '7️⃣']);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isSpinning) {
      interval = setInterval(() => {
        setSlots([
          ITEMS[Math.floor(Math.random() * ITEMS.length)],
          ITEMS[Math.floor(Math.random() * ITEMS.length)],
          ITEMS[Math.floor(Math.random() * ITEMS.length)],
        ]);
      }, 100);
    } else {
      if (prizeText) {
        // If they won, show 3 of the same, for example 🎁
        setSlots(['🎁', '🎁', '🎁']);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSpinning, prizeText]);

  return (
    <div className="bg-gray-900 rounded-xl p-4 flex gap-4 justify-center items-center h-40 overflow-hidden shadow-inner">
      {slots.map((item, index) => (
        <div key={index} className="w-24 h-32 bg-white rounded-lg flex items-center justify-center text-5xl border-y-4 border-gray-300 shadow-inner overflow-hidden relative">
           <span className={`${isSpinning ? 'animate-bounce text-gray-600' : 'text-indigo-600'} transition-all`}>
             {item}
           </span>
        </div>
      ))}
    </div>
  );
}

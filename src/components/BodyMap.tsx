import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';

export type BodyRegion = 
  | 'head' | 'neck' | 'chest' | 'abdomen' | 'pelvis' 
  | 'left_arm' | 'right_arm' | 'left_leg' | 'right_leg'
  | 'upper_back' | 'lower_back' | 'shoulders';

interface BodyMapProps {
  onSelectRegion: (region: BodyRegion, label: string) => void;
  selectedRegion?: BodyRegion;
}

export function BodyMap({ onSelectRegion, selectedRegion }: BodyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);

  const regions: Record<BodyRegion, { label: string; description: string }> = {
    head: { label: 'Head', description: 'Headaches, dizziness, or facial pain' },
    neck: { label: 'Neck', description: 'Stiffness, sore throat, or thyroid issues' },
    chest: { label: 'Chest', description: 'Heart, lungs, or rib cage pain' },
    abdomen: { label: 'Abdomen', description: 'Digestive, stomach, or organ pain' },
    pelvis: { label: 'Pelvis', description: 'Hips, bladder, or reproductive areas' },
    left_arm: { label: 'Left Arm', description: 'Shoulder to hand pain or numbness' },
    right_arm: { label: 'Right Arm', description: 'Shoulder to hand pain or numbness' },
    left_leg: { label: 'Left Leg', description: 'Hip to foot pain or swelling' },
    right_leg: { label: 'Right Leg', description: 'Hip to foot pain or swelling' },
    upper_back: { label: 'Upper Back', description: 'Shoulder blades and upper spine' },
    lower_back: { label: 'Lower Back', description: 'Lumbar area and lower spine' },
    shoulders: { label: 'Shoulders', description: 'Shoulder joint and rotator cuff' },
  };

  const renderPath = (id: BodyRegion, d: string, label: string) => {
    const isSelected = selectedRegion === id;
    const isHovered = hoveredRegion === id;

    return (
      <g key={id}>
        <motion.path
          id={id}
          d={d}
          className={cn(
            "transition-all duration-300 cursor-pointer stroke-[1.5]",
            isSelected 
              ? "fill-blue-500 stroke-blue-600 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
              : isHovered 
                ? "fill-blue-100 stroke-blue-400" 
                : "fill-slate-50 stroke-slate-200"
          )}
          onClick={() => onSelectRegion(id, label)}
          onMouseEnter={() => setHoveredRegion(id)}
          onMouseLeave={() => setHoveredRegion(null)}
          initial={false}
          animate={{
            scale: isSelected ? 1.02 : 1,
          }}
        />
        {isSelected && (
          <motion.path
            d={d}
            className="fill-none stroke-blue-400 stroke-2 pointer-events-none"
            initial={{ opacity: 0.5, scale: 1 }}
            animate={{ 
              opacity: [0.5, 0],
              scale: [1, 1.05],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-2xl">
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit mb-2">
        <button
          onClick={() => setView('front')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            view === 'front' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Front View
        </button>
        <button
          onClick={() => setView('back')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
            view === 'back' ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          Back View
        </button>
      </div>

      <div className="relative w-full max-w-[280px] aspect-[2/3] flex items-center justify-center">
        <svg viewBox="0 0 200 400" className="w-full h-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {view === 'front' ? (
            <g>
              {/* Anatomical Front Paths */}
              {renderPath('head', "M100,20 c-12,0 -22,10 -22,25 c0,15 10,25 22,25 s22,-10 22,-25 c0,-15 -10,-25 -22,-25", "Head")}
              {renderPath('neck', "M88,70 c0,0 2,12 12,12 s12,-12 12,-12 l-2,-5 h-20 z", "Neck")}
              {renderPath('shoulders', "M55,85 c-10,0 -20,5 -20,15 l5,10 h120 l5,-10 c0,-10 -10,-15 -20,-15 z", "Shoulders")}
              {renderPath('chest', "M55,100 h90 v60 c0,15 -15,25 -45,25 s-45,-10 -45,-25 z", "Chest")}
              {renderPath('abdomen', "M55,185 h90 v50 c0,10 -10,20 -45,20 s-45,-10 -45,-20 z", "Abdomen")}
              {renderPath('pelvis', "M55,255 h90 l-15,35 h-60 z", "Pelvis")}
              {renderPath('right_arm', "M145,100 l25,15 l-15,100 l-25,-15 z", "Right Arm")}
              {renderPath('left_arm', "M55,100 l-25,15 l15,100 l25,-15 z", "Left Arm")}
              {renderPath('right_leg', "M105,290 h30 l10,100 h-35 z", "Right Leg")}
              {renderPath('left_leg', "M65,290 h30 l-5,100 h-35 z", "Left Leg")}
            </g>
          ) : (
            <g>
              {/* Anatomical Back Paths */}
              {renderPath('head', "M100,20 c-12,0 -22,10 -22,25 c0,15 10,25 22,25 s22,-10 22,-25 c0,-15 -10,-25 -22,-25", "Head")}
              {renderPath('neck', "M88,70 c0,0 2,12 12,12 s12,-12 12,-12 l-2,-5 h-20 z", "Neck")}
              {renderPath('upper_back', "M55,85 h90 v80 h-90 z", "Upper Back")}
              {renderPath('lower_back', "M55,165 h90 v70 h-90 z", "Lower Back")}
              {renderPath('right_arm', "M55,100 l-25,15 l15,100 l25,-15 z", "Right Arm")}
              {renderPath('left_arm', "M145,100 l25,15 l-15,100 l-25,-15 z", "Left Arm")}
              {renderPath('right_leg', "M65,290 h30 l-5,100 h-35 z", "Right Leg")}
              {renderPath('left_leg', "M105,290 h30 l10,100 h-35 z", "Left Leg")}
            </g>
          )}
        </svg>

        {/* Hover Info Overlay */}
        <AnimatePresence>
          {(hoveredRegion || selectedRegion) && (
            <motion.div
              key="region-info-overlay"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 w-[80%] p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-blue-100 z-10"
            >
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 text-center">
                {hoveredRegion ? 'Focus' : 'Selected'}
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1 text-center">
                {regions[hoveredRegion || selectedRegion!].label}
              </div>
              <div className="text-[9px] text-slate-500 leading-tight text-center">
                {regions[hoveredRegion || selectedRegion!].description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          <Info className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Selection</p>
          <p className="text-xs font-bold text-slate-700">
            {selectedRegion ? regions[selectedRegion].label : "Tap a region to begin"}
          </p>
        </div>
        {selectedRegion && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"
          />
        )}
      </div>
    </div>
  );
}

'use client';

import * as React from 'react';
import { GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
        <GraduationCap className="w-6 h-6 text-white" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-black text-slate-900 leading-none tracking-tight">
            Gestão<span className="text-primary">Acadêmica</span>
          </span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
            Portal do Aluno
          </span>
        </div>
      )}
    </div>
  );
}

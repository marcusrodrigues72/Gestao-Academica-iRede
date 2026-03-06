'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={cn(
                  "p-3 rounded-2xl",
                  variant === 'danger' ? "bg-rose-50 text-rose-500" :
                  variant === 'warning' ? "bg-amber-50 text-amber-500" :
                  "bg-blue-50 text-blue-500"
                )}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {description}
              </p>

              <div className="flex items-center gap-3 mt-10">
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button 
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                    variant === 'danger' ? "bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600" :
                    variant === 'warning' ? "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600" :
                    "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
                  )}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

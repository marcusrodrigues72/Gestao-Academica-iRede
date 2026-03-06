'use client';

import * as React from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Option {
  id: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção...',
  label,
  required,
  disabled,
  className
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.id === value);

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(opt => 
      opt.label.toLowerCase().includes(query) || 
      (opt.sublabel && opt.sublabel.toLowerCase().includes(query))
    );
  }, [options, searchQuery]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleOpen = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  return (
    <div className={cn("relative space-y-2", className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      
      <div 
        onClick={toggleOpen}
        className={cn(
          "w-full h-14 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold flex items-center justify-between cursor-pointer transition-all",
          isOpen ? "ring-2 ring-primary/20 bg-white shadow-sm" : "hover:bg-slate-100",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="flex-1 truncate">
          {selectedOption ? (
            <div className="flex flex-col">
              <span className="text-slate-900 truncate">{selectedOption.label}</span>
              {selectedOption.sublabel && (
                <span className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-tighter">
                  {selectedOption.sublabel}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          {value && !disabled && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-3 border-b border-slate-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setIsOpen(false);
                  }}
                  placeholder="Digite para buscar..."
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {filteredOptions.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSelect(option.id)}
                      className={cn(
                        "w-full p-3 rounded-xl flex items-center justify-between text-left transition-all",
                        value === option.id 
                          ? "bg-primary/10 text-primary" 
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{option.label}</span>
                        {option.sublabel && (
                          <span className="text-[10px] opacity-70 uppercase tracking-tighter">
                            {option.sublabel}
                          </span>
                        )}
                      </div>
                      {value === option.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-400 font-medium">Nenhum resultado encontrado</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

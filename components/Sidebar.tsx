'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Settings,
  FileText,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: BookOpen, label: 'Cursos', href: '/cursos' },
  { icon: Users, label: 'Alunos', href: '/alunos' },
  { icon: Calendar, label: 'Ciclos', href: '/ciclos' },
  { icon: GraduationCap, label: 'Matrículas', href: '/matriculas' },
  { icon: ClipboardCheck, label: 'Lançamento de Notas', href: '/lancamento-notas' },
  { icon: FileText, label: 'Importação', href: '/importacao' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-zinc-900 text-white flex flex-col border-r border-zinc-800">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800">
        <Logo showText={false} />
        <span className="font-bold text-lg tracking-tight">iRede Acadêmico</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive 
                  ? "bg-emerald-600 text-white" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
            MR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Marcus Rodrigues</p>
            <p className="text-xs text-zinc-500 truncate">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

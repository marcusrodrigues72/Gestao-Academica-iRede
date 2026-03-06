'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ClipboardList,
  BarChart3, 
  Settings, 
  GraduationCap,
  LogOut,
  ChevronRight,
  Bell,
  Search,
  FileSpreadsheet,
  UserCog
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!mounted) {
    return <aside className="w-64 bg-white h-screen border-r border-slate-200" />;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Início', href: '/', roles: ['administrador', 'gestor', 'professor', 'mentor'] },
    { icon: Users, label: 'Alunos', href: '/alunos', roles: ['administrador', 'gestor', 'professor', 'mentor'] },
    { icon: ClipboardList, label: 'Lançamento de Notas', href: '/lancamento-notas', roles: ['administrador', 'gestor', 'professor', 'mentor'] },
    { icon: BookOpen, label: 'Cursos', href: '/cursos', roles: ['administrador', 'gestor'] },
    { icon: ClipboardList, label: 'Matrículas', href: '/matriculas', roles: ['administrador', 'gestor'] },
    { icon: FileSpreadsheet, label: 'Importação', href: '/importacao', roles: ['administrador', 'gestor'] },
    { icon: BarChart3, label: 'Relatórios', href: '/relatorios', roles: ['administrador', 'gestor'] },
    { icon: Settings, label: 'Configurações', href: '/configuracoes', roles: ['administrador', 'gestor'] },
  ];

  const filteredItems = menuItems.filter(item => !user || item.roles.includes(user.role));

  return (
    <aside className="w-64 bg-white text-slate-900 h-screen sticky top-0 flex flex-col border-r border-slate-200">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-900">Gestão Acadêmica</h1>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Cursos de Extensão</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary")} />
              <span className="font-bold text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
          <div 
            className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden bg-cover bg-center border-2 border-white shadow-sm"
            style={{ backgroundImage: user?.avatar ? `url('${user.avatar}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nome || 'User')}')` }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate text-slate-900">{user?.nome || 'Carregando...'}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-black">{user?.role || '...'}</p>
          </div>
          <button onClick={handleLogout} className="p-1 hover:bg-rose-50 rounded-lg transition-colors">
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-20 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar aluno ou curso..." 
            className="bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-accent/50 transition-all"
          />
        </div>
        
        <button className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ClipboardList, 
  Settings, 
  FileUp,
  Calendar,
  UserPlus,
  TrendingUp,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

const modules = [
  {
    title: 'Alunos',
    description: 'Gestão de cadastro e prontuário de alunos',
    icon: Users,
    href: '/alunos',
    color: 'bg-blue-500',
  },
  {
    title: 'Cursos',
    description: 'Configuração de cursos e matrizes curriculares',
    icon: BookOpen,
    href: '/cursos',
    color: 'bg-emerald-500',
  },
  {
    title: 'Matrículas',
    description: 'Processo de enturmação e matrículas',
    icon: UserPlus,
    href: '/matriculas',
    color: 'bg-violet-500',
  },
  {
    title: 'Ciclos',
    description: 'Gestão de períodos letivos e semestres',
    icon: Calendar,
    href: '/ciclos',
    color: 'bg-orange-500',
  },
  {
    title: 'Lançamento de Notas',
    description: 'Registro de avaliações e frequências',
    icon: GraduationCap,
    href: '/lancamento-notas',
    color: 'bg-rose-500',
  },
  {
    title: 'Importação',
    description: 'Carga de dados via planilhas Excel/CSV',
    icon: FileUp,
    href: '/importacao',
    color: 'bg-amber-500',
  },
  {
    title: 'Relatórios',
    description: 'Emissão de documentos e estatísticas',
    icon: ClipboardList,
    href: '/relatorios',
    color: 'bg-indigo-500',
  },
  {
    title: 'Configurações',
    description: 'Parâmetros do sistema e usuários',
    icon: Settings,
    href: '/configuracoes',
    color: 'bg-slate-500',
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {
    totalStudents: 0,
    totalCourses: 0,
    totalCycles: 0,
    totalEnrollments: 0
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black tracking-tight text-slate-900 mb-2"
          >
            Sistema de Gestão Escolar
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 text-lg font-medium"
          >
            Bem-vindo ao painel de controle acadêmico.
          </motion.p>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Activity size={18} />
            <span className="text-xs font-black uppercase tracking-widest">Sistema Online</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((module, index) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={module.href}
              className="group relative block p-6 bg-white rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1 hover:border-primary/20 overflow-hidden"
            >
              <div className={`inline-flex p-3 rounded-2xl ${module.color} text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-current/20`}>
                <module.icon size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-1 tracking-tight">
                {module.title}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {module.description}
              </p>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 text-slate-900 transition-opacity">
                 <module.icon size={80} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <section className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
              <TrendingUp className="text-blue-500" />
              Ciclos Recentes
            </h2>
            <Link href="/ciclos" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
              Ver Todos
            </Link>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />
              ))
            ) : data?.recentCycles?.length > 0 ? (
              data.recentCycles.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group">
                  <div className="text-center min-w-[60px] p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                    <span className="block text-[10px] font-black uppercase text-slate-400">{item.ano}</span>
                    <span className="text-lg font-black text-slate-900">{item.semestre}º S</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{item.nome_ciclo}</h4>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.nome_curso}</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-500">
                    {item.status}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400 italic text-sm">
                Nenhum ciclo recente encontrado.
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-2xl shadow-slate-900/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="relative z-10">
            <h2 className="text-xl font-black mb-2 tracking-tight">Resumo Rápido</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Dados consolidados</p>
            
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                  <span className="text-slate-400">Alunos Ativos</span>
                  <span className="text-white">{stats.totalStudents}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    className="h-full bg-blue-500" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                  <span className="text-slate-400">Cursos Ativos</span>
                  <span className="text-white">{stats.totalCourses}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '62%' }}
                    className="h-full bg-emerald-500" 
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-black uppercase tracking-widest mb-3">
                  <span className="text-slate-400">Matrículas</span>
                  <span className="text-white">{stats.totalEnrollments}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    className="h-full bg-violet-500" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Link 
            href="/relatorios"
            className="mt-12 w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all text-center shadow-xl shadow-white/10 active:scale-95"
          >
            VER RELATÓRIO COMPLETO
          </Link>
        </div>
      </section>
    </main>
  );
}

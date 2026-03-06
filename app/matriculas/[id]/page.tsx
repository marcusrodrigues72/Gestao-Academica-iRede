'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight, 
  Share2, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  Star, 
  BarChart3, 
  PieChart,
  ArrowLeft,
  Edit2
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function EnrollmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [enrollment, setEnrollment] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const response = await fetch(`/api/enrollments/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEnrollment(data);
        } else {
          alert('Matrícula não encontrada.');
          router.push('/matriculas');
        }
      } catch (error) {
        console.error('Failed to fetch enrollment:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEnrollment();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (!enrollment) return null;
  
  const homeroProgress = enrollment.indicators?.find((i: any) => i.platform?.toUpperCase() === 'HOMERO' && i.category?.toLowerCase() === 'progresso')?.numericValue || enrollment.progress || 0;
  const classroomProgress = enrollment.indicators?.find((i: any) => i.platform?.toUpperCase() === 'CLASSROOM' && i.category?.toLowerCase() === 'progresso')?.numericValue || 90;

  const academicIndicators = enrollment.indicators?.filter((i: any) => i.category === 'Acadêmico') || [];
  const frequencyIndicators = enrollment.indicators?.filter((i: any) => i.category === 'Frequência') || [];
  const engagementIndicators = enrollment.indicators?.filter((i: any) => i.category === 'Engajamento') || [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Indicadores de Matrícula" 
          subtitle={`João Silva | Curso: ${enrollment.courseName}`} 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1200px] mx-auto space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/matriculas')} className="hover:text-primary transition-colors">Matrículas</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-bold">Indicadores Detalhados</span>
            </nav>

            {/* Header Title Section */}
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Indicadores de Matrícula</h1>
                <div className="flex items-center gap-3 mt-4">
                  <span className={cn(
                    "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    enrollment.status === 'Ativo' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {enrollment.status}
                  </span>
                  <p className="text-slate-600 text-lg font-bold">
                    {enrollment.studentName} | <span className="text-slate-400 font-medium">Curso: {enrollment.courseName}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => router.push(`/matriculas/${id}/edit`)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Edit2 className="w-4 h-4" /> Editar Indicadores
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:brightness-110 transition-all shadow-xl shadow-primary/20">
                  <FileText className="w-4 h-4" /> Exportar PDF
                </button>
              </div>
            </div>

            {/* Resumo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-emerald-600 text-xs font-black bg-emerald-50 px-3 py-1 rounded-full">+2.4%</span>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Frequência Geral</p>
                <h3 className="text-slate-900 text-4xl font-black mt-2 tracking-tight">{enrollment.frequency ?? 0}%</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-blue-600 text-xs font-black bg-blue-50 px-3 py-1 rounded-full">Hoje</span>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Último Acesso</p>
                <h3 className="text-slate-900 text-4xl font-black mt-2 tracking-tight">{enrollment.lastAccess || '15/10/2023'}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-purple-100 rounded-2xl text-purple-600">
                    <Star className="w-6 h-6" />
                  </div>
                  <span className="text-emerald-600 text-xs font-black bg-emerald-50 px-3 py-1 rounded-full">+0.5</span>
                </div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Média Atual</p>
                <h3 className="text-slate-900 text-4xl font-black mt-2 tracking-tight">{(enrollment.grade ?? 0).toFixed(1)}</h3>
              </div>
            </div>

            {/* Main Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Notas por Unidade/Tópico */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-slate-900 text-xl font-black mb-8 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-primary" /> Notas por Unidade/Tópico
                </h2>
                <div className="space-y-8">
                  {enrollment.modules && enrollment.modules.length > 0 ? (
                    enrollment.modules.map((module: any, i: number) => (
                      <div key={module.id}>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-slate-600 font-bold">{module.title}</span>
                          <span className="text-slate-900 font-black">{(module.grade || 0).toFixed(1)}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(module.grade || 0) * 10}%` }}
                            transition={{ duration: 1, delay: i * 0.1 }}
                            className="bg-primary h-full rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 font-medium italic">
                      Nenhum módulo cadastrado para este curso.
                    </div>
                  )}
                </div>
              </div>

              {/* Progresso por Plataforma */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h2 className="text-slate-900 text-xl font-black mb-8 flex items-center gap-3">
                  <PieChart className="w-6 h-6 text-primary" /> Progresso por Plataforma
                </h2>
                <div className="grid grid-cols-2 gap-12 pt-4">
                  <div className="flex flex-col items-center">
                    <div className="relative size-40 flex items-center justify-center">
                      <svg className="size-full transform -rotate-90">
                        <circle className="text-slate-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                        <motion.circle 
                          initial={{ strokeDashoffset: 440 }}
                          animate={{ strokeDashoffset: 440 - (440 * (homeroProgress / 100)) }}
                          transition={{ duration: 1.5 }}
                          className="text-primary" 
                          cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeWidth="12" strokeLinecap="round"
                        ></motion.circle>
                      </svg>
                      <span className="absolute text-3xl font-black text-slate-900">{homeroProgress}%</span>
                    </div>
                    <p className="mt-6 font-black text-slate-900 uppercase tracking-tight">Plataforma Homero</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LMS Interno</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative size-40 flex items-center justify-center">
                      <svg className="size-full transform -rotate-90">
                        <circle className="text-slate-100" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                        <motion.circle 
                          initial={{ strokeDashoffset: 440 }}
                          animate={{ strokeDashoffset: 440 - (440 * (classroomProgress / 100)) }}
                          transition={{ duration: 1.5 }}
                          className="text-emerald-500" 
                          cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeWidth="12" strokeLinecap="round"
                        ></motion.circle>
                      </svg>
                      <span className="absolute text-3xl font-black text-slate-900">{classroomProgress}%</span>
                    </div>
                    <p className="mt-6 font-black text-slate-900 uppercase tracking-tight">Google Classroom</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repositório de Atividades</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Dados Brutos */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-slate-900 font-black uppercase tracking-tight">Detalhamento de Indicadores (Raw Data)</h2>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TABLE: INDICADORES_MATRICULA</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                      <th className="px-8 py-5">Categoria</th>
                      <th className="px-8 py-5">Subcategoria</th>
                      <th className="px-8 py-5">Plataforma</th>
                      <th className="px-8 py-5">Valor</th>
                      <th className="px-8 py-5 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* General Indicators */}
                    {enrollment.indicators && enrollment.indicators.map((row: any, i: number) => (
                      <tr key={`ind-${i}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-900">{row.category}</td>
                        <td className="px-8 py-5 text-sm text-slate-600 font-medium">{row.subcategory || 'Geral'}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">{row.platform || 'N/A'}</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-slate-900">
                          {row.numericValue !== null ? row.numericValue : row.textValue}
                          {(row.category?.toLowerCase() === 'progresso' || row.category?.toLowerCase() === 'frequência') ? '%' : ''}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => router.push(`/matriculas/${id}/edit`)}
                            className="p-2 text-slate-300 hover:text-primary transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* Module Indicators */}
                    {enrollment.modules && enrollment.modules.map((mod: any, i: number) => (
                      <tr key={`mod-${i}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-900">Acadêmico</td>
                        <td className="px-8 py-5 text-sm text-slate-600 font-medium">{mod.title}</td>
                        <td className="px-8 py-5">
                          <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-widest">{mod.platform || 'HOMERO'}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900">Nota: {(mod.grade || 0).toFixed(1)}</span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono">Freq: {(mod.frequency || 0)}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => router.push(`/matriculas/${id}/edit`)}
                            className="p-2 text-slate-300 hover:text-primary transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {(!enrollment.indicators || enrollment.indicators.length === 0) && (!enrollment.modules || enrollment.modules.length === 0) && (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-slate-400 italic">Nenhum indicador ou módulo encontrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

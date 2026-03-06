'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  Users, 
  CheckCircle2, 
  LogOut, 
  TrendingUp, 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  BarChart2,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function EnrollmentsPage() {
  const router = useRouter();
  const [enrollments, setEnrollments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterStatus, setFilterStatus] = React.useState('Todos os Status');
  const [filterOffer, setFilterOffer] = React.useState('Todas as Ofertas');
  const [filterSituation, setFilterSituation] = React.useState('Qualquer Situação');
  const [offers, setOffers] = React.useState<any[]>([]);

  const fetchEnrollments = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'Todos os Status') params.append('status', filterStatus);
      if (filterOffer !== 'Todas as Ofertas') params.append('ofertaId', filterOffer);
      if (filterSituation !== 'Qualquer Situação') params.append('situacao', filterSituation);

      const response = await fetch(`/api/enrollments?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterOffer, filterSituation]);

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers');
      if (response.ok) {
        const data = await response.json();
        setOffers(data);
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    }
  };

  React.useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  React.useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta matrícula?')) return;
    
    try {
      const response = await fetch(`/api/enrollments/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchEnrollments();
      }
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
    }
  };

  const stats = [
    { label: 'Total Matrículas', value: enrollments.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Matrículas Ativas', value: enrollments.filter(e => e.status === 'Ativo').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Evasão (Mês)', value: '12%', icon: LogOut, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Frequência Média', value: '82.4%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestão de Matrículas" 
          subtitle="Administre e monitore as matrículas dos cursos de extensão universitária." 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1440px] mx-auto space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Matrículas</h1>
                <p className="text-slate-500 mt-1">Administre e monitore as matrículas dos cursos de extensão universitária.</p>
              </div>
              <button 
                onClick={() => router.push('/matriculas/novo')}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-xl shadow-primary/20 transition-all"
              >
                <Plus className="w-5 h-5" /> Nova Matrícula
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Matrícula</label>
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>Todos os Status</option>
                    <option>Ativo</option>
                    <option>Evadido</option>
                    <option>Concluído</option>
                    <option>Trancado</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Oferta / Curso</label>
                  <select 
                    value={filterOffer}
                    onChange={(e) => setFilterOffer(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>Todas as Ofertas</option>
                    {offers.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Situação Final</label>
                  <select 
                    value={filterSituation}
                    onChange={(e) => setFilterSituation(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option>Qualquer Situação</option>
                    <option>Aprovado</option>
                    <option>Reprovado por Nota</option>
                    <option>Reprovado por Falta</option>
                    <option>Em andamento</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setFilterStatus('Todos os Status');
                      setFilterOffer('Todas as Ofertas');
                      setFilterSituation('Qualquer Situação');
                    }}
                    className="flex-1 bg-slate-100 text-slate-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Limpar
                  </button>
                  <button 
                    onClick={fetchEnrollments}
                    className="flex-1 bg-primary/10 text-primary px-4 py-3 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all"
                  >
                    Filtrar
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrícula ID</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Oferta/Curso</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Frequência (%)</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Nota Final</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Progresso</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-20 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-sm text-slate-400 mt-4 font-bold">Carregando matrículas...</p>
                        </td>
                      </tr>
                    ) : enrollments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-20 text-center">
                          <p className="text-sm text-slate-400 font-bold">Nenhuma matrícula encontrada.</p>
                        </td>
                      </tr>
                    ) : (
                      enrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5 text-xs font-mono font-bold text-slate-400">#{enrollment.id.slice(0, 8).toUpperCase()}</td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900">{enrollment.studentName}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID: {enrollment.studentExternalId || enrollment.studentId.slice(0, 5)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-900">{enrollment.courseName}</span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">{enrollment.program}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">{enrollment.project}</span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{enrollment.cycle} - {enrollment.year}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                              enrollment.status === 'Ativo' ? "bg-emerald-100 text-emerald-600" :
                              enrollment.status === 'Concluído' ? "bg-blue-100 text-blue-600" :
                              enrollment.status === 'Evadido' ? "bg-rose-100 text-rose-600" :
                              "bg-amber-100 text-amber-600"
                            )}>
                              <span className={cn(
                                "w-1.5 h-1.5 rounded-full mr-2",
                                enrollment.status === 'Ativo' ? "bg-emerald-500" :
                                enrollment.status === 'Concluído' ? "bg-blue-500" :
                                enrollment.status === 'Evadido' ? "bg-rose-500" :
                                "bg-amber-500"
                              )}></span>
                              {enrollment.status}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-sm font-black text-slate-900 text-center">{enrollment.frequency || 0}%</td>
                          <td className="px-6 py-5 text-sm font-black text-slate-900 text-center">{enrollment.grade || '-'}</td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3 w-32">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full transition-all duration-500",
                                    enrollment.progress >= 80 ? "bg-emerald-500" : enrollment.progress >= 50 ? "bg-primary" : "bg-amber-500"
                                  )} 
                                  style={{ width: `${enrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] font-black text-slate-400">{enrollment.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => router.push(`/matriculas/${enrollment.id}`)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                title="Ver Indicadores"
                              >
                                <BarChart2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDelete(enrollment.id)}
                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Exibindo {enrollments.length} resultados
                </p>
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition-all">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20">1</button>
                  <button className="px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-400 text-xs font-black transition-all">2</button>
                  <button className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-400 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4"
                >
                  <div className={cn("size-14 rounded-2xl flex items-center justify-center shadow-sm", stat.bg, stat.color)}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

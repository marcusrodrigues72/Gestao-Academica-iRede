'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Star,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [filters, setFilters] = React.useState({
    programa: 'Todos',
    ciclo: '2024.1',
    curso: 'Todos'
  });

  const fetchDashboardData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`/api/dashboard?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  const stats = [
    { label: 'Total de Alunos', value: data?.stats?.totalStudents || 0, trend: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: 'Cursos em Andamento', value: data?.stats?.activeEnrollments || 0, trend: 'Ativos', icon: BookOpen, color: 'bg-indigo-500' },
    { label: 'Taxa de Retenção', value: '87.4%', trend: 'Meta: 85%', icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Desempenho Médio', value: data?.stats?.avgGrade ? (data.stats.avgGrade).toFixed(1) : '0.0', trend: '+0.4', icon: Star, color: 'bg-amber-500' },
  ];

  // Map region data calculation
  const regions = [
    { name: 'Região Sudeste', states: ['SP', 'RJ', 'MG', 'ES'] },
    { name: 'Região Nordeste', states: ['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'MA', 'PI'] },
    { name: 'Região Sul', states: ['PR', 'SC', 'RS'] },
    { name: 'Região Centro-Oeste', states: ['DF', 'GO', 'MT', 'MS'] },
    { name: 'Região Norte', states: ['AM', 'PA', 'AC', 'RO', 'RR', 'AP', 'TO'] },
  ];

  const regionData = regions.map(region => {
    const count = data?.geoDist?.filter((d: any) => region.states.includes(d.state))
      .reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
    const total = data?.stats?.totalStudents || 1;
    return {
      name: region.name,
      count,
      percent: Math.round((count / total) * 100)
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Dashboard de Engajamento e Alcance Geográfico" 
          subtitle="Análise de tecnologias emergentes e distribuição territorial de alunos." 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Filters Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
              <div className="flex items-center gap-3 w-full xl:w-auto">
                <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex-1 xl:flex-none">
                  <div className="relative">
                    <select 
                      value={filters.programa}
                      onChange={(e) => handleFilterChange('programa', e.target.value)}
                      className="text-sm border-none bg-transparent rounded-lg focus:ring-0 cursor-pointer min-w-[140px] appearance-none pr-8 py-1.5 font-medium text-slate-700"
                    >
                      <option value="Todos">Programa: Todos</option>
                      {data?.filterOptions?.programs.map((p: string) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-slate-200 self-center"></div>
                  <div className="relative">
                    <select 
                      value={filters.ciclo}
                      onChange={(e) => handleFilterChange('ciclo', e.target.value)}
                      className="text-sm border-none bg-transparent rounded-lg focus:ring-0 cursor-pointer min-w-[140px] appearance-none pr-8 py-1.5 font-medium text-slate-700"
                    >
                      <option value="Todos">Ciclo: Todos</option>
                      {data?.filterOptions?.cycles.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-slate-200 self-center"></div>
                  <div className="relative">
                    <select 
                      value={filters.curso}
                      onChange={(e) => handleFilterChange('curso', e.target.value)}
                      className="text-sm border-none bg-transparent rounded-lg focus:ring-0 cursor-pointer min-w-[160px] appearance-none pr-8 py-1.5 font-medium text-slate-700"
                    >
                      <option value="Todos">Curso: Todos</option>
                      {data?.filterOptions?.courses.map((c: string) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(stat.color, "p-2.5 rounded-xl text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform")}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-1 rounded-full border uppercase tracking-widest",
                      stat.trend.includes('+') ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                    )}>
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">
                    {stat.label === 'Desempenho Médio' ? `${stat.value}/10` : stat.value}
                  </h3>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Engagement Chart */}
              <div className="lg:col-span-8 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="font-black text-lg text-slate-900 tracking-tight">Taxa de Engajamento por Tecnologia</h4>
                      <p className="text-xs text-slate-500">Volume de alunos capacitados por trilha tecnológica</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm bg-accent" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos Capacitados</span>
                    </div>
                  </div>
                  
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={data?.engagementByTech || []}
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="tech" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                          width={120}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                          {data?.engagementByTech?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill="#137fec" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h4 className="font-black text-lg text-slate-900 tracking-tight">Distribuição Geográfica de Alunos</h4>
                      <p className="text-xs text-slate-500">Densidade de matrículas por região (Mapa de Calor)</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Baixa</span>
                        <div className="flex h-2 w-20 bg-gradient-to-r from-blue-100 via-blue-500 to-blue-900 rounded-sm mx-1"></div>
                        <span>Alta</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                    <div className="md:col-span-7 relative aspect-[4/3] bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center p-6">
                      {/* Simplified Brazil SVG Map with Heat Circles */}
                      <svg viewBox="0 0 500 500" className="w-full h-full opacity-20 grayscale">
                        <path d="M150,50 L350,50 L450,150 L450,350 L350,450 L150,450 L50,350 L50,150 Z" fill="#cbd5e1" />
                      </svg>
                      
                      {/* Heat Circles based on data */}
                      <AnimatePresence>
                        {data?.geoDist?.map((point: any, i: number) => {
                          // Mock coordinates for states for visualization
                          const coords: any = {
                            'SP': { t: '70%', l: '65%' },
                            'RJ': { t: '75%', l: '72%' },
                            'MG': { t: '60%', l: '68%' },
                            'BA': { t: '45%', l: '78%' },
                            'PE': { t: '38%', l: '82%' },
                            'CE': { t: '30%', l: '78%' },
                            'AM': { t: '30%', l: '30%' },
                            'PR': { t: '80%', l: '58%' },
                            'RS': { t: '90%', l: '55%' },
                            'PA': { t: '35%', l: '50%' },
                          };
                          const pos = coords[point.state] || { t: '50%', l: '50%' };
                          const size = Math.min(60, 20 + (point.count * 5));
                          const opacity = Math.min(0.6, 0.2 + (point.count / 10));
                          
                          return (
                            <motion.div
                              key={point.city + i}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="absolute rounded-full bg-blue-600 blur-xl pointer-events-none"
                              style={{ 
                                top: pos.t, 
                                left: pos.l, 
                                width: size, 
                                height: size,
                                opacity: opacity
                              }}
                            />
                          );
                        })}
                      </AnimatePresence>
                      
                      {/* State Labels */}
                      {['SP', 'RJ', 'MG', 'BA', 'AM', 'PE', 'CE'].map(state => {
                        const coords: any = {
                          'SP': { t: '72%', l: '67%' },
                          'RJ': { t: '77%', l: '74%' },
                          'MG': { t: '62%', l: '70%' },
                          'BA': { t: '47%', l: '80%' },
                          'AM': { t: '32%', l: '32%' },
                          'PE': { t: '40%', l: '84%' },
                          'CE': { t: '32%', l: '80%' },
                        };
                        const pos = coords[state];
                        return (
                          <div key={state} className="absolute text-[10px] font-black text-slate-600" style={{ top: pos.t, left: pos.l }}>
                            {state}
                          </div>
                        );
                      })}
                    </div>

                    <div className="md:col-span-5 space-y-4">
                      {regionData.map((region, i) => (
                        <div key={region.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{region.name}</p>
                          <div className="flex items-end gap-2 mt-1">
                            <p className="text-2xl font-black text-slate-900">{region.percent}%</p>
                            <p className="text-[10px] text-slate-400 font-bold mb-1">({region.count} alunos)</p>
                          </div>
                          <div className="w-full h-1 bg-slate-200 rounded-full mt-3 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${region.percent}%` }}
                              className="h-full bg-accent rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                      <button className="w-full text-center text-[10px] font-black text-accent uppercase tracking-widest hover:underline mt-4">
                        Detalhamento por Cidade →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-sm ring-1 ring-rose-50/50">
                  <div className="flex items-center gap-3 mb-8 text-rose-600">
                    <div className="p-2 bg-rose-50 rounded-xl">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <h4 className="font-black text-lg tracking-tight">Alertas de Desempenho</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {data?.alerts?.map((alert: any, i: number) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-black text-slate-900">{alert.name}</span>
                          <span className={cn(
                            "text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest",
                            alert.grade < 5 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                          )}>
                            {alert.grade < 5 ? `Nota: ${alert.grade.toFixed(1)}` : `Freq: ${alert.frequency}%`}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mb-4">{alert.course}</p>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full transition-all duration-1000", alert.grade < 5 ? "bg-rose-500" : "bg-amber-500")} 
                            style={{ width: `${alert.grade < 5 ? (alert.grade/10)*100 : alert.frequency}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                    {(!data?.alerts || data.alerts.length === 0) && (
                      <div className="text-center py-10">
                        <p className="text-sm text-slate-400 font-medium">Nenhum alerta crítico no momento.</p>
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full mt-8 py-4 text-[10px] font-black text-rose-600 border-2 border-rose-100 rounded-2xl hover:bg-rose-50 transition-all uppercase tracking-widest">
                    Ver Todos os Alertas
                  </button>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="font-black text-lg text-slate-900 tracking-tight">Atividade Recente</h4>
                    <button className="text-[10px] text-accent font-black uppercase tracking-widest hover:underline">Ver Tudo</button>
                  </div>
                  
                  <div className="space-y-8">
                    {data?.recentActivity?.map((act: any, i: number) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="relative shrink-0">
                          <div 
                            className="size-12 rounded-2xl bg-slate-100 bg-cover bg-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform" 
                            style={{ backgroundImage: `url('${act.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(act.user || 'User')}`}')` }} 
                          />
                          <div className="absolute -bottom-1 -right-1 size-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                            <ArrowUpRight className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{act.user}</p>
                          <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {act.action} <span className="text-slate-900 font-bold">{act.target}</span>
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(act.time).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!data?.recentActivity || data.recentActivity.length === 0) && (
                      <div className="text-center py-10">
                        <p className="text-sm text-slate-400 font-medium">Nenhuma atividade recente encontrada.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

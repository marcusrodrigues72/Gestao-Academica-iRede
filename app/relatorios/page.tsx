'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ReportsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Relatórios & Analytics" 
          subtitle="Análise profunda de dados acadêmicos e operacionais" 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Crescimento Mensal', value: '+14.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Taxa de Evasão', value: '3.1%', icon: ArrowDownRight, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Novas Matrículas', value: '128', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className={stat.bg + " p-3 rounded-2xl"}>
                      <stat.icon className={"w-6 h-6 " + stat.color} />
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Main Report Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <BarChart3 className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Gráfico de Evolução Acadêmica</h3>
                <p className="text-sm text-slate-500 max-w-md mt-2">
                  Esta seção exibirá gráficos detalhados de desempenho por turma e período letivo.
                </p>
                <button className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
                  Gerar Relatório Completo
                </button>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-accent" /> Distribuição
                  </h4>
                  <div className="space-y-6">
                    {[
                      { label: 'Graduação', value: '65%', color: 'bg-accent' },
                      { label: 'Pós-Graduação', value: '25%', color: 'bg-indigo-500' },
                      { label: 'Extensão', value: '10%', color: 'bg-emerald-500' },
                    ].map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="text-slate-900">{item.value}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={item.color + " h-full"} style={{ width: item.value }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-900/20">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-6 h-6 text-accent" />
                    <h4 className="font-black text-lg">Insights IA</h4>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Com base nos dados atuais, prevemos um aumento de <span className="text-white font-bold">12%</span> nas matrículas para o próximo semestre.
                  </p>
                  <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] transition-all">
                    Ver Análise Preditiva
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  Filter, 
  MoreVertical,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { Sidebar, TopBar } from "@/components/layout-components";
import { useToast } from "@/hooks/use-toast";

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchAlunos = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alunos');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAlunos(data);
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Falha ao carregar a lista de alunos.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAlunos();
  }, [fetchAlunos]);

  const filteredAlunos = alunos.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.cpf.includes(searchTerm)
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestão de Alunos" 
          subtitle="Visualize e gerencie o cadastro de todos os alunos do sistema." 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar por nome ou CPF..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4" />
                  Novo Aluno
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Cadastro</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-100 rounded-lg" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded-lg" /></td>
                          <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded-lg" /></td>
                          <td className="px-6 py-4"><div className="h-8 w-8 bg-slate-100 rounded-full ml-auto" /></td>
                        </tr>
                      ))
                    ) : filteredAlunos.length > 0 ? (
                      filteredAlunos.map((aluno, index) => (
                        <motion.tr 
                          key={aluno.aluno_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                {aluno.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{aluno.nome}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{aluno.sexo_genero || 'Gênero não inf.'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-mono text-sm">{aluno.cpf}</td>
                          <td className="px-6 py-4 text-slate-500 text-sm">
                            {new Date(aluno.data_cadastro).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic text-sm">
                          Nenhum aluno encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total: {filteredAlunos.length} alunos
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-600 shadow-sm">1</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

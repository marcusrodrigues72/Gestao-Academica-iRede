"use client";

import * as React from "react";
import { Sidebar, TopBar } from "@/components/layout-components";
import { 
  Layers, 
  Plus, 
  Calendar, 
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/hooks/use-toast";

export default function CiclosPage() {
  const [ciclos, setCiclos] = React.useState<any[]>([]);
  const [cursos, setCursos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    curso_id: "",
    nome_ciclo: "",
    ano: new Date().getFullYear(),
    semestre: 1,
    data_inicio: "",
    data_fim: ""
  });
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ciclosRes, cursosRes] = await Promise.all([
        fetch('/api/ciclos'),
        fetch('/api/cursos')
      ]);
      const ciclosData = await ciclosRes.json();
      const cursosData = await cursosRes.json();
      setCiclos(ciclosData);
      setCursos(cursosData);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    setMounted(true);
    fetchData();
  }, [fetchData]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ciclos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast({ title: "Sucesso", description: "Ciclo criado com sucesso!" });
        setShowModal(false);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao criar ciclo.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Gestão de Ciclos" subtitle="Organize seus cursos em períodos de execução." />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar ciclos..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Novo Ciclo
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome do Ciclo</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso Relacionado</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Período</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ciclos.map((ciclo) => (
                    <tr key={ciclo.ciclo_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Layers className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{ciclo.nome_ciclo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm text-slate-600 font-medium">{ciclo.nome_curso}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs text-slate-500 font-bold">{ciclo.ano}.{ciclo.semestre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
                          {ciclo.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {ciclos.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                        Nenhum ciclo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <h3 className="text-xl font-black text-slate-900 mb-6">Novo Ciclo de Execução</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Curso</label>
                      <select 
                        required
                        value={formData.curso_id}
                        onChange={(e) => setFormData({...formData, curso_id: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="">Selecione um curso</option>
                        {cursos.map(c => <option key={c.curso_id} value={c.curso_id}>{c.nome_curso}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Ciclo</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Ciclo 1 - 2024"
                        value={formData.nome_ciclo}
                        onChange={(e) => setFormData({...formData, nome_ciclo: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ano</label>
                        <input 
                          required
                          type="number" 
                          value={formData.ano}
                          onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Semestre</label>
                        <select 
                          value={formData.semestre}
                          onChange={(e) => setFormData({...formData, semestre: parseInt(e.target.value)})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value={1}>1º Semestre</option>
                          <option value={2}>2º Semestre</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Início</label>
                        <input 
                          type="date" 
                          value={formData.data_inicio}
                          onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data Fim</label>
                        <input 
                          type="date" 
                          value={formData.data_fim}
                          onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <button 
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                      >
                        Criar Ciclo
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

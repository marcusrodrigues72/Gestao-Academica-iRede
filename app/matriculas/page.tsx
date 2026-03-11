"use client";

import * as React from "react";
import { Sidebar, TopBar } from "@/components/layout-components";
import { 
  FileText, 
  Plus, 
  Search, 
  User, 
  Layers,
  BookOpen,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/hooks/use-toast";

export default function MatriculasPage() {
  const [matriculas, setMatriculas] = React.useState<any[]>([]);
  const [alunos, setAlunos] = React.useState<any[]>([]);
  const [ciclos, setCiclos] = React.useState<any[]>([]);
  const [ofertas, setOfertas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    aluno_id: "",
    ciclo_id: "",
    oferta_id: "",
    status_matricula: "ativo"
  });
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [matRes, alRes, cicRes] = await Promise.all([
        fetch('/api/matriculas'),
        fetch('/api/alunos'),
        fetch('/api/ciclos')
      ]);
      setMatriculas(await matRes.json());
      setAlunos(await alRes.json());
      setCiclos(await cicRes.json());
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar dados.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (formData.ciclo_id) {
      fetch(`/api/ofertas?ciclo_id=${formData.ciclo_id}`)
        .then(res => res.json())
        .then(setOfertas);
    } else {
      setOfertas([]);
    }
  }, [formData.ciclo_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: formData.aluno_id,
          oferta_id: formData.oferta_id,
          status_matricula: formData.status_matricula
        })
      });
      if (res.ok) {
        toast({ title: "Sucesso", description: "Matrícula realizada com sucesso!" });
        setShowModal(false);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao realizar matrícula.", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Gestão de Matrículas" subtitle="Vincule alunos a ciclos e turmas específicas." />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="flex justify-between items-center">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar matrículas..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                Nova Matrícula
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ciclo / Curso</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Turma</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {matriculas.map((mat) => (
                    <tr key={mat.matricula_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                            {mat.aluno_nome.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{mat.aluno_nome}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{mat.aluno_cpf}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-slate-700">{mat.nome_ciclo}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{mat.nome_curso}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                          {mat.turma}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                          {mat.status_matricula}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(mat.criado_em).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
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
                  <h3 className="text-xl font-black text-slate-900 mb-6">Nova Matrícula</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Aluno</label>
                      <select 
                        required
                        value={formData.aluno_id}
                        onChange={(e) => setFormData({...formData, aluno_id: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="">Selecione um aluno</option>
                        {alunos.map(a => <option key={a.aluno_id} value={a.aluno_id}>{a.nome} ({a.cpf})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ciclo</label>
                      <select 
                        required
                        value={formData.ciclo_id}
                        onChange={(e) => setFormData({...formData, ciclo_id: e.target.value, oferta_id: ""})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      >
                        <option value="">Selecione um ciclo</option>
                        {ciclos.map(c => <option key={c.ciclo_id} value={c.ciclo_id}>{c.nome_ciclo} - {c.nome_curso}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Turma</label>
                      <select 
                        required
                        disabled={!formData.ciclo_id}
                        value={formData.oferta_id}
                        onChange={(e) => setFormData({...formData, oferta_id: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                      >
                        <option value="">Selecione uma turma</option>
                        {ofertas.map(o => <option key={o.oferta_id} value={o.oferta_id}>{o.turma} ({o.trilha || 'Geral'})</option>)}
                      </select>
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
                        Matricular Aluno
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

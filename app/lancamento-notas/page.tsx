"use client";

import * as React from "react";
import { Sidebar, TopBar } from "@/components/layout-components";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Save, 
  CheckCircle2,
  Layers,
  Users
} from "lucide-react";
import { motion } from "motion/react";
import { useToast } from "@/hooks/use-toast";

export default function LancamentoNotasPage() {
  const [ciclos, setCiclos] = React.useState<any[]>([]);
  const [ofertas, setOfertas] = React.useState<any[]>([]);
  const [matriculas, setMatriculas] = React.useState<any[]>([]);
  const [selectedCiclo, setSelectedCiclo] = React.useState("");
  const [selectedOferta, setSelectedOferta] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    setMounted(true);
    fetch('/api/ciclos').then(res => res.json()).then(setCiclos);
  }, []);

  React.useEffect(() => {
    if (selectedCiclo) {
      fetch(`/api/ofertas?ciclo_id=${selectedCiclo}`).then(res => res.json()).then(setOfertas);
    } else {
      setOfertas([]);
      setSelectedOferta("");
    }
  }, [selectedCiclo]);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  const handleFetchMatriculas = async () => {
    if (!selectedOferta) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/matriculas?oferta_id=${selectedOferta}`);
      setMatriculas(await res.json());
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar alunos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (id: string, field: string, value: string) => {
    setMatriculas(prev => prev.map(m => 
      m.matricula_id === id ? { ...m, [field]: value === "" ? null : parseFloat(value) } : m
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/matriculas/update-grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: matriculas })
      });
      if (res.ok) {
        toast({ title: "Sucesso", description: "Notas salvas com sucesso!" });
      } else {
        throw new Error();
      }
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao salvar notas.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Lançamento de Notas e Frequência" subtitle="Selecione o ciclo e a turma para lançar os resultados." />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Ciclo</label>
                <select 
                  value={selectedCiclo}
                  onChange={(e) => setSelectedCiclo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Selecione um ciclo</option>
                  {ciclos.map(c => <option key={c.ciclo_id} value={c.ciclo_id}>{c.nome_ciclo} - {c.nome_curso}</option>)}
                </select>
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Turma</label>
                <select 
                  disabled={!selectedCiclo}
                  value={selectedOferta}
                  onChange={(e) => setSelectedOferta(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                >
                  <option value="">Selecione uma turma</option>
                  {ofertas.map(o => <option key={o.oferta_id} value={o.oferta_id}>{o.turma}</option>)}
                </select>
              </div>
              <button 
                onClick={handleFetchMatriculas}
                disabled={!selectedOferta || loading}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? "Carregando..." : "Carregar Alunos"}
              </button>
            </div>

            {matriculas.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    <span className="font-black text-slate-900 uppercase tracking-tight">Lista de Alunos</span>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Nota Final</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Frequência (%)</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matriculas.map((mat) => (
                      <tr key={mat.matricula_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">{mat.aluno_nome}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-bold">{mat.aluno_cpf}</td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            step="0.1"
                            min="0"
                            max="10"
                            value={mat.nota_final ?? ""}
                            onChange={(e) => handleGradeChange(mat.matricula_id, 'nota_final', e.target.value)}
                            className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            type="number" 
                            step="1"
                            min="0"
                            max="100"
                            value={mat.frequencia_final ?? ""}
                            onChange={(e) => handleGradeChange(mat.matricula_id, 'frequencia_final', e.target.value)}
                            className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase">
                            {mat.status_matricula}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}

            {matriculas.length === 0 && !loading && selectedOferta && (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <p className="text-slate-400 text-sm italic">Nenhum aluno matriculado nesta turma.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight, 
  CheckCircle2, 
  ArrowLeft,
  Save,
  X,
  BarChart3,
  TrendingUp,
  Clock,
  User,
  BookOpen
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function EditEnrollmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [enrollment, setEnrollment] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    status: '',
    classification: '',
    finalSituation: '',
    frequency: 0,
    grade: 0,
    progress: 0,
    homeroProgress: 0,
    classroomProgress: 0,
    moduleGrades: [] as any[]
  });

  React.useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const response = await fetch(`/api/enrollments/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEnrollment(data);
          
          const hProg = data.indicators?.find((i: any) => i.platform?.toUpperCase() === 'HOMERO' && i.category?.toLowerCase() === 'progresso')?.numericValue || data.progress || 0;
          const cProg = data.indicators?.find((i: any) => i.platform?.toUpperCase() === 'CLASSROOM' && i.category?.toLowerCase() === 'progresso')?.numericValue || 90;

          setFormData({
            status: data.status || 'Ativo',
            classification: data.classification || 'Regular',
            finalSituation: data.finalSituation || 'Em andamento',
            frequency: data.frequency || 0,
            grade: data.grade || 0,
            progress: data.progress || 0,
            homeroProgress: hProg,
            classroomProgress: cProg,
            moduleGrades: data.modules?.map((m: any) => ({
              moduleId: m.id,
              title: m.title,
              grade: m.grade || 0,
              frequency: m.frequency || 0,
              platform: m.platform || 'Homero'
            })) || []
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Matrícula atualizada com sucesso!');
        router.push(`/matriculas/${id}`);
      } else {
        const err = await response.json();
        alert(`Erro ao atualizar matrícula: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to update enrollment:', error);
      alert('Erro ao atualizar matrícula.');
    } finally {
      setSaving(false);
    }
  };

  const handleModuleGradeChange = (moduleId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      moduleGrades: prev.moduleGrades.map(mg => 
        mg.moduleId === moduleId ? { ...mg, [field]: value } : mg
      )
    }));
  };

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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Editar Matrícula" 
          subtitle={`Ajuste os indicadores e notas de ${enrollment.studentName}`} 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/matriculas')} className="hover:text-primary transition-colors">Matrículas</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push(`/matriculas/${id}`)} className="hover:text-primary transition-colors">Indicadores</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-bold">Editar</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Matrícula</h1>
                <p className="text-slate-500 mt-1">
                  {enrollment.studentName} | <span className="font-bold text-slate-700">{enrollment.courseName}</span>
                </p>
              </div>
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Status e Situação */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Status e Situação</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status da Matrícula</label>
                        <select 
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Trancado">Trancado</option>
                          <option value="Cancelado">Cancelado</option>
                          <option value="Concluído">Concluído</option>
                          <option value="Evadido">Evadido</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Situação Final</label>
                        <select 
                          value={formData.finalSituation}
                          onChange={(e) => setFormData(prev => ({ ...prev, finalSituation: e.target.value }))}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                          <option value="Em andamento">Em andamento</option>
                          <option value="Aprovado">Aprovado</option>
                          <option value="Reprovado por Nota">Reprovado por Nota</option>
                          <option value="Reprovado por Falta">Reprovado por Falta</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Notas por Módulo */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Notas por Módulo</h2>
                    </div>

                    <div className="space-y-4">
                      {formData.moduleGrades.length > 0 ? (
                        formData.moduleGrades.map((mg, i) => (
                          <div key={mg.moduleId} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4 min-w-[200px]">
                              <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-400">
                                {i + 1}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700">{mg.title}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Plataforma:</label>
                                  <select 
                                    value={mg.platform}
                                    onChange={(e) => handleModuleGradeChange(mg.moduleId, 'platform', e.target.value as any)}
                                    className="bg-transparent border-none p-0 text-[10px] font-bold text-primary focus:ring-0 cursor-pointer"
                                  >
                                    <option value="Homero">Homero</option>
                                    <option value="Classroom">Classroom</option>
                                    <option value="Outra">Outra</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Nota (0-10)</label>
                                <input 
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={isNaN(mg.grade) ? '' : mg.grade}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    handleModuleGradeChange(mg.moduleId, 'grade', val);
                                  }}
                                  className="w-24 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-center focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">Frequência (%)</label>
                                <input 
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={isNaN(mg.frequency) ? '' : mg.frequency}
                                  onChange={(e) => {
                                    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                                    handleModuleGradeChange(mg.moduleId, 'frequency', val);
                                  }}
                                  className="w-24 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm font-black text-center focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-slate-400 italic">
                          Nenhum módulo encontrado para este curso.
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                  {/* Indicadores Gerais */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-tight">Indicadores Gerais</h3>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <TrendingUp className="w-3 h-3" /> Progresso (%)
                        </div>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={isNaN(formData.progress) ? '' : formData.progress}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, progress: val }));
                          }}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <TrendingUp className="w-3 h-3" /> Progresso Homero (%)
                        </div>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={isNaN(formData.homeroProgress) ? '' : formData.homeroProgress}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, homeroProgress: val }));
                          }}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <TrendingUp className="w-3 h-3" /> Progresso Classroom (%)
                        </div>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={isNaN(formData.classroomProgress) ? '' : formData.classroomProgress}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, classroomProgress: val }));
                          }}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <Clock className="w-3 h-3" /> Frequência Final (%)
                        </div>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={isNaN(formData.frequency) ? '' : formData.frequency}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, frequency: val }));
                          }}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          <TrendingUp className="w-3 h-3" /> Nota Final
                        </div>
                        <input 
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={isNaN(formData.grade) ? '' : formData.grade}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            setFormData(prev => ({ ...prev, grade: val }));
                          }}
                          className="w-full h-12 px-4 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Info Card */}
                  <section className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200">
                    <h3 className="text-lg font-bold mb-6">Resumo do Vínculo</h3>
                    <div className="space-y-5">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/10 rounded-lg">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Aluno</p>
                          <p className="font-bold text-sm">{enrollment.studentName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/10 rounded-lg">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Curso</p>
                          <p className="font-bold text-sm">{enrollment.courseName}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      Salvar Alterações
                    </button>
                    <button 
                      type="button"
                      onClick={() => router.back()}
                      className="w-full py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" /> Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight, 
  Save, 
  User, 
  Info, 
  ArrowLeft,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NewCyclePage() {
  const router = useRouter();
  const { id: courseId } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [courseName, setCourseName] = React.useState('');
  const [formData, setFormData] = React.useState({
    externalId: '',
    cycle: '',
    year: new Date().getFullYear().toString(),
    semester: '1',
    class: '',
    track: '',
    responsibleType: 'Professor',
    responsibleName: '',
    startDate: '',
    endDate: ''
  });

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourseName(data.name);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, courseId }),
      });
      
      if (response.ok) {
        alert('Novo ciclo de formação criado com sucesso!');
        router.push(`/cursos/${courseId}`);
      } else {
        const data = await response.json();
        alert(`Erro ao salvar ciclo: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save cycle:', error);
      alert('Erro de conexão ao salvar ciclo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Novo Ciclo de Formação" 
          subtitle={courseName || "Carregando curso..."} 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-primary">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/cursos')} className="hover:text-primary">Cursos & Extensão</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push(`/cursos/${courseId}`)} className="hover:text-primary">Detalhes</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">Novo Ciclo</span>
            </nav>

            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Adicionar Ciclo de Formação</h1>
                <p className="text-slate-600 max-w-2xl text-sm">Crie uma nova oferta acadêmica para o curso <strong>{courseName}</strong>.</p>
              </div>
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1: Detalhes do Ciclo */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">1</div>
                  <h2 className="text-xl font-bold text-slate-900">Identificação do Ciclo</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ciclo / Edição</label>
                    <input 
                      required
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="Ex: Ciclo 3 - 2026" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ano</label>
                    <input 
                      required
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Semestre</label>
                    <select 
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3"
                    >
                      <option value="1">1º Semestre</option>
                      <option value="2">2º Semestre</option>
                      <option value="3">Intensivo de Verão</option>
                      <option value="4">Intensivo de Inverno</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Turma</label>
                    <input 
                      name="class"
                      value={formData.class}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="Ex: Turma C" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Trilha</label>
                    <input 
                      name="track"
                      value={formData.track}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="Ex: Trilha Principal" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Código Externo</label>
                    <input 
                      name="externalId"
                      value={formData.externalId}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="Opcional" 
                      type="text"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Responsável e Datas */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">2</div>
                  <h2 className="text-xl font-bold text-slate-900">Responsável e Datas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Tipo de Vínculo</label>
                      <div className="flex gap-4 p-1 bg-slate-100 rounded-lg w-fit">
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, responsibleType: 'Professor' }))}
                          className={cn(
                            "px-6 py-2 rounded-md text-sm font-bold transition-all",
                            formData.responsibleType === 'Professor' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Professor
                        </button>
                        <button 
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, responsibleType: 'Mentor' }))}
                          className={cn(
                            "px-6 py-2 rounded-md text-sm font-bold transition-all",
                            formData.responsibleType === 'Mentor' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                          )}
                        >
                          Mentor
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Nome do Responsável</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          name="responsibleName"
                          value={formData.responsibleName}
                          onChange={handleChange}
                          className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary pl-10 pr-4 py-3" 
                          placeholder="Nome do docente..." 
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Data de Início</label>
                      <input 
                        required
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Data de Fim</label>
                      <input 
                        required
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                        type="date"
                      />
                    </div>
                    <div className="sm:col-span-2 p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-start gap-3">
                      <Info className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-xs text-slate-600">
                        O ciclo define o período letivo em que os alunos estarão vinculados.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12">
                <button 
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  disabled={loading}
                  className="w-full sm:w-auto px-10 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                  type="submit"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Criar Ciclo
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

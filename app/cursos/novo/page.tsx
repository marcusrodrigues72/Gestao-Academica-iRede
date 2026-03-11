'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight, 
  Save, 
  User, 
  Info, 
  ArrowLeft,
  GraduationCap,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [activeCycleIndex, setActiveCycleIndex] = React.useState(0);
  const [formData, setFormData] = React.useState({
    externalId: '',
    name: '',
    category: 'Tecnologia da Informação',
    project: '',
    technology: '',
    description: '',
    modules: [{ title: '' }],
    cycles: [{
      externalId: '',
      cycle: 'Ciclo 1 - 2024',
      year: new Date().getFullYear().toString(),
      semester: '1',
      class: 'Turma A',
      track: '',
      responsibleType: 'Professor',
      responsibleName: '',
      startDate: '',
      endDate: '',
    }]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCycleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newCycles = [...formData.cycles];
    newCycles[index] = { ...newCycles[index], [name]: value };
    setFormData(prev => ({ ...prev, cycles: newCycles }));
  };

  const addCycle = () => {
    const newCycle = {
      externalId: '',
      cycle: `Ciclo ${formData.cycles.length + 1} - ${new Date().getFullYear()}`,
      year: new Date().getFullYear().toString(),
      semester: '1',
      class: '',
      track: '',
      responsibleType: 'Professor',
      responsibleName: '',
      startDate: '',
      endDate: '',
    };
    setFormData(prev => ({ ...prev, cycles: [...prev.cycles, newCycle] }));
    setActiveCycleIndex(formData.cycles.length);
  };

  const removeCycle = (index: number) => {
    if (formData.cycles.length <= 1) return;
    const newCycles = formData.cycles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, cycles: newCycles }));
    if (activeCycleIndex >= newCycles.length) {
      setActiveCycleIndex(newCycles.length - 1);
    }
  };

  const handleModuleChange = (index: number, value: string) => {
    const newModules = [...formData.modules];
    newModules[index].title = value;
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const addModule = () => {
    setFormData(prev => ({ ...prev, modules: [...prev.modules, { title: '' }] }));
  };

  const removeModule = (index: number) => {
    if (formData.modules.length <= 1) return;
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Curso e ciclos salvos com sucesso!');
        router.push('/cursos');
      } else {
        alert('Erro ao salvar curso.');
      }
    } catch (error) {
      console.error('Failed to save course:', error);
      alert('Erro ao salvar curso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Configuração de Curso e Ofertas" 
          subtitle="Defina o modelo base do curso e gerencie as instâncias de execução (ciclos)" 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-primary">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/cursos')} className="hover:text-primary">Cursos & Extensão</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">Gestão de Curso e Ciclos</span>
            </nav>

            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Configuração de Curso e Ofertas</h1>
                <p className="text-slate-600 max-w-2xl text-sm font-medium">Defina o modelo base do curso e gerencie as instâncias de execução (ciclos) onde os alunos serão matriculados.</p>
              </div>
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Section 1: Informações do Curso */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">1</span>
                  <h2 className="text-xl font-bold text-slate-900">Informações do Curso (Modelo Base)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">ID do Curso</label>
                    <input 
                      name="externalId"
                      value={formData.externalId}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                      placeholder="Ex: EXT-2024-001" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nome do Curso</label>
                    <input 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                      placeholder="Ex: Desenvolvimento Web Fullstack" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Programa</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium"
                    >
                      <option>Tecnologia da Informação</option>
                      <option>Gestão e Negócios</option>
                      <option>Educação e Sociedade</option>
                      <option>Engenharia e Inovação</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Projeto</label>
                    <input 
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                      placeholder="Nome do projeto associado" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Tecnologia</label>
                    <input 
                      name="technology"
                      value={formData.technology}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                      placeholder="Ex: React, Node.js, Python" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Descrição do Curso</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                      placeholder="Breve resumo dos objetivos e conteúdo do curso" 
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Estrutura de Módulos */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">2</span>
                    <h2 className="text-xl font-bold text-slate-900">Estrutura de Módulos (Conteúdo Base)</h2>
                  </div>
                  <button 
                    type="button"
                    onClick={addModule}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Módulo
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-sm text-blue-800 font-medium">
                    Esta estrutura define o conteúdo programático padrão. Todas as ofertas (ciclos) seguirão esta sequência de módulos.
                  </p>
                </div>
                
                <div className="space-y-4">
                  {formData.modules.map((mod, index) => (
                    <div key={index} className="flex items-end gap-4 group">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Título do Módulo</label>
                        <input 
                          value={mod.title}
                          onChange={(e) => handleModuleChange(index, e.target.value)}
                          className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                          placeholder="Ex: Introdução ao Banco de Dados" 
                          type="text"
                          required
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeModule(index)}
                        className="mb-1 p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover Módulo"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Ciclos de Execução */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">3</span>
                    <h2 className="text-xl font-bold text-slate-900">Ciclos de Execução (Ofertas)</h2>
                  </div>
                  <button 
                    type="button"
                    onClick={addCycle}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/10"
                  >
                    <Plus className="w-4 h-4" /> Adicionar Novo Ciclo de Realização
                  </button>
                </div>

                <div className="mb-6">
                  <div className="border-b border-slate-200">
                    <nav className="flex gap-4">
                      {formData.cycles.map((cycle, index) => (
                        <button 
                          key={index}
                          type="button"
                          onClick={() => setActiveCycleIndex(index)}
                          className={cn(
                            "py-4 px-1 text-sm font-bold flex items-center gap-2 border-b-2 transition-all",
                            activeCycleIndex === index 
                              ? "border-primary text-primary" 
                              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                          )}
                        >
                          <Clock className="w-4 h-4" />
                          {cycle.cycle || `Ciclo ${index + 1}`}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Identificação do Ciclo</label>
                      <input 
                        name="cycle"
                        value={formData.cycles[activeCycleIndex].cycle}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-bold" 
                        placeholder="Ex: Ciclo 1 - 2024" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Código Externo</label>
                      <input 
                        name="externalId"
                        value={formData.cycles[activeCycleIndex].externalId}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                        placeholder="COD-EXT-99" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Semestre</label>
                      <select 
                        name="semester"
                        value={formData.cycles[activeCycleIndex].semester}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium"
                      >
                        <option value="1">1º Semestre</option>
                        <option value="2">2º Semestre</option>
                        <option value="3">Intensivo de Verão</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Turma</label>
                      <input 
                        name="class"
                        value={formData.cycles[activeCycleIndex].class}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                        placeholder="Ex: Turma A - Noturno" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Trilha</label>
                      <input 
                        name="track"
                        value={formData.cycles[activeCycleIndex].track}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                        placeholder="Ex: Avançada" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Responsável</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                          name="responsibleName"
                          value={formData.cycles[activeCycleIndex].responsibleName}
                          onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                          className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary pl-10 pr-4 py-3 font-medium" 
                          placeholder="Nome do docente..." 
                          type="text"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Data de Início</label>
                      <input 
                        name="startDate"
                        value={formData.cycles[activeCycleIndex].startDate}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Data de Término</label>
                      <input 
                        name="endDate"
                        value={formData.cycles[activeCycleIndex].endDate}
                        onChange={(e) => handleCycleChange(activeCycleIndex, e)}
                        className="w-full rounded-lg border-slate-200 bg-white focus:ring-primary focus:border-primary px-4 py-3 font-medium" 
                        type="date"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2 text-xs text-slate-500 italic font-medium">
                      <Info className="w-4 h-4" />
                      Os alunos matriculados neste ciclo terão acesso aos módulos definidos na estrutura base entre estas datas.
                    </div>
                  </div>

                  {formData.cycles.length > 1 && (
                    <div className="flex justify-end">
                      <button 
                        type="button"
                        onClick={() => removeCycle(activeCycleIndex)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover este ciclo
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12">
                <button 
                  type="button"
                  onClick={() => router.push('/cursos')}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Descartar Alterações
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
                  Salvar Curso e Ciclos
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

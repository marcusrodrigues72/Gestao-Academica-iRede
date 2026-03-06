'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight, 
  Save, 
  User, 
  Info, 
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    externalId: '',
    name: '',
    category: 'Tecnologia da Informação',
    project: '',
    technology: '',
    description: '',
    offerExternalId: '',
    cycle: '',
    year: new Date().getFullYear().toString(),
    semester: '1',
    class: '',
    track: '',
    responsibleType: 'Professor',
    responsibleName: '',
    startDate: '',
    endDate: '',
    modules: [] as { id?: string, title: string }[]
  });

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData({
            externalId: data.externalId || '',
            name: data.name || '',
            category: data.category || 'Tecnologia da Informação',
            project: data.project || '',
            technology: data.technology || '',
            description: data.description || '',
            offerExternalId: data.offerExternalId || '',
            cycle: data.cycle || '',
            year: (data.year || new Date().getFullYear()).toString(),
            semester: (data.semester || 1).toString(),
            class: data.class || '',
            track: data.track || '',
            responsibleType: data.responsibleType || 'Professor',
            responsibleName: data.responsibleName || '',
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            modules: data.modules || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    const newModules = formData.modules.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, modules: newModules }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Curso e oferta atualizados com sucesso!');
        router.push('/cursos');
      } else {
        alert('Erro ao atualizar curso.');
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Erro ao atualizar curso.');
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Editar Curso e Oferta" 
          subtitle="Gerencie a oferta acadêmica e trilhas de aprendizagem" 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-primary">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/cursos')} className="hover:text-primary">Cursos & Extensão</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">Editar Oferta</span>
            </nav>

            {/* Header Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Editar Curso e Oferta Acadêmica</h1>
                <p className="text-slate-600 max-w-2xl text-sm">Atualize as informações principais do curso e os detalhes específicos de cada oferta, incluindo responsáveis e cronograma.</p>
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
                  <h2 className="text-xl font-bold text-slate-900">Informações do Curso</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">ID do Curso</label>
                    <input 
                      name="externalId"
                      value={formData.externalId}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
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
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
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
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3"
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
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
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
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
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
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="Breve resumo dos objetivos e conteúdo do curso" 
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              {/* Section 2: Detalhes da Oferta */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">2</span>
                  <h2 className="text-xl font-bold text-slate-900">Detalhes da Oferta</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Código Externo</label>
                    <input 
                      name="offerExternalId"
                      value={formData.offerExternalId}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="COD-EXT-99" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ciclo / Edição</label>
                    <input 
                      name="cycle"
                      value={formData.cycle}
                      onChange={handleChange}
                      className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
                      placeholder="Ex: 3ª Edição" 
                      type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Ano</label>
                    <input 
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
                      placeholder="Ex: Turma A - Noturno" 
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
                      placeholder="Ex: Avançada" 
                      type="text"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3: Responsável e Datas */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">3</span>
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
                          placeholder="Pesquisar docente..." 
                          type="text"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Data de Início</label>
                      <input 
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
                        Certifique-se de que a data de fim seja posterior à data de início e contemple o período de exames finais.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4: Estrutura de Módulos */}
              <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center size-8 bg-primary rounded-lg text-white font-bold">4</span>
                    <h2 className="text-xl font-bold text-slate-900">Estrutura de Módulos</h2>
                  </div>
                  <button 
                    type="button"
                    onClick={addModule}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all"
                  >
                    <span className="text-lg">+</span> Adicionar Módulo
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.modules.map((mod, index) => (
                    <div key={index} className="flex items-end gap-4 group">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Título do Módulo</label>
                        <input 
                          value={mod.title}
                          onChange={(e) => handleModuleChange(index, e.target.value)}
                          className="w-full rounded-lg border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary px-4 py-3" 
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
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                  {formData.modules.length === 0 && (
                    <p className="text-sm text-slate-500 italic">Nenhum módulo cadastrado. Adicione módulos para habilitar o lançamento de notas.</p>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <p className="text-sm text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Defina a estrutura sequencial dos módulos que compõem este curso.
                  </p>
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
                  disabled={saving}
                  className="w-full sm:w-auto px-10 py-3 rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                  type="submit"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  Atualizar Curso e Oferta
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

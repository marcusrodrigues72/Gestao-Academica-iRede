'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight,
  Save,
  X,
  User,
  Mail,
  History,
  Contact,
  School,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [courses, setCourses] = React.useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  React.useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`/api/students/${id}`);
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else {
          alert('Aluno não encontrado.');
          router.push('/alunos');
        }
      } catch (error) {
        console.error('Failed to fetch student:', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchStudent();
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Cadastro atualizado com sucesso!');
        router.push('/alunos');
      } else {
        alert('Erro ao atualizar cadastro.');
      }
    } catch (error) {
      console.error('Failed to update student:', error);
      alert('Erro ao atualizar cadastro.');
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

  if (!formData) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title={`Editar Aluno: ${formData.name}`} 
          subtitle={`Editando registro de ${formData.name} (${id})`} 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/alunos')} className="hover:text-primary transition-colors">Alunos</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-bold">Editar Aluno</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Editar Registro de Aluno</h1>
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-slate-50/50">
                {[
                  { id: 1, label: '1. Dados Pessoais' },
                  { id: 2, label: '2. Contato e Endereço' },
                  { id: 3, label: '3. Formação Acadêmica' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-5 px-6 text-sm font-bold transition-all border-b-2 ${
                      activeTab === tab.id 
                        ? "border-primary text-primary bg-white" 
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-12">
                {/* Section 1: Dados Pessoais */}
                <section className={activeTab === 1 ? "block" : "hidden md:block"}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Dados Pessoais</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Civil</label>
                      <input 
                        required
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Nome completo conforme RG" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome Social</label>
                      <input 
                        name="socialName"
                        value={formData.socialName || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Caso aplicável" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CPF</label>
                      <input 
                        required
                        name="cpf"
                        value={formData.cpf || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="000.000.000-00" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">RG</label>
                      <input 
                        name="rg"
                        value={formData.rg || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Número do Registro Geral" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Data de Nascimento</label>
                      <input 
                        required
                        name="birthDate"
                        value={formData.birthDate || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        type="date"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Sexo/Gênero</label>
                      <select 
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="">Selecione</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Não binário">Não binário</option>
                        <option value="Prefiro não declarar">Prefiro não declarar</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cor/Raça</label>
                      <select 
                        name="race"
                        value={formData.race || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="">Selecione</option>
                        <option value="Branca">Branca</option>
                        <option value="Preta">Preta</option>
                        <option value="Parda">Parda</option>
                        <option value="Amarela">Amarela</option>
                        <option value="Indígena">Indígena</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nacionalidade</label>
                      <input 
                        name="nationality"
                        value={formData.nationality || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Ex: Brasileira" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Naturalidade</label>
                      <input 
                        name="naturalness"
                        value={formData.naturalness || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Cidade de nascimento" 
                        type="text"
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 2: Contato e Endereço */}
                <section className={activeTab === 2 ? "block" : "hidden md:block"}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <Contact className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Contato e Endereço</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">E-mail Principal</label>
                      <input 
                        required
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="exemplo@email.com" 
                        type="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">WhatsApp</label>
                      <input 
                        name="whatsapp"
                        value={formData.whatsapp || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="(00) 00000-0000" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Telefone Fixo</label>
                      <input 
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="(00) 0000-0000" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">CEP</label>
                      <input 
                        name="cep"
                        value={formData.cep || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="00000-000" 
                        type="text"
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Logradouro (Rua/Av)</label>
                      <input 
                        name="street"
                        value={formData.street || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Ex: Rua das Flores" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Número</label>
                      <input 
                        name="number"
                        value={formData.number || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="123" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Bairro</label>
                      <input 
                        name="neighborhood"
                        value={formData.neighborhood || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Bairro" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cidade</label>
                      <input 
                        name="city"
                        value={formData.city || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Cidade" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Estado (UF)</label>
                      <input 
                        name="state"
                        value={formData.state || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="UF" 
                        type="text"
                        maxLength={2}
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Complemento</label>
                      <input 
                        name="complement"
                        value={formData.complement || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Apto, Bloco, etc." 
                        type="text"
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 3: Formação Acadêmica */}
                <section className={activeTab === 3 ? "block" : "hidden md:block"}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                      <School className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Formação Acadêmica e Registro</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Curso de Origem</label>
                      <input 
                        name="originCourse"
                        value={formData.originCourse || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Nome do curso anterior" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Instituição</label>
                      <input 
                        name="institution"
                        value={formData.institution || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Ex: USP, UNESP..." 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Status</label>
                      <select 
                        name="academicStatus"
                        value={formData.academicStatus || 'Concluído'}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="Concluído">Concluído</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Trancado">Trancado</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Ano de Conclusão/Previsão</label>
                      <input 
                        name="completionYear"
                        value={formData.completionYear || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="AAAA" 
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grau Acadêmico</label>
                      <select 
                        name="academicDegree"
                        value={formData.academicDegree || 'Médio'}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="Médio">Médio</option>
                        <option value="Graduação">Graduação</option>
                        <option value="Pós-Graduação">Pós-Graduação</option>
                        <option value="Mestrado">Mestrado</option>
                        <option value="Doutorado">Doutorado</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Titulação</label>
                      <input 
                        name="titulation"
                        value={formData.titulation || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Ex: Bacharel, Licenciado" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Identificador Externo</label>
                      <input 
                        name="externalId"
                        value={formData.externalId || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="ID de sistemas externos" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Origem do Cadastro</label>
                      <select 
                        name="registrationOrigin"
                        value={formData.registrationOrigin || 'Manual'}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="Manual">Manual</option>
                        <option value="Site Extensionista">Site Extensionista</option>
                        <option value="Importação Legada">Importação Legada</option>
                        <option value="Parceria Externa">Parceria Externa</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Curso Matriculado</label>
                      <select 
                        required
                        name="courseId"
                        value={formData.courseId || ''}
                        onChange={handleChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="">Selecione um curso</option>
                        {courses.map(course => (
                          <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-end gap-4 pt-10">
                  <button 
                    type="button"
                    onClick={() => router.push('/alunos')}
                    className="px-10 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all" 
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={saving}
                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50" 
                    type="submit"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

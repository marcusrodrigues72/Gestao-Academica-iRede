'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { SearchableSelect } from '@/components/searchable-select';
import { 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  ArrowLeft,
  User,
  BookOpen,
  Calendar,
  Save,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function NewEnrollmentPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [students, setStudents] = React.useState<any[]>([]);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [offers, setOffers] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState({
    studentId: '',
    courseId: '',
    offerId: '',
    status: 'Ativo',
    classification: 'Regular',
    insertionDate: new Date().toISOString().split('T')[0],
    autoConfirm: true
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.all([
          fetch('/api/students'),
          fetch('/api/courses')
        ]);
        
        if (studentsRes.ok) setStudents(await studentsRes.json());
        if (coursesRes.ok) setCourses(await coursesRes.json());
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleCourseChange = async (courseId: string) => {
    setFormData(prev => ({ ...prev, courseId, offerId: '' }));
    try {
      // In a real app, we'd have an API for offers. 
      // For now, let's assume the course details API returns offers or we just use the courseId to find offers.
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        // The course details API returns the latest offer.
        // Let's mock a list of offers if it doesn't return an array.
        setOffers(data.offer ? [data.offer] : []);
        if (data.offer) {
          setFormData(prev => ({ ...prev, offerId: data.offer.id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.offerId) {
      alert('Por favor, selecione um aluno e uma oferta.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        alert('Matrícula realizada com sucesso!');
        router.push('/matriculas');
      } else {
        const err = await response.json();
        alert(`Erro ao realizar matrícula: ${err.error}`);
      }
    } catch (error) {
      console.error('Failed to save enrollment:', error);
      alert('Erro ao realizar matrícula.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Nova Matrícula" 
          subtitle="Preencha os dados abaixo para realizar a nova matrícula no curso de extensão." 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <button onClick={() => router.push('/')} className="hover:text-primary transition-colors">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/matriculas')} className="hover:text-primary transition-colors">Matrículas</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-bold">Nova Matrícula</span>
            </nav>

            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nova Matrícula</h1>
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-10 space-y-12">
                {/* Section 1: Seleção do Aluno */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold w-10 h-10 flex items-center justify-center">1</div>
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Seleção do Aluno</h2>
                  </div>
                  
                  <div className="space-y-2">
                    <SearchableSelect
                      label="Buscar Aluno (Nome, CPF ou ID)"
                      options={students.map(s => ({
                        id: s.id,
                        label: s.name,
                        sublabel: `${s.email} • CPF: ${s.cpf || 'N/A'} • ID: ${s.id.slice(0, 8)}`
                      }))}
                      value={formData.studentId}
                      onChange={(val) => setFormData(prev => ({ ...prev, studentId: val }))}
                      placeholder="Selecione um aluno da base de dados..."
                    />
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 2: Seleção da Oferta */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold w-10 h-10 flex items-center justify-center">2</div>
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Seleção da Oferta</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SearchableSelect
                      label="Curso"
                      options={courses.map(c => ({
                        id: c.id,
                        label: c.name,
                        sublabel: `Carga Horária: ${c.hours}h • Nível: ${c.level || 'N/A'}`
                      }))}
                      value={formData.courseId}
                      onChange={(val) => handleCourseChange(val)}
                      placeholder="Selecione o curso..."
                    />
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Oferta Disponível</label>
                      <select 
                        required
                        disabled={!formData.courseId}
                        value={formData.offerId}
                        onChange={(e) => setFormData(prev => ({ ...prev, offerId: e.target.value }))}
                        className="w-full h-14 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none disabled:opacity-50"
                      >
                        <option value="">{formData.courseId ? 'Escolha a oferta...' : 'Selecione um curso primeiro'}</option>
                        {offers.map(offer => (
                          <option key={offer.id} value={offer.id}>
                            {offer.cycle} - {offer.year} ({offer.class || 'Turma Única'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100" />

                {/* Section 3: Dados da Matrícula */}
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary font-bold w-10 h-10 flex items-center justify-center">3</div>
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Dados da Matrícula</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Status da Matrícula</label>
                      <select 
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full h-14 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                      >
                        <option value="Ativo">Ativo</option>
                        <option value="Trancado">Trancado</option>
                        <option value="Cancelado">Cancelado</option>
                        <option value="Concluído">Concluído</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Classificação</label>
                      <input 
                        value={formData.classification}
                        onChange={(e) => setFormData(prev => ({ ...prev, classification: e.target.value }))}
                        className="w-full h-14 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        placeholder="Ex: Regular, Especial, etc." 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Inserção</label>
                      <input 
                        value={formData.insertionDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, insertionDate: e.target.value }))}
                        className="w-full h-14 px-5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all" 
                        type="date"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-8">
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, autoConfirm: !prev.autoConfirm }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          formData.autoConfirm ? "bg-primary" : "bg-slate-200"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          formData.autoConfirm ? "left-7" : "left-1"
                        )} />
                      </button>
                      <span className="text-sm font-bold text-slate-600">Confirmação de Matrícula Automática</span>
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-end gap-4 pt-10">
                  <button 
                    type="button"
                    onClick={() => router.push('/matriculas')}
                    className="px-10 py-4 rounded-2xl border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all" 
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={loading}
                    className="px-12 py-4 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50" 
                    type="submit"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Finalizar Matrícula
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

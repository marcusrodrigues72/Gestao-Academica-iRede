'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  Star,
  Edit,
  Info,
  CheckCircle2,
  Layout,
  Cpu,
  Target,
  User,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useRouter, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function CourseDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [course, setCourse] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

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

  if (!course) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-slate-900">Curso não encontrado</h1>
          <button onClick={() => router.push('/cursos')} className="mt-4 text-primary font-bold">Voltar para a lista</button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Detalhes do Curso" 
          subtitle={course.name} 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-primary">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/cursos')} className="hover:text-primary">Cursos & Extensão</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-medium">Detalhes</span>
            </nav>

            {/* Hero Section */}
            <div className="relative h-64 rounded-xl overflow-hidden shadow-lg">
              <Image 
                src={`https://picsum.photos/seed/${course.id}/1200/600`}
                alt={course.name}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-3">
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
                      {course.category}
                    </span>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                      {course.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/90">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">120 Alunos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-semibold">120h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">4.8</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push(`/cursos/${course.id}/edit`)}
                    className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold text-sm shadow-md hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Curso
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Sobre o Curso</h2>
                  <p className="text-slate-600 leading-relaxed">
                    {course.description || "Este curso oferece uma formação completa e prática, focada nas demandas atuais do mercado. Os alunos terão a oportunidade de desenvolver projetos reais e contar com o apoio de mentores experientes."}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-bold text-slate-900">Objetivos</h3>
                      </div>
                      <ul className="space-y-2">
                        {['Domínio de ferramentas', 'Prática em projetos reais', 'Networking qualificado'].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Cpu className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-bold text-slate-900">Tecnologias</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(course.technology || 'Web, Design, Gestão').split(',').map((tech: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-bold text-slate-600 uppercase">
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Offers/Cycles List */}
                <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Ciclos de Formação</h2>
                    <button 
                      onClick={() => router.push(`/cursos/${course.id}/ciclos/novo`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all"
                    >
                      <Plus className="w-4 h-4" /> Novo Ciclo
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {course.offers && course.offers.length > 0 ? (
                      course.offers.map((offer: any) => (
                        <div key={offer.id} className="p-6 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-slate-900">{offer.cycle || 'Ciclo não informado'}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                new Date(offer.endDate) > new Date() ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200"
                              )}>
                                {new Date(offer.endDate) > new Date() ? 'Ativo' : 'Finalizado'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {offer.year}/{offer.semester}º</span>
                              <span className="flex items-center gap-1"><Layout className="w-3 h-3" /> {offer.class || 'Turma N/A'}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3" /> {offer.responsibleName || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden md:block">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Período</p>
                              <p className="text-xs font-bold text-slate-600">
                                {offer.startDate ? new Date(offer.startDate).toLocaleDateString() : '--'} a {offer.endDate ? new Date(offer.endDate).toLocaleDateString() : '--'}
                              </p>
                            </div>
                            <button 
                              onClick={() => router.push(`/matriculas?curso=${course.id}&oferta=${offer.id}`)}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-50 transition-all"
                            >
                              Ver Alunos
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm">Nenhum ciclo cadastrado para este curso.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-8">
                <section className="bg-slate-900 p-8 rounded-xl text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-6">Informações Técnicas</h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <Layout className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Projeto</p>
                        <p className="font-bold text-sm">{course.project}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <Info className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">ID Externo</p>
                        <p className="font-bold text-sm">{course.externalId || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-white/10 rounded-lg">
                        <Info className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Cód. Oferta</p>
                        <p className="font-bold text-sm">{course.offerExternalId || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-bold text-slate-600 transition-all flex items-center justify-center gap-2">
                      <Users className="w-4 h-4" /> Ver Alunos
                    </button>
                    <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-bold text-slate-600 transition-all flex items-center justify-center gap-2">
                      <Calendar className="w-4 h-4" /> Cronograma
                    </button>
                    <button 
                      onClick={() => router.push(`/cursos/${course.id}/ciclos/novo`)}
                      className="w-full py-3 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-bold text-primary transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Nova Oferta
                    </button>

                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Printer,
  FileText,
  Download,
  GraduationCap,
  Award,
  Clock,
  ChevronRight,
  BookOpen,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  X,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = React.useState<any>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = React.useState(false);
  const [tempGrades, setTempGrades] = React.useState<any[]>([]);
  const [savingGrades, setSavingGrades] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
        }
      });
  }, []);

  const canDelete = user?.role === 'administrador' || user?.role === 'gestor';
  const canLaunchGrades = user?.role === 'administrador' || user?.role === 'gestor' || user?.role === 'professor' || user?.role === 'mentor';

  const fetchStudent = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/students/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data);
      } else {
        alert('Aluno não encontrado.');
        router.push('/alunos');
      }
    } catch (error) {
      console.error('Failed to fetch student:', error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  React.useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id, fetchStudent]);

  const openGradeModal = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setTempGrades(enrollment.moduleGrades.map((mg: any) => ({ ...mg })));
    setIsGradeModalOpen(true);
  };

  const handleGradeChange = (moduleId: string, field: 'grade' | 'frequency', value: string) => {
    setTempGrades(prev => prev.map(mg => 
      mg.moduleId === moduleId ? { ...mg, [field]: value === '' ? null : parseFloat(value) } : mg
    ));
  };

  const saveGrades = async () => {
    setSavingGrades(true);
    try {
      const response = await fetch(`/api/enrollments/${selectedEnrollment.id}/grades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grades: tempGrades })
      });
      
      if (response.ok) {
        await fetchStudent();
        setIsGradeModalOpen(false);
      } else {
        alert('Erro ao salvar notas.');
      }
    } catch (error) {
      console.error('Failed to save grades:', error);
      alert('Erro ao salvar notas.');
    } finally {
      setSavingGrades(false);
    }
  };

  const handleDelete = async () => {
    console.log('handleDelete iniciado no perfil para ID:', id);
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Exclusão bem-sucedida no backend (perfil)');
        window.alert('Aluno excluído com sucesso.');
        router.push('/alunos');
      } else {
        const errorData = await response.json();
        console.error('Erro retornado pelo backend (perfil):', errorData);
        window.alert(`Erro ao excluir aluno: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição de exclusão (perfil):', error);
      window.alert('Erro ao excluir aluno.');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
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

  if (!student) return null;

  const enrollments = [
    { 
      title: student.course || 'Sem curso matriculado', 
      instructor: 'Dr. Michael Thorne', 
      start: '15 Ago, 2024', 
      grade: 'A- (3.7)', 
      progress: student.progress || 0, 
      status: student.status || 'Em Andamento',
      icon: BookOpen,
      color: 'blue'
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Perfil do Aluno" 
          subtitle="Visualização detalhada e histórico acadêmico" 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-500">
              <button onClick={() => router.push('/')} className="hover:text-accent cursor-pointer">Início</button>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => router.push('/alunos')} className="hover:text-accent cursor-pointer">Alunos</button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-slate-900 font-bold">Perfil: {student.name}</span>
            </nav>

            {/* Profile Header Card */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8"
            >
              <div className="flex items-center gap-8">
                <div className="relative">
                  <div 
                    className="size-32 rounded-3xl bg-slate-100 bg-cover bg-center border-4 border-slate-50 shadow-inner" 
                    style={{ backgroundImage: `url('${student.avatar}')` }} 
                  />
                  <span className="absolute -bottom-2 -right-2 h-8 w-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 leading-tight">
                    {student.socialName ? `${student.socialName} (${student.name})` : student.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4" /> Matrícula: {student.id}
                    </span>
                    <span className={cn(
                      "px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100",
                      student.status !== 'Ativo' && "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {student.status}
                    </span>
                    <span className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-black rounded-full uppercase tracking-widest border border-accent/10">
                      Membro Premium
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                {canDelete && (
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-100 transition-all border border-rose-100"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={() => router.push(`/alunos/${id}/edit`)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    <Edit3 className="w-4 h-4" /> Editar
                  </button>
                )}
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-accent text-white rounded-2xl font-bold text-sm hover:brightness-110 shadow-lg shadow-accent/20 transition-all">
                  <Printer className="w-4 h-4" /> Ficha
                </button>
              </div>
            </motion.section>

            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Info & Documents */}
              <aside className="col-span-12 lg:col-span-4 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-accent" /> Dados Pessoais
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {[
                      { label: 'E-mail', value: student.email || 'Não informado', icon: Mail },
                      { label: 'WhatsApp', value: student.whatsapp || 'Não informado', icon: Phone },
                      { label: 'CPF', value: student.cpf || 'Não informado', icon: CreditCard },
                      { label: 'RG', value: student.rg || 'Não informado', icon: FileText },
                      { label: 'Nascimento', value: student.birthDate || 'Não informado', icon: Calendar },
                      { label: 'Endereço', value: student.address || 'Não informado', icon: MapPin },
                    ].map((item) => (
                      <div key={item.label} className="flex gap-4">
                        <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                          <item.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.label}</p>
                          <p className="text-sm text-slate-900 font-medium mt-0.5 leading-relaxed">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-accent" /> Documentos
                    </h3>
                    <button className="text-accent text-xs font-bold uppercase tracking-widest hover:underline">+ Upload</button>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { name: 'ID_Verification.pdf', date: '12 Out 2023', type: 'pdf' },
                      { name: 'Diploma_Scanned.png', date: '15 Out 2023', type: 'img' }
                    ].map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl",
                            doc.type === 'pdf' ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"
                          )}>
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{doc.date}</p>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-accent transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Right Column: Enrollments & Performance */}
              <section className="col-span-12 lg:col-span-8 space-y-8">
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="flex border-b border-slate-100 px-8 gap-10 bg-slate-50/50">
                    <button className="border-b-4 border-accent text-accent pb-4 pt-6 font-black text-xs uppercase tracking-widest">Matrículas</button>
                    <button className="border-b-4 border-transparent text-slate-400 pb-4 pt-6 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Financeiro</button>
                    <button className="border-b-4 border-transparent text-slate-400 pb-4 pt-6 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-colors">Frequência</button>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    {student.enrollments?.map((enroll: any, i: number) => (
                      <motion.div 
                        key={enroll.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group p-6 rounded-2xl border border-slate-100 hover:border-accent/30 hover:shadow-md transition-all bg-slate-50/30"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex gap-5">
                            <div className={cn(
                              "size-14 rounded-2xl flex items-center justify-center shadow-sm bg-blue-50 text-blue-600"
                            )}>
                              <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-lg leading-tight">{enroll.course}</h4>
                              <p className="text-xs text-slate-500 mt-1 font-medium">Turma: {enroll.turma} • Ciclo: {enroll.cycle}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-black text-slate-900">Média: {enroll.finalGrade ? enroll.finalGrade.toFixed(1) : 'N/A'}</span>
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest mt-1 block text-blue-600"
                            )}>
                              {enroll.status}
                            </span>
                          </div>
                        </div>
                        
                        {/* Modules Progress/Grades */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          {enroll.moduleGrades?.map((mg: any) => (
                            <div key={mg.moduleId} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{mg.moduleTitle}</span>
                                <span className="text-xs font-bold text-slate-900">{mg.grade !== null ? mg.grade.toFixed(1) : '-'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-accent rounded-full" 
                                    style={{ width: `${mg.grade !== null ? (mg.grade / 10) * 100 : 0}%` }}
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-slate-400">{mg.frequency !== null ? `${mg.frequency}%` : '-'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">Progresso do Curso</span>
                            <span className="text-accent">{enroll.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${enroll.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full rounded-full bg-accent" 
                            />
                          </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                          <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-200 ring-1 ring-slate-100" />
                            ))}
                            <div className="size-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">+5</div>
                          </div>
                          {canLaunchGrades && (
                            <button 
                              onClick={() => openGradeModal(enroll)}
                              className="text-xs font-black text-accent uppercase tracking-widest hover:underline"
                            >
                              Lançar Notas/Frequência →
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-accent" /> Desempenho Geral
                    </h4>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">GPA Acumulado</span>
                        <span className="text-xl font-black text-slate-900">3.85 / 4.0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Créditos Totais</span>
                        <span className="text-xl font-black text-slate-900">18 / 24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-500">Frequência Média</span>
                        <span className="text-xl font-black text-emerald-600">94%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-accent" /> Próximos Prazos
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 bg-rose-500 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Projeto Final React</p>
                          <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Amanhã, 23:59</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 bg-amber-400 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">Quiz: Data Science</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sexta, 20 Out</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Grade Management Modal */}
      <AnimatePresence>
        {isGradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGradeModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Lançamento de Notas e Frequência</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedEnrollment?.course}</p>
                </div>
                <button 
                  onClick={() => setIsGradeModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {tempGrades.map((mg) => (
                  <div key={mg.moduleId} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-slate-800">{mg.moduleTitle}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Módulo de Avaliação</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota (0-10)</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="10" 
                          step="0.1"
                          value={mg.grade === null ? '' : mg.grade}
                          onChange={(e) => handleGradeChange(mg.moduleId, 'grade', e.target.value)}
                          className="w-24 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Freq. (%)</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="100" 
                          value={mg.frequency === null ? '' : mg.frequency}
                          onChange={(e) => handleGradeChange(mg.moduleId, 'frequency', e.target.value)}
                          className="w-24 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setIsGradeModalOpen(false)}
                  className="px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveGrades}
                  disabled={savingGrades}
                  className="px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {savingGrades ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Excluir Aluno"
        description="Tem certeza que deseja excluir este aluno? Esta ação é irreversível e removerá todas as matrículas, notas e histórico associados."
        confirmLabel="Excluir Aluno"
      />
    </div>
  );
}

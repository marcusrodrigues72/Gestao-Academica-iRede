'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { ConfirmationModal } from '@/components/confirmation-modal';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  MessageSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Edit,
  X,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  socialName?: string;
  cpf: string;
  email: string;
  course: string;
  progress: number;
  status: string;
  avatar: string;
  enrollmentCount: number;
}

const initialStudents: Student[] = [
  { id: 'ST-8821', name: 'Alex Johnson', cpf: '123.456.789-00', email: 'alex.j@example.com', course: 'Digital Marketing', progress: 65, status: 'Ativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFw7C12upUllg6DeLoee2aTfkNniT8jWiy1yhaGRQt_eX0HfoHlLUxkwJjM4LEIjIy1Zt0dEWShI_xcbD0apvs5grfV3Un3Rx3SIbSF4a1xk_Rb4G4vmgaJmNQ2DLM-_nGf_mKe3hlDDo4aWx7LHqsxj0CIVopnVcsFTGmaqK5ErI7NqEZSdPtxBhSX9tkYWDudzGu_631I4cuG-G_6WmGrv5jyrRJ0Hih3I643l1Vj5-U2cfGuwtWDWku_qv35M3mhLIBh0VoTuM', enrollmentCount: 1 },
  { id: 'ST-9012', name: 'Maria Garcia', cpf: '234.567.890-11', email: 'm.garcia@univ.edu', course: 'Data Science', progress: 85, status: 'On Hold', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClUy6zgorEGMpOtZ4z5W3GjN_lPsK1KkbMO8CfHg0U2fOSJ3TFB3Wq176F1vL_cRM--d-ZM5-LCp8g39svbN6P3km1b7hCeL2_WDS5VVVjuW_sWHV5qBx3ko8ubgJpPNfbRG0gttsImb11T4eRiHcmerb8P9JKMLB7Ga9o_RxclJJCHVSWyWAWHfqRy_DdCdXvUEW5SdYx50wj7VuyDlVM-nuZPaG9TI6tysC-X8qggPZ_qXpLsjnk-vaPdQECqE8YQLqr-C8JcQ4', enrollmentCount: 1 },
  { id: 'ST-7734', name: 'James Smith', cpf: '345.678.901-22', email: 'jsmith@domain.com', course: 'UX Masterclass', progress: 92, status: 'Ativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARziGcsPEt_r07OLwZcKF9DIsTB4jgfPC9ocBf0y3KDlV0BicDGzDnreSnSCPNeTSVu8RGdKo5feMUoQy_BmWz3tt1RoTpkn4evC2LKABQcI2TPH6Yfdji1ig6D6N8cKx8FWRFnT2cv5va92rny7zvdatKW7y0smxkqJuhFK2u3EWVAhzTymjd82iMnKq9hK35QkST8ZcRFhkQjFxXbf02uULAfrnZ8EHFSOBP8sjNvVQFQWPDZRznWAz2YZD1CgDBQYR7YNF7iwc', enrollmentCount: 1 },
  { id: 'ST-8109', name: 'Sarah Chen', cpf: '456.789.012-33', email: 'schen@global.net', course: 'Python Basics', progress: 10, status: 'Inativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA43NQHFo7C1jPDxn80g4shGmLrhtuw7OrMDIP5rUlQeHrdPOyWu037hnpz_NTd-NwkRYIxJcEDFddy6YvzDt8_BBQQ1XxDfVV0iF_uWgdGfUak3PYyaZYRkz1E3kWdopOA6N3uvVBdhBssAxwUMC_hKHoWURqkSZUEWeaC7aMZpmdGEAP9CSH_jd2cR0GVaFfCfAZMnahKI4q6zjETGJyegTXxPMKYipIQfdZqIxe8xHieRbaJzJvQezbEeDyBFpWv5eyZbWpgMw4', enrollmentCount: 1 },
];

export default function StudentsPage() {
  const router = useRouter();
  const [studentsList, setStudentsList] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('Todos');
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState<string | null>(null);
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
  
  const fetchStudents = React.useCallback(async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudentsList(data);
      if (data.length > 0 && !selectedStudent) {
        setSelectedStudent(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStudent]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = studentsList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    console.log('handleDelete chamado para ID:', id);
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    console.log('confirmDelete iniciado para ID:', studentToDelete);
    if (!studentToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/students/${studentToDelete}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log('Exclusão bem-sucedida no backend');
        setStudentsList(prev => prev.filter(s => s.id !== studentToDelete));
        if (selectedStudent?.id === studentToDelete) {
          setSelectedStudent(null);
        }
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
        window.alert('Aluno excluído com sucesso.');
      } else {
        const errorData = await response.json();
        console.error('Erro retornado pelo backend:', errorData);
        window.alert(`Erro ao excluir aluno: ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro na requisição de exclusão:', error);
      window.alert('Erro de conexão ao tentar excluir o aluno.');
    } finally {
      setIsDeleting(false);
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
          title="Diretório de Alunos" 
          subtitle={`Gerenciando ${studentsList.length} matrículas ativas`} 
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Header Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-slate-900 text-2xl font-black tracking-tight">Student Directory</h1>
                  <p className="text-slate-500 text-sm">Gerenciamento centralizado de matrículas e perfis</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 mr-3 uppercase tracking-widest">Bulk Actions:</span>
                    <button className="text-xs font-bold text-slate-600 hover:text-primary px-2 border-r border-slate-200">Export PDF</button>
                    <button className="text-xs font-bold text-slate-600 hover:text-primary px-2">Message</button>
                  </div>
                  <button 
                    onClick={() => router.push('/alunos/novo')}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Add Student
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-3 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[300px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, ID or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-sm border-slate-200 rounded-xl bg-white focus:ring-primary/20 py-2.5 pl-4 pr-10 font-bold text-slate-600"
                  >
                    <option value="Todos">Status: All</option>
                    <option value="Ativo">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inativo">Inactive</option>
                  </select>
                  <select className="text-sm border-slate-200 rounded-xl bg-white focus:ring-primary/20 py-2.5 pl-4 pr-10 font-bold text-slate-600">
                    <option>Course: All</option>
                  </select>
                  <button className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900">
                        <th className="w-14 px-4 py-4 text-center">
                          <input type="checkbox" className="rounded border-slate-700 bg-slate-800 text-primary focus:ring-offset-slate-900" />
                        </th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-slate-800/50">Student Profile</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-slate-800/50">Contact Info</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-slate-800/50">Enrollment</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-r border-slate-800/50">Status</th>
                        <th className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence mode="popLayout">
                        {filteredStudents.map((student, i) => (
                          <motion.tr 
                            key={student.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedStudent(student)}
                            className={cn(
                              "hover:bg-primary/5 cursor-pointer transition-colors group",
                              selectedStudent?.id === student.id && "bg-primary/5"
                            )}
                          >
                            <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="rounded border-slate-300 text-primary" />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="size-10 rounded-lg bg-slate-100 bg-cover bg-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform" 
                                  style={{ backgroundImage: `url('${student.avatar}')` }} 
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                                    {student.socialName ? `${student.socialName} (${student.name})` : student.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-1">#{student.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-600">{student.email}</span>
                                <span className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold tracking-tighter">Personal Account</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-slate-800 line-clamp-2">{student.course || 'Sem matrícula'}</span>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1">
                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${student.progress || 0}%` }}
                                        className="h-full bg-emerald-500 rounded-full" 
                                      />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{Math.round(student.progress || 0)}%</span>
                                  </div>
                                  {student.enrollmentCount > 1 && (
                                    <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase">
                                      {student.enrollmentCount} Cursos
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                student.status === 'Ativo' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                student.status === 'On Hold' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-slate-50 text-slate-400 border-slate-100"
                              )}>
                                {student.status === 'Ativo' ? 'Active' : student.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    console.log('Botão de edição clicado para o aluno:', student.id);
                                    e.stopPropagation();
                                    e.preventDefault();
                                    router.push(`/alunos/${student.id}/edit`);
                                  }}
                                  className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all relative z-10"
                                >
                                  <Edit className="w-4 h-4 pointer-events-none" />
                                </button>
                                {canDelete && (
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      console.log('Botão de exclusão clicado para o aluno:', student.id);
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleDelete(student.id);
                                    }}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all relative z-10"
                                  >
                                    <Trash2 className="w-4 h-4 pointer-events-none" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">On Hold</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="size-2 rounded-full bg-slate-300" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inactive</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Page 1 of 1</span>
                    <div className="flex items-center gap-1">
                      <button className="h-8 w-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors" disabled>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-400 disabled:opacity-50 hover:bg-slate-50 transition-colors" disabled>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Student Profile */}
          <aside className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-hidden hidden xl:flex">
            <AnimatePresence mode="wait">
              {selectedStudent ? (
                <motion.div 
                  key={selectedStudent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col items-center text-center pb-8 border-b border-slate-100">
                      <div className="relative group mb-4">
                        <div 
                          className="size-24 rounded-2xl bg-slate-100 bg-cover bg-center shadow-lg ring-4 ring-slate-50"
                          style={{ backgroundImage: `url('${selectedStudent.avatar}')` }}
                        />
                        <span className="absolute bottom-1 right-1 size-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedStudent.name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Professional Certificate Student</p>
                      
                      <div className="flex items-center gap-2 mt-6 w-full">
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-primary/20">
                          <Mail className="w-4 h-4" />
                          Email
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-green-500/20">
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp
                        </button>
                      </div>
                    </div>

                    <div className="py-8 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Matrículas ({selectedStudent.enrollmentCount || 1})</h4>
                        {selectedStudent.enrollmentCount > 1 && (
                          <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded-full uppercase">Múltiplos Cursos</span>
                        )}
                      </div>
                      <div className="space-y-3">
                        {(selectedStudent.course || '').split(', ').map((courseName: string, idx: number) => (
                          <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-sm font-black text-slate-800">{courseName}</p>
                            <div className="mt-3">
                              <div className="flex justify-between text-[10px] font-black text-slate-600 mb-1.5">
                                <span>Progresso</span>
                                <span>{idx === 0 ? selectedStudent.progress : '0'}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${idx === 0 ? selectedStudent.progress : 0}%` }}
                                  className="h-full bg-primary rounded-full" 
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="py-8">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 3 Activities</h4>
                        <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View All</button>
                      </div>
                      <div className="space-y-5">
                        <div className="flex gap-4">
                          <div className="size-9 shrink-0 bg-blue-50 text-primary rounded-xl flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">Submitted Module 4 Quiz</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="size-9 shrink-0 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">Posted in Discussion Board</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">Yesterday, 4:15 PM</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="size-9 shrink-0 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 leading-tight">Completed Lesson: SEO Intro</p>
                            <p className="text-[10px] text-slate-400 mt-1 font-medium">Nov 12, 10:30 AM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <button 
                      onClick={() => router.push(`/alunos/${selectedStudent.id}`)}
                      className="w-full py-3 bg-white border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      View Full Profile
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="size-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Nenhum aluno selecionado</h3>
                  <p className="text-xs text-slate-500 mt-1">Selecione um aluno na lista para ver os detalhes do perfil.</p>
                </div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </main>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Excluir Aluno"
        description="Tem certeza que deseja excluir este aluno? Esta ação é irreversível e removerá todas as matrículas, notas e histórico associados."
        confirmLabel="Excluir Aluno"
      />
    </div>
  );
}


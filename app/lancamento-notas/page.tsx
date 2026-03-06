'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  Search, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  Users,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function LancamentoNotasPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [filterOptions, setFilterOptions] = React.useState({ courses: [] as any[], cycles: [] as string[], turmas: [] as string[] });
  const [selectedCourse, setSelectedCourse] = React.useState('');
  const [selectedCycle, setSelectedCycle] = React.useState('');
  const [selectedTurma, setSelectedTurma] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [message, setMessage] = React.useState({ type: '', text: '' });

  const fetchFilters = async () => {
    try {
      const res = await fetch('/api/filters/grade-entry');
      const data = await res.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (selectedCycle) params.append('cycle', selectedCycle);
      if (selectedTurma) params.append('turma', selectedTurma);
      
      const res = await fetch(`/api/enrollments?${params.toString()}`);
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFilters();
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [selectedCourse, selectedCycle, selectedTurma]);

  const handleUpdate = async (matriculaId: string, data: any) => {
    setSaving(matriculaId);
    setMessage({ type: '', text: '' });
    try {
      const response = await fetch(`/api/enrollments/${matriculaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Dados salvos com sucesso!' });
        fetchData(); // Refresh to get recalculated averages
      } else {
        setMessage({ type: 'error', text: 'Erro ao salvar dados.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão.' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const filteredStudents = students.filter(s => {
    const name = s.studentName || '';
    const id = s.id || '';
    
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Lançamento de Notas e Frequência" subtitle="Registro de desempenho acadêmico dos alunos" />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Filters */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curso</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all outline-none font-medium appearance-none"
                  >
                    <option value="">Todos os Cursos</option>
                    {filterOptions.courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciclo</label>
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={selectedCycle}
                    onChange={(e) => setSelectedCycle(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all outline-none font-medium appearance-none"
                  >
                    <option value="">Todos os Ciclos</option>
                    {filterOptions.cycles.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Turma</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    value={selectedTurma}
                    onChange={(e) => setSelectedTurma(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all outline-none font-medium appearance-none"
                  >
                    <option value="">Todas as Turmas</option>
                    {filterOptions.turmas.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Buscar Aluno</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Nome ou ID..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-3 text-sm focus:border-primary focus:ring-0 transition-all outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border",
                  message.type === 'success' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                )}
              >
                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </motion.div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aluno</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nota Final</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequência (%)</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-sm text-slate-400 font-medium">Carregando dados...</p>
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <p className="text-sm text-slate-400 font-medium">Nenhum aluno encontrado para os filtros selecionados.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <StudentRow 
                        key={student.id} 
                        student={student} 
                        onSave={(data) => handleUpdate(student.id, data)}
                        isSaving={saving === student.id}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StudentRow({ student, onSave, isSaving }: { student: any, onSave: (data: any) => void, isSaving: boolean }) {
  const [expanded, setExpanded] = React.useState(false);
  const [modules, setModules] = React.useState<any[]>([]);
  const [initialModules, setInitialModules] = React.useState<any[]>([]);
  const [loadingModules, setLoadingModules] = React.useState(false);
  const [data, setData] = React.useState({
    nota_final: student.grade || 0,
    frequencia_final: student.frequency || 0,
    progresso_percentual: student.progress || 0
  });

  const fetchModules = async () => {
    if (modules.length > 0) return;
    setLoadingModules(true);
    try {
      const res = await fetch(`/api/enrollments/${student.id}`);
      const enrollment = await res.json();
      const mods = enrollment.modules || [];
      setModules(mods);
      setInitialModules(JSON.parse(JSON.stringify(mods))); // Deep copy
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoadingModules(false);
    }
  };

  React.useEffect(() => {
    if (expanded) fetchModules();
  }, [expanded]);

  const handleModuleChange = (moduleId: string, field: string, value: number) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, [field]: value } : m));
  };

  const hasChanges = modules.some(m => {
    const original = initialModules.find((om: any) => om.id === m.id);
    return m.grade !== (original?.grade || 0) || m.frequency !== (original?.frequency || 0);
  }) || data.nota_final !== (student.grade || 0) || data.frequencia_final !== (student.frequency || 0);

  const handleSave = () => {
    onSave({
      ...data,
      moduleGrades: modules.map(m => ({
        moduleId: m.id,
        grade: m.grade,
        frequency: m.frequency
      }))
    });
  };

  return (
    <>
      <tr className="hover:bg-slate-50/50 transition-colors group">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform", expanded && "rotate-90")} />
            </button>
            <div 
              className="w-10 h-10 rounded-xl bg-slate-100 bg-cover bg-center border border-slate-200"
              style={{ backgroundImage: student.avatar ? `url('${student.avatar}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.studentName || 'User')}')` }}
            />
            <div>
              <p className="text-sm font-bold text-slate-900">{student.studentName}</p>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{student.courseName} • {student.cycle} • {student.turma}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-bold text-slate-900">
            {student.grade !== null ? student.grade.toFixed(1) : '-'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Média Automática</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-bold text-slate-900">
            {student.frequency !== null ? student.frequency.toFixed(0) : '-'}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Média Automática</div>
        </td>
        <td className="px-6 py-4 text-right">
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center justify-center ml-auto",
              hasChanges 
                ? "bg-primary text-white shadow-lg shadow-primary/20 hover:brightness-110" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={4} className="px-6 py-0 border-none">
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50/50 p-6 rounded-2xl mb-4 border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" /> Notas por Módulo
                  </h4>
                  
                  {loadingModules ? (
                    <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" /> Carregando módulos...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {modules.map(module => (
                        <div key={module.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                          <p className="text-xs font-bold text-slate-700 line-clamp-1">{module.title}</p>
                          <div className="flex gap-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Nota</label>
                              <input 
                                type="number" 
                                min="0" max="10" step="0.1"
                                value={module.grade || 0}
                                onChange={(e) => handleModuleChange(module.id, 'grade', parseFloat(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary outline-none"
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase">Freq (%)</label>
                              <input 
                                type="number" 
                                min="0" max="100"
                                value={module.frequency || 0}
                                onChange={(e) => handleModuleChange(module.id, 'frequency', parseFloat(e.target.value))}
                                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-xs font-bold focus:border-primary outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

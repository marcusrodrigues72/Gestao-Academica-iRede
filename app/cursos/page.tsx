'use client';

import * as React from 'react';
import Image from 'next/image';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  MoreVertical, 
  Plus, 
  Search, 
  Filter,
  ChevronRight,
  PlayCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  name: string;
  category: string;
  students: number;
  rating: number;
  duration: string;
  status: string;
  image: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchCourses = React.useCallback(async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        const response = await fetch(`/api/courses/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setCourses(prev => prev.filter(c => c.id !== id));
        } else {
          const data = await response.json();
          alert(`Erro ao excluir: ${data.error}`);
        }
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          title="Catálogo de Cursos" 
          subtitle="Gerencie a oferta acadêmica e trilhas de aprendizagem" 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl px-6 py-3 shadow-sm flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Cursos</span>
                    <span className="text-xl font-black text-slate-900">{courses.length}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alunos Ativos</span>
                    <span className="text-xl font-black text-slate-900">
                      {courses.reduce((acc, curr) => acc + curr.students, 0)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => router.push('/cursos/novo')}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Criar Novo Curso
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por título, instrutor ou categoria..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <select className="text-sm border-slate-200 rounded-2xl bg-white focus:ring-primary/20 py-3.5 pl-5 pr-12 font-bold text-slate-600 appearance-none cursor-pointer">
                  <option>Categoria: Todas</option>
                  <option>Tecnologia</option>
                  <option>Negócios</option>
                  <option>Design</option>
                  <option>Dados</option>
                </select>
                <button className="p-3.5 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200">
                  <Filter className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence>
                {filteredCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <Image 
                        src={course.image} 
                        alt={course.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
                          {course.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg leading-tight">{course.name}</h3>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Users className="w-4 h-4" />
                          <span className="text-xs font-semibold">{course.students} Alunos</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-xs font-bold">{course.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-medium">{course.duration}</span>
                        </div>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                          course.status === 'Ativo' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {course.status}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => router.push(`/cursos/${course.id}`)}
                          className="flex-1 bg-primary text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                          Detalhes
                        </button>
                        <button 
                          onClick={() => router.push(`/cursos/${course.id}/edit`)}
                          className="p-2.5 border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/30 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
                          className="p-2.5 border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex justify-center pt-8">
              <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400 disabled:opacity-50" disabled>
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20">1</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-600 font-bold">2</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-600 font-bold">3</button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 text-slate-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

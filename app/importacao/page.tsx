'use client';

import * as React from 'react';
import { Sidebar, TopBar } from '@/components/layout-components';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ChevronRight,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Search,
  X,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

type ImportType = 'Alunos' | 'Cursos' | 'Matrículas' | 'Indicadores';

export default function ImportPage() {
  const [selectedType, setSelectedType] = React.useState<ImportType>('Alunos');
  const [file, setFile] = React.useState<File | null>(null);
  const [rows, setRows] = React.useState<any[]>([]);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [mapping, setMapping] = React.useState<Record<string, string>>({});
  const [importing, setImporting] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<any>(null);
  const [courses, setCourses] = React.useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [offers, setOffers] = React.useState<any[]>([]);
  const [selectedOfferId, setSelectedOfferId] = React.useState('');
  const [loadingOffers, setLoadingOffers] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data));
  }, []);

  React.useEffect(() => {
    if (selectedCourseId) {
      setLoadingOffers(true);
      setSelectedOfferId('');
      fetch(`/api/courses/${selectedCourseId}/offers`)
        .then(res => res.json())
        .then(data => {
          setOffers(data);
          if (data.length > 0) {
            setSelectedOfferId(data[0].id);
          }
        })
        .finally(() => setLoadingOffers(false));
    } else {
      setOffers([]);
      setSelectedOfferId('');
    }
  }, [selectedCourseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file: File) => {
    setFile(file);
    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setHeaders(results.meta.fields || []);
          setRows(results.data);
          autoMap(results.meta.fields || []);
        }
      });
    } else {
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        if (jsonData.length > 0) {
          const keys = Object.keys(jsonData[0] as object);
          setHeaders(keys);
          setRows(jsonData);
          autoMap(keys);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const autoMap = (fileHeaders: string[]) => {
    const newMapping: Record<string, string> = {};
    const systemFields = getSystemFields(selectedType);
    
    systemFields.forEach(field => {
      const match = fileHeaders.find(h => 
        h.toLowerCase().includes(field.key.toLowerCase()) || 
        field.label.toLowerCase().includes(h.toLowerCase())
      );
      if (match) newMapping[field.key] = match;
    });
    
    setMapping(newMapping);
  };

  const getSystemFields = (type: ImportType) => {
    switch (type) {
      case 'Alunos':
        return [
          { key: 'nome', label: 'Nome do Aluno' },
          { key: 'cpf', label: 'CPF' },
          { key: 'email', label: 'E-mail Principal' },
          { key: 'identificador_externo', label: 'ID Externo' },
          { key: 'nome_social', label: 'Nome Social' },
          { key: 'rg', label: 'RG' },
          { key: 'data_nascimento', label: 'Data de Nascimento' },
          { key: 'sexo_genero', label: 'Sexo/Gênero' },
          { key: 'cor_raca', label: 'Cor/Raça' },
          { key: 'nacionalidade', label: 'Nacionalidade' },
          { key: 'naturalidade', label: 'Naturalidade' },
          { key: 'origem_registro', label: 'Origem do Registro' },
          { key: 'avatar', label: 'URL do Avatar' },
          { key: 'whatsapp', label: 'WhatsApp' },
          { key: 'telefone', label: 'Telefone' },
          { key: 'cep', label: 'CEP' },
          { key: 'estado', label: 'Estado' },
          { key: 'cidade', label: 'Cidade' },
          { key: 'bairro', label: 'Bairro' },
          { key: 'logradouro', label: 'Logradouro' },
          { key: 'numero', label: 'Número' },
          { key: 'complemento', label: 'Complemento' },
          { key: 'formacao_curso', label: 'Formação: Curso' },
          { key: 'formacao_instituicao', label: 'Formação: Instituição' },
          { key: 'formacao_status', label: 'Formação: Status' },
          { key: 'formacao_ano', label: 'Formação: Ano Conclusão' },
          { key: 'formacao_grau', label: 'Formação: Grau' },
          { key: 'formacao_titulacao', label: 'Formação: Titulação' }
        ];
      case 'Cursos':
        return [
          { key: 'nome_curso', label: 'Nome do Curso' },
          { key: 'programa', label: 'Programa' },
          { key: 'projeto', label: 'Projeto' },
          { key: 'tecnologia_objeto', label: 'Tecnologia' },
          { key: 'descricao', label: 'Descrição' },
          { key: 'identificador_externo', label: 'ID Externo Curso' },
          { key: 'codigo_oferta_externo', label: 'Cód. Oferta Externo' },
          { key: 'ciclo_edicao', label: 'Ciclo/Edição' },
          { key: 'ano', label: 'Ano' },
          { key: 'semestre', label: 'Semestre' },
          { key: 'turma', label: 'Turma' },
          { key: 'trilha', label: 'Trilha' },
          { key: 'responsavel_tipo', label: 'Tipo Responsável' },
          { key: 'responsavel_nome', label: 'Nome Responsável' },
          { key: 'data_inicio', label: 'Data Início' },
          { key: 'data_fim', label: 'Data Fim' }
        ];
      case 'Matrículas':
        return [
          { key: 'aluno_id', label: 'ID do Aluno' },
          { key: 'oferta_id', label: 'ID da Oferta' },
          { key: 'classificacao', label: 'Classificação' },
          { key: 'status_matricula', label: 'Status Matrícula' },
          { key: 'confirmacao_matricula', label: 'Confirmação' },
          { key: 'situacao_final', label: 'Situação Final' },
          { key: 'frequencia_final', label: 'Frequência Final' },
          { key: 'nota_final', label: 'Nota Final' },
          { key: 'progresso_percentual', label: 'Progresso (%)' },
          { key: 'data_insercao', label: 'Data Inserção' },
          { key: 'ultimo_acesso', label: 'Último Acesso' }
        ];
      case 'Indicadores':
        return [
          { key: 'matricula_id', label: 'ID da Matrícula' },
          { key: 'categoria', label: 'Categoria' },
          { key: 'subcategoria', label: 'Subcategoria' },
          { key: 'plataforma', label: 'Plataforma' },
          { key: 'valor_numero', label: 'Valor Numérico' },
          { key: 'valor_texto', label: 'Valor Texto' },
          { key: 'data_referencia', label: 'Data Referência' }
        ];
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          rows,
          mapping,
          courseId: selectedCourseId,
          offerId: selectedOfferId
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setProgress(100);
      } else {
        alert('Erro ao importar dados');
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert('Erro na importação');
    } finally {
      setImporting(false);
    }
  };

  const types = [
    { id: 'Alunos', icon: Users, label: 'Alunos' },
    { id: 'Cursos', icon: BookOpen, label: 'Cursos' },
    { id: 'Matrículas', icon: ClipboardList, label: 'Matrículas' },
    { id: 'Indicadores', icon: BarChart3, label: 'Indicadores' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Importação de Dados" 
          subtitle="Atualize sua base de dados enviando arquivos CSV ou Excel." 
        />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="col-span-12 lg:col-span-8 space-y-8">
              <div className="flex flex-col gap-1">
                <nav className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider mb-2">
                  <span>Início</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-primary font-bold">Importação de Dados</span>
                </nav>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Importação de Dados de Planilhas</h1>
                <p className="text-slate-500">Atualize sua base de dados enviando arquivos CSV ou Excel de forma estruturada.</p>
              </div>

              {/* Step 1: Type Selection */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/20">1</span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Selecione o Tipo de Dados</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {types.map((type) => (
                    <button 
                      key={type.id}
                      onClick={() => setSelectedType(type.id as ImportType)}
                      className={cn(
                        "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all group",
                        selectedType === type.id 
                          ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                          : "border-slate-100 hover:border-primary/30 text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <type.icon className={cn("w-8 h-8 mb-3 transition-transform group-hover:scale-110", selectedType === type.id ? "text-primary" : "text-slate-300")} />
                      <span className="font-black text-xs uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
                </div>

                {selectedType === 'Alunos' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-8 pt-8 border-t border-slate-100"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Matrícula Automática (Opcional)</h3>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Selecione um curso e ciclo para matricular automaticamente todos os alunos importados.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Curso</label>
                          <select 
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                          >
                            <option value="">Apenas importar alunos (sem matrícula)</option>
                            {courses.map(course => (
                              <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {selectedCourseId && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ciclo / Oferta</label>
                            <select 
                              value={selectedOfferId}
                              onChange={(e) => setSelectedOfferId(e.target.value)}
                              disabled={loadingOffers}
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold focus:border-primary focus:ring-0 transition-all outline-none disabled:opacity-50"
                            >
                              {loadingOffers ? (
                                <option>Carregando ciclos...</option>
                              ) : offers.length === 0 ? (
                                <option value="">Nenhum ciclo encontrado</option>
                              ) : (
                                offers.map(offer => (
                                  <option key={offer.id} value={offer.id}>
                                    {offer.cycle || `Ciclo ${offer.year}.${offer.semester}`} - {offer.class || 'Sem Turma'}
                                  </option>
                                ))
                              )}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>

              {/* Step 2: Upload Zone */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/20">2</span>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Upload do Arquivo</h2>
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer group",
                    file ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-primary/30"
                  )}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".csv,.xls,.xlsx" 
                    onChange={handleFileChange}
                  />
                  <div className={cn(
                    "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-sm",
                    file ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary"
                  )}>
                    {file ? <CheckCircle2 className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {file ? file.name : 'Arraste e solte o arquivo aqui'}
                  </h3>
                  <p className="text-slate-400 text-sm font-bold mb-6">Suporta arquivos .CSV, .XLS ou .XLSX até 10MB</p>
                  <button className="bg-primary hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all">
                    {file ? 'Trocar Arquivo' : 'Selecionar Arquivo'}
                  </button>
                </div>
              </section>

              {/* Step 3: Column Mapping */}
              <AnimatePresence>
                {file && rows.length > 0 && (
                  <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-black text-sm shadow-lg shadow-primary/20">3</span>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Mapeamento de Colunas</h2>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-4 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-widest">
                        <CheckCircle2 className="w-3 h-3" />
                        Arquivo detectado: {file.name}
                      </span>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-2xl">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coluna do Arquivo</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exemplo do Dado</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Campo do Sistema</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {getSystemFields(selectedType).map((field) => (
                            <tr key={field.key} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-6 py-5 text-sm font-bold text-slate-600">{mapping[field.key] || 'Não mapeado'}</td>
                              <td className="px-6 py-5 italic text-slate-400 text-sm">
                                {rows[0]?.[mapping[field.key]] ? `"${rows[0][mapping[field.key]]}"` : '-'}
                              </td>
                              <td className="px-6 py-5">
                                <select 
                                  value={mapping[field.key] || ''}
                                  onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                                >
                                  <option value="">Selecione a coluna...</option>
                                  {headers.map(h => (
                                    <option key={h} value={h}>{h}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                          {importing ? `Processando: ${progress}%` : result ? 'Importação Concluída' : 'Aguardando validação'}
                        </span>
                        <span className="text-xs font-black text-primary uppercase tracking-widest">
                          {importing ? 'Importando...' : result ? `${result.success} registros importados` : 'Pronto para importar'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mb-8 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className="bg-primary h-full rounded-full transition-all duration-300"
                        />
                      </div>
                      
                      <div className="flex justify-end gap-4">
                        <button 
                          onClick={() => {
                            setFile(null);
                            setRows([]);
                            setResult(null);
                          }}
                          className="px-8 py-3 rounded-2xl border border-slate-200 text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleImport}
                          disabled={importing || result}
                          className="bg-primary hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Validar e Importar Dados
                        </button>
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column: Templates */}
            <aside className="col-span-12 lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-24">
                <div className="flex flex-col mb-8">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Modelos de Planilha</h2>
                  <p className="text-sm text-slate-400 font-bold mt-2">Baixe o template correto para evitar erros de mapeamento automático.</p>
                </div>
                
                <div className="space-y-3">
                  {[
                    { label: 'Template: Alunos', format: 'XLSX' },
                    { label: 'Template: Cursos/Ofertas', format: 'XLSX' },
                    { label: 'Template: Matrículas', format: 'CSV' },
                    { label: 'Template: Indicadores', format: 'CSV' },
                  ].map((template, i) => (
                    <button 
                      key={i}
                      className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:bg-slate-50 hover:border-primary/20 group transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-primary group-hover:scale-110 transition-transform">
                          <Download className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{template.label}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300">{template.format}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-10 p-6 rounded-3xl bg-primary/5 border border-primary/10">
                  <div className="flex gap-4">
                    <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                    <div className="flex flex-col gap-2">
                      <p className="text-xs font-black text-primary uppercase tracking-widest">Dica de Importação</p>
                      <p className="text-xs text-primary/70 leading-relaxed font-bold">
                        Certifique-se que o CPF não possui caracteres especiais para acelerar a validação do sistema.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

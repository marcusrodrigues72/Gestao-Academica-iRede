import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'database.sqlite');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Register PostgreSQL-like functions for compatibility
db.function('gen_random_uuid', () => uuidv4());
db.function('now', () => new Date().toISOString());

// Initialize schema
const schema = `
-- =========================
-- ALUNO
-- =========================
CREATE TABLE IF NOT EXISTS aluno (
  aluno_id               TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  identificador_externo  TEXT,
  nome                   TEXT NOT NULL,
  nome_social            TEXT,
  cpf                    TEXT NOT NULL,
  rg                     TEXT,
  data_nascimento        TEXT,
  sexo_genero            TEXT,
  cor_raca               TEXT,
  nacionalidade          TEXT,
  naturalidade           TEXT,
  data_cadastro          TEXT NOT NULL DEFAULT (now()),
  origem_registro        TEXT,
  avatar                 TEXT,
  CONSTRAINT uq_aluno_cpf UNIQUE (cpf)
);

CREATE INDEX IF NOT EXISTS idx_aluno_nome ON aluno (nome);
CREATE INDEX IF NOT EXISTS idx_aluno_identificador_externo ON aluno (identificador_externo);

-- =========================
-- CONTATO DO ALUNO (múltiplos contatos)
-- =========================
CREATE TABLE IF NOT EXISTS contato_aluno (
  contato_id     TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  aluno_id       TEXT NOT NULL REFERENCES aluno(aluno_id) ON DELETE CASCADE,
  tipo           TEXT NOT NULL, -- email_principal, email_reserva, email_homero, telefone, celular, whatsapp...
  valor          TEXT NOT NULL,
  principal      BOOLEAN NOT NULL DEFAULT 0,
  criado_em      TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_contato_aluno_aluno_id ON contato_aluno (aluno_id);
CREATE INDEX IF NOT EXISTS idx_contato_aluno_tipo ON contato_aluno (tipo);

-- Garante que cada aluno tenha apenas um contato de cada tipo (ex.: 1 email_principal, 1 whatsapp)
CREATE UNIQUE INDEX IF NOT EXISTS uq_contato_aluno_tipo
ON contato_aluno (aluno_id, tipo);

-- =========================
-- ENDEREÇO DO ALUNO
-- =========================
CREATE TABLE IF NOT EXISTS endereco_aluno (
  endereco_id    TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  aluno_id       TEXT NOT NULL REFERENCES aluno(aluno_id) ON DELETE CASCADE,
  cep            TEXT,
  estado         TEXT,
  cidade         TEXT,
  bairro         TEXT,
  logradouro     TEXT,
  numero         TEXT,
  complemento    TEXT,
  criado_em      TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_endereco_aluno_aluno_id ON endereco_aluno (aluno_id);
CREATE INDEX IF NOT EXISTS idx_endereco_estado_cidade ON endereco_aluno (estado, cidade);

-- =========================
-- FORMAÇÃO ACADÊMICA (pode haver mais de uma)
-- =========================
CREATE TABLE IF NOT EXISTS formacao_academica_aluno (
  formacao_id         TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  aluno_id            TEXT NOT NULL REFERENCES aluno(aluno_id) ON DELETE CASCADE,
  curso               TEXT,   -- formação declarada (ex.: graduação)
  instituicao         TEXT,
  status_curso        TEXT,   -- cursando/concluído/etc.
  ano_conclusao       INTEGER,
  grau_instrucao      TEXT,
  titulacao           TEXT,
  criado_em           TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_formacao_aluno_aluno_id ON formacao_academica_aluno (aluno_id);

-- =========================
-- CURSO (catálogo)
-- =========================
CREATE TABLE IF NOT EXISTS curso (
  curso_id           TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  identificador_externo TEXT,
  nome_curso         TEXT NOT NULL,
  programa           TEXT NOT NULL,  -- residência, capacitação etc.
  projeto            TEXT NOT NULL,  -- obrigatório
  tecnologia_objeto  TEXT NOT NULL,  -- obrigatório
  descricao          TEXT,
  criado_em          TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_curso_nome ON curso (nome_curso);
CREATE INDEX IF NOT EXISTS idx_curso_projeto_tecnologia ON curso (projeto, tecnologia_objeto);
CREATE INDEX IF NOT EXISTS idx_curso_identificador_externo ON curso (identificador_externo);

-- Evita duplicidade grosseira no catálogo
CREATE UNIQUE INDEX IF NOT EXISTS uq_curso_nome_programa_projeto_tecnologia
ON curso (nome_curso, programa, projeto, tecnologia_objeto);

-- =========================
-- MÓDULOS DO CURSO
-- =========================
CREATE TABLE IF NOT EXISTS modulo_curso (
  modulo_id   TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  curso_id    TEXT NOT NULL REFERENCES curso(curso_id) ON DELETE CASCADE,
  titulo      TEXT NOT NULL,
  ordem       INTEGER NOT NULL DEFAULT 0,
  criado_em   TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_modulo_curso_id ON modulo_curso (curso_id);

-- =========================
-- OFERTA/TURMA (edição do curso)
-- =========================
CREATE TABLE IF NOT EXISTS oferta_turma (
  oferta_id             TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  curso_id              TEXT NOT NULL REFERENCES curso(curso_id) ON DELETE RESTRICT,
  codigo_oferta_externo TEXT,  -- ex.: Id | Curso
  ciclo_edicao          TEXT,  -- ex.: Ciclo 2 - 2026
  ano                   INTEGER,
  semestre              INTEGER,
  turma                 TEXT,
  trilha                TEXT,
  responsavel_tipo      TEXT,  -- mentor/professor
  responsavel_nome      TEXT,
  data_inicio           TEXT,
  data_fim              TEXT,
  criado_em             TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_oferta_curso_id ON oferta_turma (curso_id);
CREATE INDEX IF NOT EXISTS idx_oferta_ano_semestre ON oferta_turma (ano, semestre);
CREATE INDEX IF NOT EXISTS idx_oferta_codigo_externo ON oferta_turma (codigo_oferta_externo);

-- =========================
-- MATRÍCULA (vínculo aluno x oferta)
-- =========================
CREATE TABLE IF NOT EXISTS matricula (
  matricula_id          TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  aluno_id              TEXT NOT NULL REFERENCES aluno(aluno_id) ON DELETE CASCADE,
  oferta_id             TEXT NOT NULL REFERENCES oferta_turma(oferta_id) ON DELETE CASCADE,
  classificacao         TEXT,
  status_matricula      TEXT NOT NULL, -- inscrito, matriculado, ativo, evadido, concluído...
  confirmacao_matricula BOOLEAN,
  situacao_final        TEXT,          -- aprovado, reprovado, em andamento etc.
  recuperacao           TEXT,
  re_flag               BOOLEAN,
  frequencia_final      REAL,   -- 0..100 (percentual)
  nota_final            REAL,   -- 0..10 ou 0..100 conforme padrão adotado
  progresso_percentual  REAL,   -- 0..100
  data_insercao         TEXT,
  ultimo_acesso         TEXT,
  criado_em             TEXT NOT NULL DEFAULT (now())
);

CREATE INDEX IF NOT EXISTS idx_matricula_aluno_id ON matricula (aluno_id);
CREATE INDEX IF NOT EXISTS idx_matricula_oferta_id ON matricula (oferta_id);
CREATE INDEX IF NOT EXISTS idx_matricula_status ON matricula (status_matricula);

-- Evita duplicidade: um aluno não deve ter duas matrículas na mesma oferta
CREATE UNIQUE INDEX IF NOT EXISTS uq_matricula_aluno_oferta
ON matricula (aluno_id, oferta_id);

-- =========================
-- INDICADORES (flexível: notas por U1/U2, temas, frequência, progresso, status etc.)
-- =========================
CREATE TABLE IF NOT EXISTS indicador_matricula (
  indicador_id     TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  matricula_id     TEXT NOT NULL REFERENCES matricula(matricula_id) ON DELETE CASCADE,
  categoria        TEXT NOT NULL,      -- nota, frequencia, progresso, status, atividade
  subcategoria     TEXT,               -- U1, U2, Blockchain, Metaverso, SmartContracts...
  plataforma       TEXT,               -- Homero, Classroom, etc.
  valor_numero     REAL,
  valor_texto      TEXT,
  data_referencia  TEXT,
  criado_em        TEXT NOT NULL DEFAULT (now()),
  CONSTRAINT chk_valor_pelo_menos_um CHECK (valor_numero IS NOT NULL OR valor_texto IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_indicador_matricula_id ON indicador_matricula (matricula_id);
CREATE INDEX IF NOT EXISTS idx_indicador_categoria ON indicador_matricula (categoria);
CREATE INDEX IF NOT EXISTS idx_indicador_subcategoria ON indicador_matricula (subcategoria);
CREATE INDEX IF NOT EXISTS idx_indicador_plataforma ON indicador_matricula (plataforma);

-- Opcional: evita duplicar o mesmo indicador no mesmo dia para a mesma subcategoria/plataforma
CREATE UNIQUE INDEX IF NOT EXISTS uq_indicador_unico_por_ref
ON indicador_matricula (matricula_id, categoria, COALESCE(subcategoria,''), COALESCE(plataforma,''), COALESCE(data_referencia, '1970-01-01'));

-- =========================
-- NOTAS POR MÓDULO
-- =========================
CREATE TABLE IF NOT EXISTS nota_modulo_matricula (
  matricula_id  TEXT NOT NULL REFERENCES matricula(matricula_id) ON DELETE CASCADE,
  modulo_id     TEXT NOT NULL REFERENCES modulo_curso(modulo_id) ON DELETE CASCADE,
  nota          REAL,
  frequencia    REAL,
  criado_em     TEXT NOT NULL DEFAULT (now()),
  PRIMARY KEY (matricula_id, modulo_id)
);

-- =========================
-- USUÁRIO (Controle de Acesso)
-- =========================
CREATE TABLE IF NOT EXISTS usuario (
  usuario_id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
  nome       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  senha      TEXT NOT NULL,
  role       TEXT NOT NULL CHECK(role IN ('administrador', 'gestor', 'professor', 'mentor')),
  avatar     TEXT,
  criado_em  TEXT NOT NULL DEFAULT (now())
);

`;

db.exec(schema);

// Migration: Add identificador_externo to curso if missing
const tableInfo = db.prepare("PRAGMA table_info(curso)").all() as any[];
const hasExternalId = tableInfo.some(col => col.name === 'identificador_externo');
if (!hasExternalId) {
  db.exec("ALTER TABLE curso ADD COLUMN identificador_externo TEXT");
}

// Migration: Add plataforma to nota_modulo_matricula if missing
const notaModuloInfo = db.prepare("PRAGMA table_info(nota_modulo_matricula)").all() as any[];
const hasPlataforma = notaModuloInfo.some(col => col.name === 'plataforma');
if (!hasPlataforma) {
  db.exec("ALTER TABLE nota_modulo_matricula ADD COLUMN plataforma TEXT");
}

// Seed initial data if empty
const alunoCount = db.prepare('SELECT COUNT(*) as count FROM aluno').get() as { count: number };
if (alunoCount.count === 0) {
  const initialStudents = [
    { id: 'ST-8821', name: 'Alex Johnson', email: 'alex.j@example.com', course: 'Digital Marketing', progress: 65, status: 'Ativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFw7C12upUllg6DeLoee2aTfkNniT8jWiy1yhaGRQt_eX0HfoHlLUxkwJjM4LEIjIy1Zt0dEWShI_xcbD0apvs5grfV3Un3Rx3SIbSF4a1xk_Rb4G4vmgaJmNQ2DLM-_nGf_mKe3hlDDo4aWx7LHqsxj0CIVopnVcsFTGmaqK5ErI7NqEZSdPtxBhSX9tkYWDudzGu_631I4cuG-G_6WmGrv5jyrRJ0Hih3I643l1Vj5-U2cfGuwtWDWku_qv35M3mhLIBh0VoTuM', city: 'São Paulo', state: 'SP' },
    { id: 'ST-9012', name: 'Maria Garcia', email: 'm.garcia@univ.edu', course: 'Data Science', progress: 85, status: 'On Hold', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClUy6zgorEGMpOtZ4z5W3GjN_lPsK1KkbMO8CfHg0U2fOSJ3TFB3Wq176F1vL_cRM--d-ZM5-LCp8g39svbN6P3km1b7hCeL2_WDS5VVVjuW_sWHV5qBx3ko8ubgJpPNfbRG0gttsImb11T4eRiHcmerb8P9JKMLB7Ga9o_RxclJJCHVSWyWAWHfqRy_DdCdXvUEW5SdYx50wj7VuyDlVM-nuZPaG9TI6tysC-X8qggPZ_qXpLsjnk-vaPdQECqE8YQLqr-C8JcQ4', city: 'Rio de Janeiro', state: 'RJ' },
    { id: 'ST-7734', name: 'James Smith', email: 'jsmith@domain.com', course: 'UX Masterclass', progress: 92, status: 'Ativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARziGcsPEt_r07OLwZcKF9DIsTB4jgfPC9ocBf0y3KDlV0BicDGzDnreSnSCPNeTSVu8RGdKo5feMUoQy_BmWz3tt1RoTpkn4evC2LKABQcI2TPH6Yfdji1ig6D6N8cKx8FWRFnT2cv5va92rny7zvdatKW7y0smxkqJuhFK2u3EWVAhzTymjd82iMnKq9hK35QkST8ZcRFhkQjFxXbf02uULAfrnZ8EHFSOBP8sjNvVQFQWPDZRznWAz2YZD1CgDBQYR7YNF7iwc', city: 'Belo Horizonte', state: 'MG' },
    { id: 'ST-8109', name: 'Sarah Chen', email: 'schen@global.net', course: 'Python Basics', progress: 10, status: 'Inativo', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA43NQHFo7C1jPDxn80g4shGmLrhtuw7OrMDIP5rUlQeHrdPOyWu037hnpz_NTd-NwkRYIxJcEDFddy6YvzDt8_BBQQ1XxDfVV0iF_uWgdGfUak3PYyaZYRkz1E3kWdopOA6N3uvVBdhBssAxwUMC_hKHoWURqkSZUEWeaC7aMZpmdGEAP9CSH_jd2cR0GVaFfCfAZMnahKI4q6zjETGJyegTXxPMKYipIQfdZqIxe8xHieRbaJzJvQezbEeDyBFpWv5eyZbWpgMw4', city: 'Curitiba', state: 'PR' },
    { id: 'ST-1234', name: 'João Silva', email: 'joao@example.com', course: 'Blockchain para Negócios', progress: 45, status: 'Ativo', avatar: 'https://picsum.photos/seed/joao/200', city: 'Recife', state: 'PE' },
    { id: 'ST-5678', name: 'Ana Souza', email: 'ana@example.com', course: 'Inteligência Artificial', progress: 78, status: 'Ativo', avatar: 'https://picsum.photos/seed/ana/200', city: 'Fortaleza', state: 'CE' },
    { id: 'ST-9999', name: 'Pedro Lima', email: 'pedro@example.com', course: 'Cibersegurança', progress: 30, status: 'Ativo', avatar: 'https://picsum.photos/seed/pedro/200', city: 'Manaus', state: 'AM' },
  ];

  const insertAluno = db.prepare('INSERT OR IGNORE INTO aluno (aluno_id, nome, cpf, avatar) VALUES (?, ?, ?, ?)');
  const insertContato = db.prepare('INSERT OR IGNORE INTO contato_aluno (aluno_id, tipo, valor, principal) VALUES (?, ?, ?, ?)');
  const insertEndereco = db.prepare('INSERT OR IGNORE INTO endereco_aluno (aluno_id, cidade, estado) VALUES (?, ?, ?)');
  const insertCurso = db.prepare('INSERT OR IGNORE INTO curso (curso_id, nome_curso, programa, projeto, tecnologia_objeto) VALUES (?, ?, ?, ?, ?)');
  const insertOferta = db.prepare('INSERT OR IGNORE INTO oferta_turma (oferta_id, curso_id, turma, ciclo_edicao) VALUES (?, ?, ?, ?)');
  const insertMatricula = db.prepare('INSERT OR IGNORE INTO matricula (aluno_id, oferta_id, status_matricula, progresso_percentual, nota_final, frequencia_final) VALUES (?, ?, ?, ?, ?, ?)');

  const techMap: any = {
    'Digital Marketing': 'Marketing Digital',
    'Data Science': 'Inteligência Artificial',
    'UX Masterclass': 'UX Design Avançado',
    'Python Basics': 'Cloud Computing',
    'Blockchain para Negócios': 'Blockchain & Web3',
    'Inteligência Artificial': 'Inteligência Artificial',
    'Cibersegurança': 'Cibersegurança'
  };

  for (const s of initialStudents) {
    const alunoId = s.id;
    const cpf = `000.000.000-${Math.floor(10 + Math.random() * 89)}`;
    
    // 1. Aluno
    insertAluno.run(alunoId, s.name, cpf, s.avatar);
    
    // 2. Contato e Endereço (vinculados ao alunoId)
    insertContato.run(alunoId, 'email_principal', s.email, 1);
    insertEndereco.run(alunoId, s.city, s.state);
    
    // 3. Curso (Verificar se já existe para evitar falha de FK na Oferta)
    const programa = 'Tecnologia';
    const projeto = 'iRede';
    const tecnologia = techMap[s.course] || 'Geral';
    
    let cursoId: string;
    const existingCurso = db.prepare('SELECT curso_id FROM curso WHERE nome_curso = ? AND programa = ? AND projeto = ? AND tecnologia_objeto = ?')
      .get(s.course, programa, projeto, tecnologia) as { curso_id: string } | undefined;
    
    if (existingCurso) {
      cursoId = existingCurso.curso_id;
    } else {
      cursoId = uuidv4();
      insertCurso.run(cursoId, s.course, programa, projeto, tecnologia);
    }
    
    // 4. Oferta (Verificar se já existe para este curso e turma)
    const turma = 'Turma A';
    const ciclo = '2024.1';
    
    let ofertaId: string;
    const existingOferta = db.prepare('SELECT oferta_id FROM oferta_turma WHERE curso_id = ? AND turma = ? AND ciclo_edicao = ?')
      .get(cursoId, turma, ciclo) as { oferta_id: string } | undefined;
      
    if (existingOferta) {
      ofertaId = existingOferta.oferta_id;
    } else {
      ofertaId = uuidv4();
      insertOferta.run(ofertaId, cursoId, turma, ciclo);
    }
    
    // 5. Matrícula
    const notaFinal = s.progress < 50 ? 4.2 : 8.5;
    const freqFinal = s.progress < 50 ? 65 : 95;
    insertMatricula.run(alunoId, ofertaId, s.status, s.progress, notaFinal, freqFinal);
  }
}

// Seed initial admin user if no users exist
const userCount = db.prepare('SELECT COUNT(*) as count FROM usuario').get() as { count: number };
console.log('Current user count in DB:', userCount.count);
if (userCount.count === 0) {
  console.log('Seeding initial admin user...');
  const adminId = uuidv4();
  db.prepare('INSERT OR IGNORE INTO usuario (usuario_id, nome, email, senha, role) VALUES (?, ?, ?, ?, ?)').run(
    adminId,
    'Administrador',
    'admin@academico.com',
    'admin123',
    'administrador'
  );
  console.log('Admin user seeded successfully.');
}

export default db;

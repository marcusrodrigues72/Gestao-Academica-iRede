import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const courses = db.prepare(`
    SELECT 
      c.curso_id as id,
      c.identificador_externo as externalId,
      c.nome_curso as name,
      c.programa as category,
      c.projeto as project,
      c.tecnologia_objeto as technology,
      c.descricao as description,
      (SELECT COUNT(*) FROM matricula m JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id WHERE ot.curso_id = c.curso_id) as students,
      4.8 as rating, -- Mock rating as it's not in DB
      '120h' as duration, -- Mock duration as it's not in DB
      'Ativo' as status,
      'https://picsum.photos/seed/' || c.curso_id || '/800/600' as image
    FROM curso c
  `).all();
  
  return NextResponse.json(courses);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const cursoId = uuidv4();
  const ofertaId = uuidv4();

  const transaction = db.transaction(() => {
    // 1. Insert Curso
    db.prepare(`
      INSERT INTO curso (
        curso_id, identificador_externo, nome_curso, programa, projeto, tecnologia_objeto, descricao
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      cursoId,
      data.externalId || null,
      data.name,
      data.category || 'Tecnologia',
      data.project || 'iRede',
      data.technology || 'Web',
      data.description || null
    );

    // 2. Insert Oferta
    db.prepare(`
      INSERT INTO oferta_turma (
        oferta_id, curso_id, codigo_oferta_externo, ciclo_edicao, ano, semestre, turma, trilha, responsavel_tipo, responsavel_nome, data_inicio, data_fim
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ofertaId,
      cursoId,
      data.offerExternalId || null,
      data.cycle || null,
      data.year ? parseInt(data.year) : new Date().getFullYear(),
      data.semester ? parseInt(data.semester) : 1,
      data.class || null,
      data.track || null,
      data.responsibleType || 'Professor',
      data.responsibleName || null,
      data.startDate || null,
      data.endDate || null
    );
    // 3. Insert Modules
    if (data.modules && Array.isArray(data.modules)) {
      const insertModule = db.prepare(`
        INSERT INTO modulo_curso (modulo_id, curso_id, titulo, ordem)
        VALUES (?, ?, ?, ?)
      `);
      data.modules.forEach((mod: any, index: number) => {
        insertModule.run(uuidv4(), cursoId, mod.title, index);
      });
    }
  });

  transaction();

  return NextResponse.json({ id: cursoId, success: true });
}

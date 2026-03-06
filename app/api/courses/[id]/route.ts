import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const course = db.prepare(`
    SELECT 
      c.curso_id as id,
      c.identificador_externo as externalId,
      c.nome_curso as name,
      c.programa as category,
      c.projeto as project,
      c.tecnologia_objeto as technology,
      c.descricao as description,
      ot.oferta_id as offerId,
      ot.codigo_oferta_externo as offerExternalId,
      ot.ciclo_edicao as cycle,
      ot.ano as year,
      ot.semestre as semester,
      ot.turma as class,
      ot.trilha as track,
      ot.responsavel_tipo as responsibleType,
      ot.responsavel_nome as responsibleName,
      ot.data_inicio as startDate,
      ot.data_fim as endDate
    FROM curso c
    LEFT JOIN oferta_turma ot ON c.curso_id = ot.curso_id
    WHERE c.curso_id = ?
    ORDER BY ot.criado_em DESC
    LIMIT 1
  `).get(id) as any;
  
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Restructure to include offer object if it exists
  if (course.offerId) {
    course.offer = {
      id: course.offerId,
      externalId: course.offerExternalId,
      cycle: course.cycle,
      year: course.year,
      semester: course.semester,
      class: course.class,
      track: course.track,
      responsibleType: course.responsibleType,
      responsibleName: course.responsibleName,
      startDate: course.startDate,
      endDate: course.endDate
    };
  }

  // Fetch modules
  const modules = db.prepare(`
    SELECT modulo_id as id, titulo as title, ordem as [order]
    FROM modulo_curso
    WHERE curso_id = ?
    ORDER BY ordem ASC
  `).all(id);

  course.modules = modules;
  
  return NextResponse.json(course);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const transaction = db.transaction(() => {
    // 1. Update Curso
    db.prepare(`
      UPDATE curso SET 
        identificador_externo = ?,
        nome_curso = ?,
        programa = ?,
        projeto = ?,
        tecnologia_objeto = ?,
        descricao = ?
      WHERE curso_id = ?
    `).run(
      data.externalId || null,
      data.name,
      data.category,
      data.project,
      data.technology,
      data.description || null,
      id
    );

    // 2. Update latest Oferta or create one if none exists
    const latestOffer = db.prepare('SELECT oferta_id FROM oferta_turma WHERE curso_id = ? ORDER BY criado_em DESC LIMIT 1').get(id) as { oferta_id: string } | undefined;
    
    if (latestOffer) {
      db.prepare(`
        UPDATE oferta_turma SET 
          codigo_oferta_externo = ?,
          ciclo_edicao = ?,
          ano = ?,
          semestre = ?,
          turma = ?,
          trilha = ?,
          responsavel_tipo = ?,
          responsavel_nome = ?,
          data_inicio = ?,
          data_fim = ?
        WHERE oferta_id = ?
      `).run(
        data.offerExternalId || null,
        data.cycle || null,
        data.year ? parseInt(data.year) : null,
        data.semester ? parseInt(data.semester) : null,
        data.class || null,
        data.track || null,
        data.responsibleType || null,
        data.responsibleName || null,
        data.startDate || null,
        data.endDate || null,
        latestOffer.oferta_id
      );
    }

    // 3. Update Modules
    if (data.modules && Array.isArray(data.modules)) {
      // Get existing modules to know what to delete
      const existingModules = db.prepare('SELECT modulo_id FROM modulo_curso WHERE curso_id = ?').all(id) as { modulo_id: string }[];
      const incomingModuleIds = data.modules.filter((m: any) => m.id).map((m: any) => m.id);
      
      const modulesToDelete = existingModules.filter(em => !incomingModuleIds.includes(em.modulo_id));
      
      if (modulesToDelete.length > 0) {
        const deleteModule = db.prepare('DELETE FROM modulo_curso WHERE modulo_id = ?');
        modulesToDelete.forEach(m => deleteModule.run(m.modulo_id));
      }

      const insertModule = db.prepare(`
        INSERT INTO modulo_curso (modulo_id, curso_id, titulo, ordem)
        VALUES (?, ?, ?, ?)
      `);
      
      const updateModule = db.prepare(`
        UPDATE modulo_curso SET titulo = ?, ordem = ?
        WHERE modulo_id = ?
      `);

      data.modules.forEach((mod: any, index: number) => {
        if (mod.id) {
          updateModule.run(mod.title, index, mod.id);
        } else {
          insertModule.run(uuidv4(), id, mod.title, index);
        }
      });
    }
  });

  transaction();

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    // Note: Better-sqlite3 doesn't support cascading deletes automatically if not configured in the schema with PRAGMA foreign_keys = ON;
    // But our schema has ON DELETE RESTRICT for oferta_turma -> curso.
    // So we need to delete offers first or handle the error.
    
    const transaction = db.transaction(() => {
      db.prepare('DELETE FROM oferta_turma WHERE curso_id = ?').run(id);
      db.prepare('DELETE FROM curso WHERE curso_id = ?').run(id);
    });
    
    transaction();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

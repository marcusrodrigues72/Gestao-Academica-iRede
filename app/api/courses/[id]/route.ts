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
      c.descricao as description
    FROM curso c
    WHERE c.curso_id = ?
  `).get(id) as any;
  
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Fetch all cycles (offers)
  const cycles = db.prepare(`
    SELECT 
      oferta_id as id,
      codigo_oferta_externo as externalId,
      ciclo_edicao as cycle,
      ano as year,
      semestre as semester,
      turma as class,
      trilha as track,
      responsavel_tipo as responsibleType,
      responsavel_nome as responsibleName,
      data_inicio as startDate,
      data_fim as endDate
    FROM oferta_turma
    WHERE curso_id = ?
    ORDER BY criado_em ASC
  `).all(id);

  course.cycles = cycles;

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

    // 2. Sync Cycles (Offers)
    if (data.cycles && Array.isArray(data.cycles)) {
      const existingCycles = db.prepare('SELECT oferta_id FROM oferta_turma WHERE curso_id = ?').all(id) as { oferta_id: string }[];
      const incomingCycleIds = data.cycles.filter((c: any) => c.id).map((c: any) => c.id);
      
      const cyclesToDelete = existingCycles.filter(ec => !incomingCycleIds.includes(ec.oferta_id));
      
      if (cyclesToDelete.length > 0) {
        const deleteCycle = db.prepare('DELETE FROM oferta_turma WHERE oferta_id = ?');
        cyclesToDelete.forEach(c => deleteCycle.run(c.oferta_id));
      }

      const insertCycle = db.prepare(`
        INSERT INTO oferta_turma (
          oferta_id, curso_id, codigo_oferta_externo, ciclo_edicao, ano, semestre, turma, trilha, responsavel_tipo, responsavel_nome, data_inicio, data_fim
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const updateCycle = db.prepare(`
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
      `);

      data.cycles.forEach((cycle: any) => {
        if (cycle.id) {
          updateCycle.run(
            cycle.externalId || null,
            cycle.cycle || null,
            cycle.year ? parseInt(cycle.year) : null,
            cycle.semester ? parseInt(cycle.semester) : null,
            cycle.class || null,
            cycle.track || null,
            cycle.responsibleType || null,
            cycle.responsibleName || null,
            cycle.startDate || null,
            cycle.endDate || null,
            cycle.id
          );
        } else {
          insertCycle.run(
            uuidv4(),
            id,
            cycle.externalId || null,
            cycle.cycle || null,
            cycle.year ? parseInt(cycle.year) : null,
            cycle.semester ? parseInt(cycle.semester) : null,
            cycle.class || null,
            cycle.track || null,
            cycle.responsibleType || null,
            cycle.responsibleName || null,
            cycle.startDate || null,
            cycle.endDate || null
          );
        }
      });
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

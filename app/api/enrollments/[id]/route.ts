import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const enrollment = db.prepare(`
    SELECT 
      m.matricula_id as id,
      a.nome as studentName,
      a.aluno_id as studentId,
      a.identificador_externo as studentExternalId,
      c.nome_curso as courseName,
      ot.ciclo_edicao as cycle,
      ot.ano as year,
      m.status_matricula as status,
      m.frequencia_final as frequency,
      m.nota_final as grade,
      m.progresso_percentual as progress,
      m.situacao_final as finalSituation,
      m.ultimo_acesso as lastAccess
    FROM matricula m
    JOIN aluno a ON m.aluno_id = a.aluno_id
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso c ON ot.curso_id = c.curso_id
    WHERE m.matricula_id = ?
  `).get(id);
  
  if (!enrollment) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
  }

  const indicators = db.prepare(`
    SELECT 
      indicador_id as id,
      categoria as category,
      subcategoria as subcategory,
      plataforma as platform,
      valor_numero as numericValue,
      valor_texto as textValue
    FROM indicador_matricula
    WHERE matricula_id = ?
  `).all(id);

  const modules = db.prepare(`
    SELECT 
      mc.modulo_id as id,
      mc.titulo as title,
      mc.ordem as "order",
      nmm.nota as grade,
      nmm.frequencia as frequency,
      nmm.plataforma as platform
    FROM modulo_curso mc
    JOIN curso c ON mc.curso_id = c.curso_id
    JOIN oferta_turma ot ON c.curso_id = ot.curso_id
    JOIN matricula m ON ot.oferta_id = m.oferta_id
    LEFT JOIN nota_modulo_matricula nmm ON mc.modulo_id = nmm.modulo_id AND m.matricula_id = nmm.matricula_id
    WHERE m.matricula_id = ?
    ORDER BY mc.ordem ASC
  `).all(id);
  
  return NextResponse.json({ ...enrollment, indicators, modules });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  try {
    db.prepare(`
      UPDATE matricula SET 
        status_matricula = COALESCE(?, status_matricula),
        classificacao = COALESCE(?, classificacao),
        situacao_final = COALESCE(?, situacao_final),
        frequencia_final = COALESCE(?, frequencia_final),
        nota_final = COALESCE(?, nota_final),
        progresso_percentual = COALESCE(?, progresso_percentual)
      WHERE matricula_id = ?
    `).run(
      data.status ?? null,
      data.classification ?? null,
      data.finalSituation ?? null,
      data.frequency ?? null,
      data.grade ?? null,
      data.progress ?? null,
      id
    );

    if (data.moduleGrades && Array.isArray(data.moduleGrades)) {
      const upsertNota = db.prepare(`
        INSERT INTO nota_modulo_matricula (matricula_id, modulo_id, nota, frequencia, plataforma)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(matricula_id, modulo_id) DO UPDATE SET
          nota = excluded.nota,
          frequencia = excluded.frequencia,
          plataforma = excluded.plataforma
      `);
      
      const transaction = db.transaction((grades) => {
        for (const g of grades) {
          upsertNota.run(id, g.moduleId, g.grade ?? 0, g.frequency ?? 0, g.platform || null);
        }
      });
      transaction(data.moduleGrades);

      // Recalculate averages from modules
      const stats = db.prepare(`
        SELECT 
          AVG(nota) as avgGrade,
          AVG(frequencia) as avgFreq
        FROM nota_modulo_matricula
        WHERE matricula_id = ?
      `).get(id) as any;

      if (stats && stats.avgGrade !== null) {
        db.prepare('UPDATE matricula SET nota_final = ?, frequencia_final = ? WHERE matricula_id = ?')
          .run(stats.avgGrade, stats.avgFreq, id);
      }
    }

    // Update platform progress indicators
    if (data.homeroProgress !== undefined || data.classroomProgress !== undefined) {
      const upsertProgress = (platform: string, value: number) => {
        // Use consistent casing 'Progresso'
        const existing = db.prepare("SELECT indicador_id FROM indicador_matricula WHERE matricula_id = ? AND (categoria = 'Progresso' OR categoria = 'progresso') AND plataforma = ?").get(id, platform) as any;
        if (existing) {
          db.prepare("UPDATE indicador_matricula SET valor_numero = ?, categoria = 'Progresso' WHERE indicador_id = ?").run(value, existing.indicador_id);
        } else {
          db.prepare("INSERT INTO indicador_matricula (matricula_id, categoria, plataforma, valor_numero) VALUES (?, 'Progresso', ?, ?)").run(id, platform, value);
        }
      };

      if (data.homeroProgress !== undefined) upsertProgress('Homero', data.homeroProgress);
      if (data.classroomProgress !== undefined) upsertProgress('Classroom', data.classroomProgress);

      // Recalculate overall progress as average of platform progresses
      const progressStats = db.prepare(`
        SELECT AVG(valor_numero) as avgProgress
        FROM indicador_matricula
        WHERE matricula_id = ? AND (categoria = 'Progresso' OR categoria = 'progresso')
      `).get(id) as any;

      if (progressStats && progressStats.avgProgress !== null) {
        db.prepare('UPDATE matricula SET progresso_percentual = ? WHERE matricula_id = ?')
          .run(progressStats.avgProgress, id);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update enrollment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = db.prepare('DELETE FROM matricula WHERE matricula_id = ?').run(id);
  
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
  }
  
  return NextResponse.json({ success: true });
}

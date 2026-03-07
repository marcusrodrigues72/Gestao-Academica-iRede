import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { studentIds, offerId, courseId } = data;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'Lista de alunos é obrigatória' }, { status: 400 });
    }

    let targetOfferId = offerId;

    // If courseId is provided but not offerId, find the latest offer for this course
    if (!targetOfferId && courseId) {
      const latestOffer = db.prepare(`
        SELECT oferta_id 
        FROM oferta_turma 
        WHERE curso_id = ? 
        ORDER BY ano DESC, semestre DESC 
        LIMIT 1
      `).get(courseId) as { oferta_id: string } | undefined;

      if (!latestOffer) {
        return NextResponse.json({ error: 'Nenhuma oferta encontrada para este curso' }, { status: 404 });
      }
      targetOfferId = latestOffer.oferta_id;
    }

    if (!targetOfferId) {
      return NextResponse.json({ error: 'Oferta ou Curso é obrigatório' }, { status: 400 });
    }

    const results = {
      success: 0,
      errors: 0,
      details: [] as string[]
    };

    const insertEnrollment = db.prepare(`
      INSERT INTO matricula (
        matricula_id, aluno_id, oferta_id, status_matricula, 
        confirmacao_matricula, data_insercao, progresso_percentual, frequencia_final, nota_final
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const getModules = db.prepare(`
      SELECT modulo_id 
      FROM modulo_curso 
      WHERE curso_id = (SELECT curso_id FROM oferta_turma WHERE oferta_id = ?)
    `);

    const insertNota = db.prepare('INSERT INTO nota_modulo_matricula (matricula_id, modulo_id, nota, frequencia) VALUES (?, ?, ?, ?)');

    db.transaction(() => {
      for (const studentId of studentIds) {
        try {
          // Check if already enrolled
          const existing = db.prepare('SELECT matricula_id FROM matricula WHERE aluno_id = ? AND oferta_id = ?').get(studentId, targetOfferId);
          if (existing) {
            results.details.push(`Aluno ${studentId} já está matriculado nesta oferta.`);
            results.errors++;
            continue;
          }

          const matriculaId = uuidv4();
          insertEnrollment.run(
            matriculaId,
            studentId,
            targetOfferId,
            'Ativo',
            1, // Auto confirm
            new Date().toISOString().split('T')[0],
            0, // Initial progress
            0, // Initial frequency
            null // Initial grade
          );

          // Initialize module grades
          const modules = getModules.all(targetOfferId) as { modulo_id: string }[];
          for (const mod of modules) {
            insertNota.run(matriculaId, mod.modulo_id, 0, 0);
          }

          results.success++;
        } catch (err: any) {
          results.errors++;
          results.details.push(`Erro ao matricular aluno ${studentId}: ${err.message}`);
        }
      }
    })();

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Bulk enrollment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const ofertaId = searchParams.get('ofertaId');
  const situacao = searchParams.get('situacao');
  const cycle = searchParams.get('cycle');
  const turma = searchParams.get('turma');
  const courseId = searchParams.get('courseId');

  let query = `
    SELECT 
      m.matricula_id as id,
      a.nome as studentName,
      a.aluno_id as studentId,
      a.identificador_externo as studentExternalId,
      a.avatar as avatar,
      c.nome_curso as courseName,
      c.curso_id as courseId,
      c.programa as program,
      c.projeto as project,
      ot.ciclo_edicao as cycle,
      ot.turma as turma,
      ot.ano as year,
      m.status_matricula as status,
      m.frequencia_final as frequency,
      m.nota_final as grade,
      m.progresso_percentual as progress,
      m.situacao_final as finalSituation
    FROM matricula m
    JOIN aluno a ON m.aluno_id = a.aluno_id
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso c ON ot.curso_id = c.curso_id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (status && status !== 'Todos os Status') {
    query += ` AND m.status_matricula = ?`;
    params.push(status);
  }

  if (ofertaId && ofertaId !== 'Todas as Ofertas') {
    query += ` AND (m.oferta_id = ? OR ot.curso_id = ?)`;
    params.push(ofertaId, ofertaId);
  }

  if (situacao && situacao !== 'Qualquer Situação') {
    query += ` AND m.situacao_final = ?`;
    params.push(situacao);
  }

  if (cycle && cycle !== '') {
    query += ` AND ot.ciclo_edicao = ?`;
    params.push(cycle);
  }

  if (turma && turma !== '') {
    query += ` AND ot.turma = ?`;
    params.push(turma);
  }

  if (courseId && courseId !== '') {
    query += ` AND c.curso_id = ?`;
    params.push(courseId);
  }

  const enrollments = db.prepare(query).all(...params);
  
  return NextResponse.json(enrollments);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const data = await request.json();
  
  const matriculaId = uuidv4();

  try {
    db.prepare(`
      INSERT INTO matricula (
        matricula_id, aluno_id, oferta_id, classificacao, status_matricula, 
        confirmacao_matricula, data_insercao, progresso_percentual, frequencia_final, nota_final
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      matriculaId,
      data.studentId,
      data.offerId,
      data.classification || null,
      data.status || 'Ativo',
      data.autoConfirm ? 1 : 0,
      data.insertionDate || new Date().toISOString().split('T')[0],
      0, // Initial progress
      0, // Initial frequency
      null // Initial grade
    );

    // Initialize module grades
    const modules = db.prepare(`
      SELECT modulo_id 
      FROM modulo_curso 
      WHERE curso_id = (SELECT curso_id FROM oferta_turma WHERE oferta_id = ?)
    `).all(data.offerId) as { modulo_id: string }[];

    const insertNota = db.prepare('INSERT INTO nota_modulo_matricula (matricula_id, modulo_id, nota, frequencia) VALUES (?, ?, ?, ?)');
    
    const transaction = db.transaction((modulesList) => {
      for (const mod of modulesList) {
        insertNota.run(matriculaId, mod.modulo_id, 0, 0);
      }
    });

    transaction(modules);

    return NextResponse.json({ id: matriculaId, success: true });
  } catch (error: any) {
    console.error('Failed to create enrollment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

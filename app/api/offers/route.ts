import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const offers = db.prepare(`
    SELECT 
      ot.oferta_id as id,
      COALESCE(NULLIF(c.nome_curso, ''), 'Curso não identificado') || ' - ' || 
      COALESCE(NULLIF(ot.ciclo_edicao, ''), 'Ciclo não informado') || ' (' || 
      COALESCE(NULLIF(CAST(ot.ano AS TEXT), ''), 'Ano não informado') || ')' as name
    FROM oferta_turma ot
    JOIN curso c ON ot.curso_id = c.curso_id
    WHERE c.nome_curso IS NOT NULL AND c.nome_curso != ''
    ORDER BY ot.ano DESC, c.nome_curso ASC
  `).all();
  
  return NextResponse.json(offers);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      courseId, 
      externalId, 
      cycle, 
      year, 
      semester, 
      class: className, 
      track, 
      responsibleType, 
      responsibleName, 
      startDate, 
      endDate 
    } = data;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const ofertaId = uuidv4();

    db.prepare(`
      INSERT INTO oferta_turma (
        oferta_id, curso_id, codigo_oferta_externo, ciclo_edicao, ano, semestre, turma, trilha, responsavel_tipo, responsavel_nome, data_inicio, data_fim
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ofertaId,
      courseId,
      externalId || null,
      cycle || null,
      year ? parseInt(year) : new Date().getFullYear(),
      semester ? parseInt(semester) : 1,
      className || null,
      track || null,
      responsibleType || 'Professor',
      responsibleName || null,
      startDate || null,
      endDate || null
    );

    return NextResponse.json({ id: ofertaId, success: true });
  } catch (error: any) {
    console.error('Failed to create offer:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

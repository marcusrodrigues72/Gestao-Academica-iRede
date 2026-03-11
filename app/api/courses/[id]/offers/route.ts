import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const offers = db.prepare(`
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
      data_fim as endDate,
      criado_em as createdAt
    FROM oferta_turma
    WHERE curso_id = ?
    ORDER BY criado_em DESC
  `).all(id);
  
  return NextResponse.json(offers);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const data = await request.json();
  
  const ofertaId = uuidv4();

  try {
    db.prepare(`
      INSERT INTO oferta_turma (
        oferta_id, curso_id, codigo_oferta_externo, ciclo_edicao, ano, semestre, turma, trilha, responsavel_tipo, responsavel_nome, data_inicio, data_fim
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      ofertaId,
      id,
      data.externalId || null,
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

    return NextResponse.json({ id: ofertaId, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

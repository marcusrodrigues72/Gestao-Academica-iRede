import { NextResponse } from 'next/server';
import db from '@/lib/db';

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

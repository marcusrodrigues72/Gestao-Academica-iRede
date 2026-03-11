import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const oferta_id = searchParams.get('oferta_id');
  const ciclo_id = searchParams.get('ciclo_id');

  try {
    let query = `
      SELECT m.*, a.nome as aluno_nome, a.cpf as aluno_cpf, o.turma, c.nome_ciclo, cr.nome_curso
      FROM matricula m
      JOIN aluno a ON m.aluno_id = a.aluno_id
      JOIN oferta_turma o ON m.oferta_id = o.oferta_id
      JOIN ciclo c ON o.ciclo_id = c.ciclo_id
      JOIN curso cr ON c.curso_id = cr.curso_id
    `;
    const params: any[] = [];

    if (oferta_id) {
      query += ` WHERE m.oferta_id = ?`;
      params.push(oferta_id);
    } else if (ciclo_id) {
      query += ` WHERE o.ciclo_id = ?`;
      params.push(ciclo_id);
    }

    const matriculas = db.prepare(query).all(...params);
    return NextResponse.json(matriculas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { aluno_id, oferta_id, status_matricula } = body;
    
    const result = db.prepare(`
      INSERT INTO matricula (aluno_id, oferta_id, status_matricula)
      VALUES (?, ?, ?)
    `).run(aluno_id, oferta_id, status_matricula || 'ativo');
    
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

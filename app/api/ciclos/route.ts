import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const curso_id = searchParams.get('curso_id');

  try {
    let query = `
      SELECT c.*, cr.nome_curso 
      FROM ciclo c 
      JOIN curso cr ON c.curso_id = cr.curso_id
    `;
    const params: any[] = [];

    if (curso_id) {
      query += ` WHERE c.curso_id = ?`;
      params.push(curso_id);
    }

    query += ` ORDER BY c.criado_em DESC`;
    
    const ciclos = db.prepare(query).all(...params);
    return NextResponse.json(ciclos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { curso_id, nome_ciclo, ano, semestre, data_inicio, data_fim } = body;
    
    const result = db.prepare(`
      INSERT INTO ciclo (curso_id, nome_ciclo, ano, semestre, data_inicio, data_fim)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(curso_id, nome_ciclo, ano, semestre, data_inicio, data_fim);
    
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

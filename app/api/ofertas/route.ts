import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ciclo_id = searchParams.get('ciclo_id');

  try {
    let query = `SELECT * FROM oferta_turma`;
    const params: any[] = [];

    if (ciclo_id) {
      query += ` WHERE ciclo_id = ?`;
      params.push(ciclo_id);
    }

    const ofertas = db.prepare(query).all(...params);
    return NextResponse.json(ofertas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ciclo_id, turma, trilha, responsavel_nome } = body;
    
    const result = db.prepare(`
      INSERT INTO oferta_turma (ciclo_id, turma, trilha, responsavel_nome)
      VALUES (?, ?, ?, ?)
    `).run(ciclo_id, turma, trilha, responsavel_nome);
    
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const cursos = db.prepare('SELECT * FROM curso ORDER BY nome_curso').all();
    return NextResponse.json(cursos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome_curso, programa, projeto, tecnologia_objeto, descricao } = body;
    
    const result = db.prepare(`
      INSERT INTO curso (nome_curso, programa, projeto, tecnologia_objeto, descricao)
      VALUES (?, ?, ?, ?, ?)
    `).run(nome_curso, programa, projeto, tecnologia_objeto, descricao);
    
    return NextResponse.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

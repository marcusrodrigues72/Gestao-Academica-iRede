import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const alunos = db.prepare('SELECT * FROM aluno ORDER BY nome').all();
    return NextResponse.json(alunos);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

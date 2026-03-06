import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const courses = db.prepare('SELECT curso_id as id, nome_curso as name FROM curso').all() as any[];
    const cycles = db.prepare('SELECT DISTINCT ciclo_edicao FROM oferta_turma WHERE ciclo_edicao IS NOT NULL').all() as any[];
    const turmas = db.prepare('SELECT DISTINCT turma FROM oferta_turma WHERE turma IS NOT NULL').all() as any[];

    return NextResponse.json({
      courses,
      cycles: cycles.map(c => c.ciclo_edicao),
      turmas: turmas.map(t => t.turma)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

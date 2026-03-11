import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const stats = {
      totalStudents: (db.prepare('SELECT COUNT(*) as count FROM aluno').get() as any).count,
      totalCourses: (db.prepare('SELECT COUNT(*) as count FROM curso').get() as any).count,
      totalCycles: (db.prepare('SELECT COUNT(*) as count FROM ciclo').get() as any).count,
      totalEnrollments: (db.prepare('SELECT COUNT(*) as count FROM matricula').get() as any).count,
    };

    const recentCycles = db.prepare(`
      SELECT c.*, cr.nome_curso 
      FROM ciclo c 
      JOIN curso cr ON c.curso_id = cr.curso_id 
      ORDER BY c.criado_em DESC 
      LIMIT 5
    `).all();

    return NextResponse.json({ stats, recentCycles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matriculaId } = await params;
  const { grades } = await request.json();

  try {
    const transaction = db.transaction(() => {
      // 1. Update/Insert module grades
      const upsertGrade = db.prepare(`
        INSERT INTO nota_modulo_matricula (matricula_id, modulo_id, nota, frequencia)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(matricula_id, modulo_id) DO UPDATE SET
          nota = excluded.nota,
          frequencia = excluded.frequencia
      `);

      for (const g of grades) {
        upsertGrade.run(matriculaId, g.moduleId, g.grade, g.frequency);
      }

      // 2. Recalculate final grade and frequency for the enrollment
      const stats = db.prepare(`
        SELECT 
          AVG(nota) as avgNota,
          AVG(frequencia) as avgFreq
        FROM nota_modulo_matricula
        WHERE matricula_id = ?
      `).get(matriculaId) as { avgNota: number | null, avgFreq: number | null };

      if (stats) {
        db.prepare(`
          UPDATE matricula 
          SET nota_final = ?, frequencia_final = ?
          WHERE matricula_id = ?
        `).run(stats.avgNota, stats.avgFreq, matriculaId);
      }
    });

    transaction();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to save grades:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

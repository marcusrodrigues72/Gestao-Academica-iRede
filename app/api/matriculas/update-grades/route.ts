import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grades } = body; // Array of { matricula_id, nota_final, frequencia_final }

    const updateStmt = db.prepare(`
      UPDATE matricula 
      SET nota_final = ?, frequencia_final = ? 
      WHERE matricula_id = ?
    `);

    const transaction = db.transaction((gradesList) => {
      for (const g of gradesList) {
        updateStmt.run(g.nota_final, g.frequencia_final, g.matricula_id);
      }
    });

    transaction(grades);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

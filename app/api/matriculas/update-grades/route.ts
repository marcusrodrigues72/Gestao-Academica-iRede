import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // All roles can update grades/frequency
  // But in a real app, we might restrict which students a professor can see

  try {
    const { matricula_id, nota_final, frequencia_final, progresso_percentual } = await request.json();

    if (!matricula_id) {
      return NextResponse.json({ error: 'Matrícula não informada' }, { status: 400 });
    }

    const stmt = db.prepare(`
      UPDATE matricula 
      SET nota_final = ?, 
          frequencia_final = ?, 
          progresso_percentual = ? 
      WHERE matricula_id = ?
    `);

    stmt.run(nota_final, frequencia_final, progresso_percentual, matricula_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating grades:', error);
    return NextResponse.json({ error: 'Erro ao atualizar notas' }, { status: 500 });
  }
}

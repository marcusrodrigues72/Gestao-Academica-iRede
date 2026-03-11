import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data } = body; // Array of objects with student and cycle info

    const insertAluno = db.prepare(`
      INSERT OR IGNORE INTO aluno (aluno_id, nome, cpf)
      VALUES (?, ?, ?)
    `);

    const insertMatricula = db.prepare(`
      INSERT OR IGNORE INTO matricula (aluno_id, oferta_id, status_matricula)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction((importList) => {
      for (const item of importList) {
        const alunoId = uuidv4();
        insertAluno.run(alunoId, item.nome, item.cpf);
        
        // Find student ID (in case it already existed)
        const student = db.prepare('SELECT aluno_id FROM aluno WHERE cpf = ?').get(item.cpf) as any;
        
        if (student && item.oferta_id) {
          insertMatricula.run(student.aluno_id, item.oferta_id, 'ativo');
        }
      }
    });

    transaction(data);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

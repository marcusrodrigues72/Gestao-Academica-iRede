import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  if (session.id === id) {
    return NextResponse.json({ error: 'Você não pode excluir seu próprio usuário' }, { status: 400 });
  }

  try {
    db.prepare('DELETE FROM usuario WHERE usuario_id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { nome, email, senha, role } = await request.json();
    
    let query = 'UPDATE usuario SET nome = ?, email = ?, role = ?';
    const values = [nome, email, role];

    if (senha) {
      query += ', senha = ?';
      values.push(senha);
    }

    query += ' WHERE usuario_id = ?';
    values.push(id);

    db.prepare(query).run(...values);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  const users = db.prepare('SELECT usuario_id as id, nome, email, role, avatar, criado_em FROM usuario ORDER BY criado_em DESC').all();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  try {
    const { nome, email, senha, role } = await request.json();
    
    if (!nome || !email || !senha || !role) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const result = db.prepare('INSERT INTO usuario (nome, email, senha, role) VALUES (?, ?, ?, ?)').run(nome, email, senha, role);
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 });
  }
}

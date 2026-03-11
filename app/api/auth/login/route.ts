import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, senha } = body;
    console.log('Login attempt for email:', email);
    
    // Log headers for debugging
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('Login request headers:', JSON.stringify(headers));

    if (!email || !senha) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios' }, { status: 400 });
    }

    // Verify DB connection
    try {
      db.prepare('SELECT 1').get();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ error: 'Erro de conexão com o banco de dados: ' + (dbError instanceof Error ? dbError.message : String(dbError)) }, { status: 500 });
    }

    const user = db.prepare('SELECT * FROM usuario WHERE email = ? AND senha = ?').get(email, senha) as any;
    console.log('User found in DB:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('Invalid credentials for:', email);
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    console.log('User authenticated:', user.nome, 'Role:', user.role);
    console.log('Environment:', process.env.NODE_ENV);

    const token = await createToken({
      id: user.usuario_id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    });

    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';
    
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: true, // Always true for HTTPS preview
      sameSite: 'none', // Required for iframe context
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });
    
    console.log('Cookie set successfully');

    return NextResponse.json({ 
      success: true,
      user: {
        id: user.usuario_id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : String(error)) 
    }, { status: 500 });
  }
}

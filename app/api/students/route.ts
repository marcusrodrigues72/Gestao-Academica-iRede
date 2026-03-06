import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const students = db.prepare(`
    SELECT 
      a.aluno_id as id, 
      a.nome as name, 
      a.nome_social as socialName,
      a.cpf,
      a.avatar,
      (SELECT valor FROM contato_aluno WHERE aluno_id = a.aluno_id AND tipo = 'email_principal' LIMIT 1) as email,
      GROUP_CONCAT(cu.nome_curso, ', ') as course,
      AVG(m.progresso_percentual) as progress,
      MAX(m.status_matricula) as status,
      COUNT(m.matricula_id) as enrollmentCount
    FROM aluno a
    LEFT JOIN matricula m ON a.aluno_id = m.aluno_id
    LEFT JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    LEFT JOIN curso cu ON ot.curso_id = cu.curso_id
    GROUP BY a.aluno_id
  `).all();
  
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const data = await request.json();
  
  if (!data.cpf) {
    return NextResponse.json({ error: 'CPF is required' }, { status: 400 });
  }

  // Check if student with this CPF already exists
  const existingStudent = db.prepare('SELECT aluno_id FROM aluno WHERE cpf = ?').get(data.cpf) as { aluno_id: string } | undefined;
  
  const alunoId = existingStudent?.aluno_id || data.id || uuidv4();
  const avatar = data.avatar || `https://picsum.photos/seed/${data.name}/200`;

  // Use a transaction
  const transaction = db.transaction(() => {
    if (existingStudent) {
      // Update existing student info
      db.prepare(`
        UPDATE aluno SET 
          identificador_externo = COALESCE(?, identificador_externo),
          nome = COALESCE(?, nome),
          nome_social = COALESCE(?, nome_social),
          rg = COALESCE(?, rg),
          data_nascimento = COALESCE(?, data_nascimento),
          sexo_genero = COALESCE(?, sexo_genero),
          cor_raca = COALESCE(?, cor_raca),
          nacionalidade = COALESCE(?, nacionalidade),
          naturalidade = COALESCE(?, naturalidade),
          avatar = COALESCE(?, avatar)
        WHERE aluno_id = ?
      `).run(
        data.externalId || null, 
        data.name, 
        data.socialName || null, 
        data.rg || null,
        data.birthDate || null, 
        data.gender || null, 
        data.race || null, 
        data.nationality || null,
        data.naturalness || null, 
        avatar,
        alunoId
      );
    } else {
      // 1. Insert Aluno
      db.prepare(`
        INSERT INTO aluno (
          aluno_id, identificador_externo, nome, nome_social, cpf, rg, 
          data_nascimento, sexo_genero, cor_raca, nacionalidade, 
          naturalidade, origem_registro, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        alunoId, 
        data.externalId || null, 
        data.name, 
        data.socialName || null, 
        data.cpf, 
        data.rg || null,
        data.birthDate || null, 
        data.gender || null, 
        data.race || null, 
        data.nationality || null,
        data.naturalness || null, 
        data.registrationOrigin || 'Manual', 
        avatar
      );
    }

    // 2. Insert/Update Contatos
    if (data.email) {
      db.prepare(`
        INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) 
        VALUES (?, 'email_principal', ?, 1)
        ON CONFLICT(aluno_id, tipo) DO UPDATE SET valor = excluded.valor
      `).run(alunoId, data.email);
    }
    if (data.whatsapp) {
      db.prepare(`
        INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) 
        VALUES (?, 'whatsapp', ?, 0)
        ON CONFLICT(aluno_id, tipo) DO UPDATE SET valor = excluded.valor
      `).run(alunoId, data.whatsapp);
    }
    if (data.phone) {
      db.prepare(`
        INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) 
        VALUES (?, 'telefone', ?, 0)
        ON CONFLICT(aluno_id, tipo) DO UPDATE SET valor = excluded.valor
      `).run(alunoId, data.phone);
    }

    // 3. Insert Endereço
    if (data.cep || data.address || data.street || data.number || data.neighborhood || data.city || data.state) {
      const existingAddress = db.prepare('SELECT endereco_id FROM endereco_aluno WHERE aluno_id = ?').get(alunoId);
      if (existingAddress) {
        db.prepare(`
          UPDATE endereco_aluno SET 
            cep = ?, 
            logradouro = ?, 
            numero = ?, 
            bairro = ?, 
            cidade = ?, 
            estado = ?, 
            complemento = ? 
          WHERE aluno_id = ?
        `).run(
          data.cep || null, 
          data.street || data.address || null, 
          data.number || null, 
          data.neighborhood || null, 
          data.city || null, 
          data.state || null, 
          data.complement || null, 
          alunoId
        );
      } else {
        db.prepare(`
          INSERT INTO endereco_aluno (aluno_id, cep, logradouro, numero, bairro, cidade, estado, complemento) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          alunoId, 
          data.cep || null, 
          data.street || data.address || null, 
          data.number || null, 
          data.neighborhood || null, 
          data.city || null, 
          data.state || null, 
          data.complement || null
        );
      }
    }

    // 4. Insert Formação Acadêmica
    if (data.originCourse || data.institution) {
      db.prepare(`
        INSERT INTO formacao_academica_aluno (
          aluno_id, curso, instituicao, status_curso, ano_conclusao, grau_instrucao, titulacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        alunoId, 
        data.originCourse || null, 
        data.institution || null, 
        data.academicStatus || null,
        data.completionYear ? parseInt(data.completionYear) : null,
        data.academicDegree || null,
        data.titulation || null
      );
    }

    // 5. Insert Curso/Matrícula
    if (data.courseId) {
      // Find the most recent offer for this course
      const offer = db.prepare('SELECT oferta_id FROM oferta_turma WHERE curso_id = ? ORDER BY ano DESC, semestre DESC LIMIT 1').get(data.courseId) as { oferta_id: string } | undefined;
      
      let ofertaId = offer?.oferta_id;
      
      if (!ofertaId) {
        ofertaId = uuidv4();
        db.prepare('INSERT INTO oferta_turma (oferta_id, curso_id, turma, ano, semestre) VALUES (?, ?, ?, ?, ?)').run(
          ofertaId, data.courseId, 'Turma A', new Date().getFullYear(), 1
        );
      }
      
      // Check if already enrolled in this offer
      const existingMatricula = db.prepare('SELECT matricula_id FROM matricula WHERE aluno_id = ? AND oferta_id = ?').get(alunoId, ofertaId);
      
      if (!existingMatricula) {
        db.prepare('INSERT INTO matricula (aluno_id, oferta_id, status_matricula, progresso_percentual) VALUES (?, ?, ?, ?)').run(
          alunoId, ofertaId, data.status || 'Ativo', data.progress || 0
        );
      }
    }
  });

  transaction();

  return NextResponse.json({ id: alunoId, ...data, avatar });
}



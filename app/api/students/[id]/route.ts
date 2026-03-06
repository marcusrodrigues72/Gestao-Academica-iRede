import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const student = db.prepare(`
    SELECT 
      a.aluno_id as id, 
      a.nome as name, 
      a.nome_social as socialName,
      a.cpf,
      a.rg,
      a.data_nascimento as birthDate,
      a.sexo_genero as gender,
      a.cor_raca as race,
      a.nacionalidade as nationality,
      a.naturalidade as naturalness,
      a.identificador_externo as externalId,
      a.origem_registro as registrationOrigin,
      a.avatar,
      (SELECT valor FROM contato_aluno WHERE aluno_id = a.aluno_id AND tipo = 'email_principal' LIMIT 1) as email,
      (SELECT valor FROM contato_aluno WHERE aluno_id = a.aluno_id AND tipo = 'whatsapp' LIMIT 1) as whatsapp,
      (SELECT valor FROM contato_aluno WHERE aluno_id = a.aluno_id AND tipo = 'telefone' LIMIT 1) as phone,
      e.cep,
      e.logradouro as street,
      e.logradouro as address,
      e.numero as number,
      e.bairro as neighborhood,
      e.cidade as city,
      e.estado as state,
      e.complemento as complement,
      f.curso as originCourse,
      f.instituicao as institution,
      f.status_curso as academicStatus,
      f.ano_conclusao as completionYear,
      f.grau_instrucao as academicDegree,
      f.titulacao as titulation
    FROM aluno a
    LEFT JOIN endereco_aluno e ON a.aluno_id = e.aluno_id
    LEFT JOIN formacao_academica_aluno f ON a.aluno_id = f.aluno_id
    WHERE a.aluno_id = ?
  `).get(id) as any;
  
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Fetch all enrollments
  const enrollments = db.prepare(`
    SELECT 
      m.matricula_id as id,
      cu.nome_curso as course,
      cu.curso_id as courseId,
      m.progresso_percentual as progress,
      m.status_matricula as status,
      m.nota_final as finalGrade,
      m.frequencia_final as finalFrequency,
      ot.turma,
      ot.ciclo_edicao as cycle
    FROM matricula m
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso cu ON ot.curso_id = cu.curso_id
    WHERE m.aluno_id = ?
  `).all(id) as any[];

  // Fetch module grades for each enrollment
  for (const enroll of enrollments) {
    const moduleGrades = db.prepare(`
      SELECT 
        mc.modulo_id as moduleId,
        mc.titulo as moduleTitle,
        nmm.nota as grade,
        nmm.frequencia as frequency
      FROM modulo_curso mc
      LEFT JOIN nota_modulo_matricula nmm ON mc.modulo_id = nmm.modulo_id AND nmm.matricula_id = ?
      WHERE mc.curso_id = ?
      ORDER BY mc.ordem ASC
    `).all(enroll.id, enroll.courseId);
    
    enroll.moduleGrades = moduleGrades;
  }

  student.enrollments = enrollments;
  
  // For backward compatibility with forms that expect single fields
  if (enrollments.length > 0) {
    student.course = enrollments[0].course;
    student.courseId = enrollments[0].courseId;
    student.progress = enrollments[0].progress;
    student.status = enrollments[0].status;
  }
  
  return NextResponse.json(student);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates = await request.json();
  
  const transaction = db.transaction(() => {
    // Update Aluno
    db.prepare(`
      UPDATE aluno SET 
        nome = COALESCE(?, nome),
        nome_social = COALESCE(?, nome_social),
        cpf = COALESCE(?, cpf),
        rg = COALESCE(?, rg),
        data_nascimento = COALESCE(?, data_nascimento),
        sexo_genero = COALESCE(?, sexo_genero),
        cor_raca = COALESCE(?, cor_raca),
        nacionalidade = COALESCE(?, nacionalidade),
        naturalidade = COALESCE(?, naturalidade),
        identificador_externo = COALESCE(?, identificador_externo),
        origem_registro = COALESCE(?, origem_registro)
      WHERE aluno_id = ?
    `).run(
      updates.name || null, updates.socialName || null, updates.cpf || null, updates.rg || null, 
      updates.birthDate || null, updates.gender || null, updates.race || null, updates.nationality || null, 
      updates.naturalness || null, updates.externalId || null, updates.registrationOrigin || null, id
    );

    // Update Contatos
    if (updates.email) {
      const exists = db.prepare("SELECT 1 FROM contato_aluno WHERE aluno_id = ? AND tipo = 'email_principal'").get(id);
      if (exists) {
        db.prepare("UPDATE contato_aluno SET valor = ? WHERE aluno_id = ? AND tipo = 'email_principal'").run(updates.email, id);
      } else {
        db.prepare("INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) VALUES (?, 'email_principal', ?, 1)").run(id, updates.email);
      }
    }
    if (updates.whatsapp) {
      const exists = db.prepare("SELECT 1 FROM contato_aluno WHERE aluno_id = ? AND tipo = 'whatsapp'").get(id);
      if (exists) {
        db.prepare("UPDATE contato_aluno SET valor = ? WHERE aluno_id = ? AND tipo = 'whatsapp'").run(updates.whatsapp, id);
      } else {
        db.prepare("INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) VALUES (?, 'whatsapp', ?, 0)").run(id, updates.whatsapp);
      }
    }

    // Update Endereço
    if (updates.cep || updates.address || updates.street || updates.number || updates.neighborhood || updates.city || updates.state) {
      const exists = db.prepare("SELECT 1 FROM endereco_aluno WHERE aluno_id = ?").get(id);
      if (exists) {
        db.prepare(`
          UPDATE endereco_aluno SET 
            cep = COALESCE(?, cep), 
            logradouro = COALESCE(?, logradouro),
            numero = COALESCE(?, numero),
            bairro = COALESCE(?, bairro),
            cidade = COALESCE(?, cidade),
            estado = COALESCE(?, estado),
            complemento = COALESCE(?, complemento)
          WHERE aluno_id = ?
        `).run(
          updates.cep || null, 
          updates.street || updates.address || null, 
          updates.number || null,
          updates.neighborhood || null,
          updates.city || null,
          updates.state || null,
          updates.complement || null,
          id
        );
      } else {
        db.prepare(`
          INSERT INTO endereco_aluno (aluno_id, cep, logradouro, numero, bairro, cidade, estado, complemento) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, 
          updates.cep || null, 
          updates.street || updates.address || null, 
          updates.number || null,
          updates.neighborhood || null,
          updates.city || null,
          updates.state || null,
          updates.complement || null
        );
      }
    }

    // Update Formação
    if (updates.originCourse || updates.institution) {
      const exists = db.prepare("SELECT 1 FROM formacao_academica_aluno WHERE aluno_id = ?").get(id);
      if (exists) {
        db.prepare(`
          UPDATE formacao_academica_aluno SET 
            curso = COALESCE(?, curso), 
            instituicao = COALESCE(?, instituicao),
            status_curso = COALESCE(?, status_curso),
            ano_conclusao = COALESCE(?, ano_conclusao),
            grau_instrucao = COALESCE(?, grau_instrucao),
            titulacao = COALESCE(?, titulacao)
          WHERE aluno_id = ?
        `).run(
          updates.originCourse || null, updates.institution || null, updates.academicStatus || null, 
          updates.completionYear ? parseInt(updates.completionYear) : null,
          updates.academicDegree || null, updates.titulation || null, id
        );
      } else {
        db.prepare(`
          INSERT INTO formacao_academica_aluno (
            aluno_id, curso, instituicao, status_curso, ano_conclusao, grau_instrucao, titulacao
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          id, updates.originCourse || null, updates.institution || null, updates.academicStatus || null,
          updates.completionYear ? parseInt(updates.completionYear) : null,
          updates.academicDegree || null, updates.titulation || null
        );
      }
    }

    // Update Matrícula/Curso
    if (updates.status || updates.progress !== undefined) {
      db.prepare('UPDATE matricula SET status_matricula = COALESCE(?, status_matricula), progresso_percentual = COALESCE(?, progresso_percentual) WHERE aluno_id = ?').run(updates.status || null, updates.progress || null, id);
    }
    if (updates.courseId) {
      // Find the most recent offer for this course
      const offer = db.prepare('SELECT oferta_id FROM oferta_turma WHERE curso_id = ? ORDER BY ano DESC, semestre DESC LIMIT 1').get(updates.courseId) as { oferta_id: string } | undefined;
      
      let ofertaId = offer?.oferta_id;
      
      if (!ofertaId) {
        ofertaId = uuidv4();
        db.prepare('INSERT INTO oferta_turma (oferta_id, curso_id, turma, ano, semestre) VALUES (?, ?, ?, ?, ?)').run(
          ofertaId, updates.courseId, 'Turma A', new Date().getFullYear(), 1
        );
      }

      const matriculaExists = db.prepare('SELECT 1 FROM matricula WHERE aluno_id = ?').get(id);
      if (matriculaExists) {
        db.prepare('UPDATE matricula SET oferta_id = ? WHERE aluno_id = ?').run(ofertaId, id);
      } else {
        db.prepare('INSERT INTO matricula (aluno_id, oferta_id, status_matricula, progresso_percentual) VALUES (?, ?, ?, ?)').run(
          id, ofertaId, updates.status || 'Ativo', updates.progress || 0
        );
      }
    }
  });

  transaction();
  
  return NextResponse.json({ success: true });
}


export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const result = db.prepare('DELETE FROM aluno WHERE aluno_id = ?').run(id);
    
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete student:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


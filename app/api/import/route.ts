import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'administrador' && session.role !== 'gestor')) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const data = await request.json();
    const { type, rows, mapping } = data;

    if (!type || !rows || !mapping) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const results = {
      success: 0,
      errors: 0,
      details: [] as string[]
    };

    db.transaction(() => {
      for (const row of rows) {
        try {
          if (type === 'Alunos') {
            const nome = row[mapping.nome];
            const cpf = row[mapping.cpf];

            if (!nome || !cpf) {
              throw new Error('Nome and CPF are required');
            }

            // Check if student with this CPF already exists
            const existingStudent = db.prepare('SELECT aluno_id FROM aluno WHERE cpf = ?').get(cpf) as { aluno_id: string } | undefined;
            const studentId = existingStudent?.aluno_id || uuidv4();

            if (existingStudent) {
              // Update existing student
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
                  origem_registro = COALESCE(?, origem_registro),
                  avatar = COALESCE(?, avatar)
                WHERE aluno_id = ?
              `).run(
                row[mapping.identificador_externo] || null,
                nome,
                row[mapping.nome_social] || null,
                row[mapping.rg] || null,
                row[mapping.data_nascimento] || null,
                row[mapping.sexo_genero] || null,
                row[mapping.cor_raca] || null,
                row[mapping.nacionalidade] || null,
                row[mapping.naturalidade] || null,
                row[mapping.origem_registro] || null,
                row[mapping.avatar] || null,
                studentId
              );
            } else {
              // Insert Student
              db.prepare(`
                INSERT INTO aluno (
                  aluno_id, identificador_externo, nome, nome_social, cpf, rg, 
                  data_nascimento, sexo_genero, cor_raca, nacionalidade, naturalidade, 
                  origem_registro, avatar
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                studentId,
                row[mapping.identificador_externo] || null,
                nome,
                row[mapping.nome_social] || null,
                cpf,
                row[mapping.rg] || null,
                row[mapping.data_nascimento] || null,
                row[mapping.sexo_genero] || null,
                row[mapping.cor_raca] || null,
                row[mapping.nacionalidade] || null,
                row[mapping.naturalidade] || null,
                row[mapping.origem_registro] || null,
                row[mapping.avatar] || null
              );
            }
            
            // Insert/Update Contacts
            const email = row[mapping.email];
            if (email) {
              db.prepare(`
                INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) 
                VALUES (?, 'email_principal', ?, 1)
                ON CONFLICT(aluno_id, tipo) DO UPDATE SET valor = excluded.valor
              `).run(studentId, email);
            }
            const whatsapp = row[mapping.whatsapp];
            if (whatsapp) {
              db.prepare(`
                INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) 
                VALUES (?, 'whatsapp', ?, 0)
                ON CONFLICT(aluno_id, tipo) DO UPDATE SET valor = excluded.valor
              `).run(studentId, whatsapp);
            }
            const telefone = row[mapping.telefone];
            if (telefone) {
              db.prepare(`
                INSERT INTO contato_aluno (aluno_id, tipo, valor, principal) 
                VALUES (?, 'telefone', ?, 0)
                ON CONFLICT(aluno_id, tipo) DO UPDATE SET valor = excluded.valor
              `).run(studentId, telefone);
            }

            // Insert/Update Address
            if (mapping.cep || mapping.estado || mapping.cidade) {
              const existingAddress = db.prepare('SELECT endereco_id FROM endereco_aluno WHERE aluno_id = ?').get(studentId);
              if (existingAddress) {
                db.prepare(`
                  UPDATE endereco_aluno SET 
                    cep = COALESCE(?, cep), 
                    estado = COALESCE(?, estado), 
                    cidade = COALESCE(?, cidade), 
                    bairro = COALESCE(?, bairro), 
                    logradouro = COALESCE(?, logradouro), 
                    numero = COALESCE(?, numero), 
                    complemento = COALESCE(?, complemento)
                  WHERE aluno_id = ?
                `).run(
                  row[mapping.cep] || null,
                  row[mapping.estado] || null,
                  row[mapping.cidade] || null,
                  row[mapping.bairro] || null,
                  row[mapping.logradouro] || null,
                  row[mapping.numero] || null,
                  row[mapping.complemento] || null,
                  studentId
                );
              } else {
                db.prepare(`
                  INSERT INTO endereco_aluno (
                    aluno_id, cep, estado, cidade, bairro, logradouro, numero, complemento
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                  studentId,
                  row[mapping.cep] || null,
                  row[mapping.estado] || null,
                  row[mapping.cidade] || null,
                  row[mapping.bairro] || null,
                  row[mapping.logradouro] || null,
                  row[mapping.numero] || null,
                  row[mapping.complemento] || null
                );
              }
            }

            // Insert Academic Formation
            if (mapping.formacao_curso || mapping.formacao_instituicao) {
              db.prepare(`
                INSERT INTO formacao_academica_aluno (
                  aluno_id, curso, instituicao, status_curso, ano_conclusao, grau_instrucao, titulacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
              `).run(
                studentId,
                row[mapping.formacao_curso] || null,
                row[mapping.formacao_instituicao] || null,
                row[mapping.formacao_status] || null,
                row[mapping.formacao_ano] ? parseInt(row[mapping.formacao_ano]) : null,
                row[mapping.formacao_grau] || null,
                row[mapping.formacao_titulacao] || null
              );
            }

          } else if (type === 'Cursos') {
            const cursoId = uuidv4();
            const nomeCurso = row[mapping.nome_curso];
            if (!nomeCurso) throw new Error('Nome do curso is required');

            db.prepare(`
              INSERT INTO curso (
                curso_id, identificador_externo, nome_curso, programa, projeto, tecnologia_objeto, descricao
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              cursoId,
              row[mapping.identificador_externo] || null,
              nomeCurso,
              row[mapping.programa] || 'Capacitação',
              row[mapping.projeto] || 'iRede',
              row[mapping.tecnologia_objeto] || 'Web',
              row[mapping.descricao] || null
            );

            // Insert Offer/Class if mapping exists
            if (mapping.codigo_oferta_externo || mapping.ciclo_edicao || mapping.turma) {
              db.prepare(`
                INSERT INTO oferta_turma (
                  oferta_id, curso_id, codigo_oferta_externo, ciclo_edicao, ano, semestre, 
                  turma, trilha, responsavel_tipo, responsavel_nome, data_inicio, data_fim
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).run(
                uuidv4(),
                cursoId,
                row[mapping.codigo_oferta_externo] || null,
                row[mapping.ciclo_edicao] || null,
                row[mapping.ano] ? parseInt(row[mapping.ano]) : null,
                row[mapping.semestre] ? parseInt(row[mapping.semestre]) : null,
                row[mapping.turma] || null,
                row[mapping.trilha] || null,
                row[mapping.responsavel_tipo] || null,
                row[mapping.responsavel_nome] || null,
                row[mapping.data_inicio] || null,
                row[mapping.data_fim] || null
              );
            }

          } else if (type === 'Matrículas') {
            const alunoId = row[mapping.aluno_id];
            const ofertaId = row[mapping.oferta_id];
            if (!alunoId || !ofertaId) throw new Error('Aluno ID and Oferta ID are required');

            db.prepare(`
              INSERT INTO matricula (
                aluno_id, oferta_id, classificacao, status_matricula, confirmacao_matricula, 
                situacao_final, frequencia_final, nota_final, progresso_percentual, 
                data_insercao, ultimo_acesso
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              alunoId,
              ofertaId,
              row[mapping.classificacao] || null,
              row[mapping.status_matricula] || 'Ativo',
              row[mapping.confirmacao_matricula] === 'true' || row[mapping.confirmacao_matricula] === 1 ? 1 : 0,
              row[mapping.situacao_final] || null,
              row[mapping.frequencia_final] ? parseFloat(row[mapping.frequencia_final]) : null,
              row[mapping.nota_final] ? parseFloat(row[mapping.nota_final]) : null,
              row[mapping.progresso_percentual] ? parseFloat(row[mapping.progresso_percentual]) : null,
              row[mapping.data_insercao] || null,
              row[mapping.ultimo_acesso] || null
            );

          } else if (type === 'Indicadores') {
            const matriculaId = row[mapping.matricula_id];
            const categoria = row[mapping.categoria];
            if (!matriculaId || !categoria) throw new Error('Matrícula ID and Categoria are required');

            db.prepare(`
              INSERT INTO indicador_matricula (
                matricula_id, categoria, subcategoria, plataforma, valor_numero, valor_texto, data_referencia
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
              matriculaId,
              categoria,
              row[mapping.subcategoria] || null,
              row[mapping.plataforma] || null,
              row[mapping.valor_numero] ? parseFloat(row[mapping.valor_numero]) : null,
              row[mapping.valor_texto] || null,
              row[mapping.data_referencia] || null
            );
          }

          results.success++;
        } catch (err: any) {
          results.errors++;
          results.details.push(`Error processing row: ${err.message}`);
        }
      }
    })();

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const programa = searchParams.get('programa');
    const ciclo = searchParams.get('ciclo');
    const curso = searchParams.get('curso');
    
    console.log('Dashboard fetch filters:', { programa, ciclo, curso });

  let whereClause = 'WHERE 1=1';
  const params: any[] = [];

  if (programa && programa !== 'Todos') {
    whereClause += ' AND cu.programa = ?';
    params.push(programa);
  }
  if (ciclo && ciclo !== 'Todos') {
    whereClause += ' AND ot.ciclo_edicao = ?';
    params.push(ciclo);
  }
  if (curso && curso !== 'Todos') {
    whereClause += ' AND cu.nome_curso = ?';
    params.push(curso);
  }

  // 1. Stats
  const stats = db.prepare(`
    SELECT 
      COUNT(DISTINCT a.aluno_id) as totalStudents,
      COUNT(DISTINCT CASE WHEN m.status_matricula = 'Ativo' THEN m.matricula_id END) as activeEnrollments,
      AVG(m.progresso_percentual) as avgProgress,
      AVG(m.nota_final) as avgGrade
    FROM aluno a
    LEFT JOIN matricula m ON a.aluno_id = m.aluno_id
    LEFT JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    LEFT JOIN curso cu ON ot.curso_id = cu.curso_id
    ${whereClause}
  `).get(...params) as any;

  // 2. Engagement by Technology
  const engagementByTech = db.prepare(`
    SELECT 
      cu.tecnologia_objeto as tech,
      COUNT(DISTINCT a.aluno_id) as count
    FROM aluno a
    JOIN matricula m ON a.aluno_id = m.aluno_id
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso cu ON ot.curso_id = cu.curso_id
    ${whereClause}
    GROUP BY cu.tecnologia_objeto
    ORDER BY count DESC
  `).all(...params) as any[];

  // 3. Geographic Distribution (by City/State)
  const geoDist = db.prepare(`
    SELECT 
      e.estado as state,
      e.cidade as city,
      COUNT(DISTINCT a.aluno_id) as count
    FROM aluno a
    JOIN endereco_aluno e ON a.aluno_id = e.aluno_id
    JOIN matricula m ON a.aluno_id = m.aluno_id
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso cu ON ot.curso_id = cu.curso_id
    ${whereClause}
    GROUP BY e.estado, e.cidade
  `).all(...params) as any[];

  // 4. Low Performance Alerts
  const alerts = db.prepare(`
    SELECT 
      a.nome as name,
      cu.nome_curso as course,
      m.nota_final as grade,
      m.frequencia_final as frequency,
      m.status_matricula as status
    FROM aluno a
    JOIN matricula m ON a.aluno_id = m.aluno_id
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso cu ON ot.curso_id = cu.curso_id
    ${whereClause} AND (m.nota_final < 5 OR m.frequencia_final < 70)
    LIMIT 5
  `).all(...params) as any[];

  // 5. Recent Activity (Simplified)
  const recentActivity = db.prepare(`
    SELECT 
      a.nome as user,
      a.avatar,
      'Matriculou-se em' as action,
      cu.nome_curso as target,
      m.criado_em as time
    FROM aluno a
    JOIN matricula m ON a.aluno_id = m.aluno_id
    JOIN oferta_turma ot ON m.oferta_id = ot.oferta_id
    JOIN curso cu ON ot.curso_id = cu.curso_id
    ${whereClause}
    ORDER BY m.criado_em DESC
    LIMIT 5
  `).all(...params) as any[];

  // 6. Filter Options
  const programs = db.prepare('SELECT DISTINCT programa FROM curso').all() as any[];
  const cycles = db.prepare('SELECT DISTINCT ciclo_edicao FROM oferta_turma WHERE ciclo_edicao IS NOT NULL').all() as any[];
  const courses = db.prepare('SELECT DISTINCT nome_curso FROM curso').all() as any[];

    return NextResponse.json({
      stats,
      engagementByTech,
      geoDist,
      alerts,
      recentActivity,
      filterOptions: {
        programs: programs.map(p => p.programa),
        cycles: cycles.map(c => c.ciclo_edicao),
        courses: courses.map(c => c.nome_curso)
      }
    });
  } catch (error: any) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status: 500 });
  }
}

# Especificação de Requisitos de Software (SRS)
## Projeto: iRede EDU Manager
**Versão:** 1.0 (Estável)
**Data:** 11 de Março de 2026

---

## 1. Introdução

### 1.1 Propósito
Este documento descreve as especificações de requisitos para o sistema **iRede EDU Manager**, uma plataforma avançada de gestão acadêmica focada no monitoramento de engajamento, desempenho e alcance geográfico de alunos em programas de capacitação tecnológica.

### 1.2 Escopo
O sistema abrange desde o cadastro base de alunos e cursos até o monitoramento em tempo real de indicadores de desempenho (notas e frequência), suporte a múltiplos ciclos acadêmicos e ferramentas robustas de importação de dados via planilhas.

### 1.3 Definições, Acrônimos e Abreviações
*   **SRS**: Software Requirements Specification.
*   **CRUD**: Create, Read, Update, Delete.
*   **Oferta**: Uma instância específica de um curso (turma/edição).
*   **Ciclo**: Período acadêmico (ex: 2024.1).
*   **Indicador**: Métrica de desempenho flexível (ex: nota de Blockchain, frequência em IA).

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto
O iRede EDU Manager é uma solução Full-Stack moderna, operando em ambiente web, com foco em visualização de dados e facilidade de operação para gestores acadêmicos.

### 2.2 Funções do Produto
*   Dashboard analítico com mapas de calor e gráficos de engajamento.
*   Gestão completa de Alunos (dados pessoais, contatos, endereços e formação).
*   Gestão de Catálogo de Cursos e Módulos.
*   Gestão de Ofertas de Turmas e Ciclos Acadêmicos.
*   Controle de Matrículas e Status (Ativo, Evadido, Concluído).
*   Lançamento e monitoramento de Notas e Frequência por módulo.
*   Sistema de Importação Inteligente (CSV/Excel) com mapeamento de colunas.
*   Alertas automáticos de baixo desempenho ou baixa frequência.

### 2.3 Classes e Características dos Usuários
*   **Administrador**: Acesso total ao sistema, incluindo gestão de usuários e configurações críticas.
*   **Gestor**: Acesso a relatórios, dashboards e ferramentas de importação/edição.
*   **Professor/Mentor**: Foco no lançamento de notas e acompanhamento de turmas específicas.

---

## 3. Requisitos Funcionais

### 3.1 Módulo: Dashboard Analítico
*   **RF01**: O sistema deve exibir o total de alunos, cursos ativos, taxa de retenção e desempenho médio.
*   **RF02**: O sistema deve apresentar um gráfico de barras com o engajamento por tecnologia.
*   **RF03**: O sistema deve exibir um mapa de calor (Heat Map) da distribuição geográfica dos alunos por estado/região.
*   **RF04**: O sistema deve listar alertas de desempenho (alunos com notas < 5.0 ou frequência < 75%).
*   **RF05**: O sistema deve permitir filtrar os dados do dashboard por Programa, Ciclo e Curso.

### 3.2 Módulo: Gestão de Alunos
*   **RF06**: O sistema deve permitir o cadastro completo de alunos (Nome, CPF, RG, Data de Nascimento, Sexo, Cor/Raça, etc.).
*   **RF07**: O sistema deve suportar múltiplos contatos por aluno (E-mail, WhatsApp, Telefone).
*   **RF08**: O sistema deve permitir o registro de endereços detalhados para análise geográfica.
*   **RF09**: O sistema deve permitir registrar a formação acadêmica prévia do aluno.

### 3.3 Módulo: Gestão de Cursos e Ofertas
*   **RF10**: O sistema deve gerenciar um catálogo de cursos com Programa, Projeto e Tecnologia.
*   **RF11**: O sistema deve permitir a criação de módulos para cada curso.
*   **RF12**: O sistema deve gerenciar Ofertas (turmas), definindo ciclo, ano, semestre, trilha e responsáveis.

### 3.4 Módulo: Matrículas e Desempenho
*   **RF13**: O sistema deve permitir matricular alunos em ofertas específicas.
*   **RF14**: O sistema deve rastrear o status da matrícula (Inscrito, Matriculado, Ativo, Evadido, Concluído).
*   **RF15**: O sistema deve permitir o lançamento de notas e frequência por módulo.
*   **RF16**: O sistema deve calcular automaticamente a nota final e frequência final da matrícula.

### 3.5 Módulo: Importação de Dados
*   **RF17**: O sistema deve permitir a importação de Alunos, Cursos, Matrículas e Indicadores via CSV/Excel.
*   **RF18**: O sistema deve oferecer uma interface de mapeamento de colunas (Auto-mapping) para flexibilidade de formatos de planilha.
*   **RF19**: O sistema deve permitir a matrícula automática de alunos importados em um curso selecionado.
*   **RF20**: O sistema deve validar duplicidade de CPF durante a importação, atualizando registros existentes.

---

## 4. Requisitos Não Funcionais

### 4.1 Desempenho
*   **RNF01**: As consultas ao dashboard devem ser processadas em menos de 2 segundos para bases de até 10.000 alunos.
*   **RNF02**: A interface deve ser responsiva e otimizada para navegação fluida.

### 4.2 Segurança
*   **RNF03**: O sistema deve exigir autenticação para acesso a qualquer funcionalidade.
*   **RNF04**: O controle de acesso deve ser baseado em papéis (RBAC).
*   **RNF05**: Senhas devem ser armazenadas de forma segura (Hash).

### 4.3 Usabilidade
*   **RNF06**: O sistema deve seguir o Design System estabelecido (Tailwind CSS, Lucide Icons).
*   **RNF07**: Devem ser fornecidos templates de planilha para facilitar a importação de dados.

---

## 5. Arquitetura do Sistema

### 5.1 Stack Tecnológica
*   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Motion (animações).
*   **Backend**: Next.js API Routes.
*   **Banco de Dados**: SQLite (via better-sqlite3) para persistência local rápida e estável.
*   **Visualização**: Recharts (Gráficos), D3 (Manipulação de dados).

### 5.2 Modelo de Dados (Principais Tabelas)
*   `aluno`: Dados mestres do estudante.
*   `curso`: Catálogo de formações.
*   `oferta_turma`: Instâncias de turmas.
*   `matricula`: Vínculo aluno-turma com resultados finais.
*   `indicador_matricula`: Métricas granulares de desempenho.
*   `usuario`: Credenciais e permissões.

---

## 6. Considerações Finais
Esta especificação reflete a versão estável atual da solução, garantindo que todos os fluxos críticos de gestão acadêmica e análise de dados estejam documentados e implementados conforme as melhores práticas de engenharia de software.

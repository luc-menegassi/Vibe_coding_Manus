# Capítulo 07 — Contexto e exploração do projeto

## Tese

**Explorar um projeto antes de pedir código é uma atividade de engenharia: primeiro se estabelece o que é observável, depois se formulam hipóteses e só então se decide o que pode ser alterado.** A IA de programação pode acelerar a leitura de uma árvore de arquivos, a extração de dependências e a formulação de perguntas. Ela não transforma contexto incompleto em conhecimento confiável. Velocidade de geração reduz o tempo de produzir uma hipótese ou um patch; não transfere para a ferramenta a responsabilidade por arquitetura, segurança, compatibilidade, operação ou aceite técnico.

O contexto mínimo para uma mudança inclui a finalidade do sistema, suas fronteiras, a arquitetura observável, os contratos, as dependências, os comandos de validação, os riscos e as lacunas de conhecimento. Uma exploração responsável diferencia **fato observado**, **inferência**, **hipótese** e **pergunta em aberto**. Sem essa distinção, a pessoa pode pedir à IA que “corrija” uma arquitetura que ela apenas imaginou.

Este capítulo também registra uma limitação concreta da base examinada para este guia: `/home/ubuntu/vibe-coding-research` contém capítulos em Markdown, mas não é um repositório Git e não contém código de aplicação, manifesto de dependências, workflow ou configuração de runtime. Portanto, é possível descrever sua organização editorial, mas não é possível afirmar uma arquitetura executável, um grafo real de dependências de software ou uma cadeia de build. Essa ausência de evidência é um resultado da exploração, não uma autorização para preencher as lacunas com suposições.

## Escopo e limites

O capítulo trata exclusivamente de:

- leitura inicial de um repositório desconhecido;
- inventário de arquivos, comandos, versões, dependências e automações;
- mapa da arquitetura que pode ser sustentado pela evidência;
- identificação de riscos, invariantes e fronteiras de confiança;
- preparação de contexto para uma IA de programação;
- perguntas que precisam ser respondidas antes de especificar ou implementar.

Não trata da implementação de uma funcionalidade, da escolha definitiva de linguagem ou framework, do desenho detalhado de testes, da configuração completa de CI/CD, da operação de produção ou da correção de um defeito. Esses temas podem aparecer como evidência a localizar ou como pergunta de descoberta, mas não são desenvolvidos aqui.

## Objetivos de aprendizagem

Ao concluir o capítulo, a pessoa em formação deverá ser capaz de:

1. Confirmar se está na raiz de um repositório e registrar o estado inicial antes de qualquer edição.
2. Produzir um inventário de estrutura, manifestos, configurações, testes, scripts, automações e documentação sem confundir presença de arquivo com funcionamento comprovado.
3. Construir um mapa de dependências que diferencie dependências diretas, transitivas, de desenvolvimento, de runtime e de ferramentas.
4. Descrever a arquitetura atual somente até o nível sustentado por código, contratos, configuração e execução observáveis.
5. Separar fatos, inferências, hipóteses e perguntas em um artefato de contexto revisável.
6. Preparar uma IA de programação com contexto suficiente, escopo limitado e dados minimizados, sem lhe atribuir autoridade sobre decisões não descobertas.
7. Identificar riscos de cadeia de fornecimento, segredos, automação privilegiada, instruções maliciosas, incompatibilidade e perda de rastreabilidade.
8. Registrar invariantes que não podem ser quebradas durante a exploração ou por uma mudança posterior.

## O resultado esperado da exploração

O produto da exploração não é um texto que parece conhecer o sistema. É um **pacote de contexto verificável** que permite a outra pessoa repetir o caminho e contestar conclusões. O pacote deve conter, no mínimo:

- o caminho da raiz examinada e o modo como ela foi identificada;
- a árvore resumida, com arquivos omitidos explicitamente quando houver uma razão;
- o estado do Git, a branch, o commit, alterações locais, submódulos e arquivos não rastreados, quando aplicável;
- os manifestos e lockfiles encontrados, com versões e comandos de resolução documentados;
- os pontos de entrada, módulos principais, interfaces e fluxos de dados observados;
- os comandos de instalação, execução, teste, lint, build e verificação, separados entre documentados e confirmados por execução;
- automações, actions, containers, imagens, scripts e permissões que participam da entrega;
- dependências diretas e relações transitivas relevantes;
- dados sensíveis, fronteiras de confiança e áreas que exigem revisão adicional;
- fatos, inferências, hipóteses e perguntas de descoberta;
- limites da análise, incluindo arquivos que não puderam ser lidos ou comandos que não puderam ser executados.

Uma árvore não é uma arquitetura. Um manifesto não prova que as dependências foram instaladas. Um teste existente não prova que cobre o requisito. Um workflow válido em YAML não prova que possui permissões apropriadas. O pacote deve manter essas distinções visíveis.

## Resultado observável no material examinado

A leitura de `/home/ubuntu/vibe-coding-research` encontrou apenas a pasta `chapters/` com os seguintes arquivos Markdown existentes:

```text
vibe-coding-research/
└── chapters/
    ├── 02-linguagem.md
    ├── 03-entrega-organizacao.md
    ├── 04-debug-camadas.md
    ├── 05-calibrar-ia.md
    ├── 06-github-actions.md
    ├── 08-especificacao.md
    └── 10-implementacao-ia.md
```

A verificação de `git -C /home/ubuntu/vibe-coding-research rev-parse --show-toplevel` retornou “not a git repository”. Não há, no diretório examinado, `.git`, `package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`, `Cargo.toml`, `Dockerfile`, `compose.yml`, `.github/workflows/`, `src/`, `tests/`, `README.md` ou lockfile. A análise pode afirmar uma arquitetura editorial parcial, mas não pode afirmar uma arquitetura de aplicação, uma versão de runtime, uma dependência resolvida ou uma execução reproduzível.

O próprio capítulo que está sendo gravado passa a ser um novo arquivo da árvore. Essa mudança não deve ser confundida com descoberta de um arquivo que já existia. Em um repositório Git real, essa distinção seria preservada pelo estado inicial e pelo diff.

## Método de exploração em camadas

### 1. Confirmar a fronteira e a linha de base

Comece pelo caminho atual e suba até encontrar a raiz real. Não presuma que a pasta aberta no editor é a raiz do projeto. Execute, em modo de leitura, comandos equivalentes a:

```bash
pwd
find .. -name .git -type d -print
 git rev-parse --show-toplevel
 git status --short --branch
 git log -1 --oneline --decorate
 git submodule status
```

O espaço antes de `git rev-parse` no bloco é apenas tipográfico; o comando deve ser executado sem esse espaço. Se a pasta não for um repositório Git, registre o fato e pare de fazer afirmações sobre branch, commit, histórico, staged ou untracked. Não inicialize um repositório apenas para eliminar a mensagem: isso altera o objeto da análise.

O `git status` oficial distingue diferenças entre `HEAD`, índice, árvore de trabalho e arquivos não rastreados. O formato `--porcelain` é apropriado quando uma ferramenta precisa consumir o resultado de forma estável, mas sua estabilidade de saída não elimina a necessidade de interpretação humana [1]. O `git diff` permite examinar mudanças entre árvore, índice e commits; `git diff` e `git diff --staged` mostram estados diferentes e devem ser considerados juntos quando a mudança será integrada [2].

Antes de compartilhar contexto com uma IA, preserve a linha de base: commit, branch, saída sanitizada dos comandos, falhas preexistentes e arquivos que já estavam modificados. Se a base já falha, não atribua a falha automaticamente à próxima sugestão da IA.

### 2. Inventariar sem executar código desconhecido

Liste diretórios e arquivos relevantes, respeitando `.gitignore`, submódulos e limites de tamanho. Depois procure convenções e pontos de entrada:

```bash
find . -maxdepth 3 -type f | sort
find . -maxdepth 3 -type f \( -name 'README*' -o -name 'CONTRIBUTING*' -o -name 'SECURITY*' -o -name '*lock*' -o -name '*.toml' -o -name '*.json' -o -name '*.yml' -o -name '*.yaml' \) | sort
find . -path '*/.github/workflows/*' -type f -print
```

A presença de um script não significa que ele seja seguro para execução. Antes de rodar `install`, `setup`, `migrate`, `deploy`, `reset`, `clean`, hooks, Make targets ou scripts de shell, leia seu conteúdo e identifique efeitos destrutivos, rede, escrita de credenciais e alteração de infraestrutura. Se uma IA sugerir um comando, trate-o como código executável e peça uma explicação do impacto antes de executá-lo.

Não é necessário despejar a árvore inteira no prompt. Escolha os arquivos que mudam a decisão: manifesto, lockfile, README, instruções do projeto, módulo que contém o comportamento, contrato, testes relevantes, configuração de execução e automação afetada. Contexto irrelevante aumenta ruído; contexto ausente produz respostas genéricas.

### 3. Identificar a stack e o caminho de execução

Procure arquivos que expressem linguagem, runtime, framework, banco, transporte, empacotamento e ambiente. Confirme versões em fontes primárias e, quando possível, no próprio ambiente:

```bash
# exemplos; adaptar ao projeto, sem executar cegamente
python --version
node --version
npm --version
java --version
rustc --version
```

Registre duas colunas: “declarado pela documentação/configuração” e “confirmado por execução”. Uma versão no README pode estar obsoleta. Uma versão instalada localmente pode não ser a versão do CI ou da produção. A exploração deve revelar a diferença, não ocultá-la.

Siga uma solicitação ou comando desde a borda até a saída. Identifique, conforme aplicável, interface, roteamento, validação, autenticação, autorização, domínio, persistência, cache, filas, integrações externas, observabilidade e resposta. Em sistemas assíncronos, registre produtor, consumidor, evento, reentrega, ordenação e idempotência. Em aplicações de linha de comando, registre argumentos, arquivos acessados, processo principal e códigos de saída.

Descreva a arquitetura no nível da evidência. “O arquivo `x` importa `y`” é observação. “`y` é o serviço central” é uma interpretação que precisa de mais suporte, como chamadas, configuração, testes ou documentação. Uma arquitetura desenhada pela IA a partir de nomes de arquivos é um rascunho de exploração, não um diagrama aprovado.

### 4. Construir o mapa de dependências

O mapa deve distinguir quatro relações:

1. **Dependência física:** um módulo importa, inclui, copia ou chama outro arquivo.
2. **Dependência de resolução:** um manifesto e um lockfile determinam a versão concreta de um pacote.
3. **Dependência de execução:** um processo precisa de banco, serviço externo, variável, secret, filesystem, rede ou imagem.
4. **Dependência de entrega:** um workflow, script, action ou runner produz o artefato ou publica o serviço.

Para cada relação, registre origem, destino, tipo, versão, finalidade, criticidade, evidência e como atualizar ou remover. Não misture uma dependência direta declarada em `package.json` com uma dependência transitiva descoberta pelo lockfile. Não classifique uma ferramenta de teste como dependência de runtime sem verificar a forma de empacotamento.

Um registro pequeno é mais útil que uma lista sem contexto:

| Origem | Destino | Relação | Evidência | Risco ou pergunta |
| --- | --- | --- | --- | --- |
| `src/api` | `src/domain` | chamada direta | import e teste de integração | contrato de erro é explícito? |
| manifesto | pacote `X` | dependência direta | versão declarada e lockfile | licença e manutenção foram verificadas? |
| workflow | action externa | dependência de entrega | `uses:` e permissões | revisão, SHA e escopo do token? |
| serviço | banco | dependência de execução | configuração e código de conexão | timeout, migração e recuperação? |

A OWASP observa que dependências de terceiros deslocam parte da postura de segurança para componentes externos e recomenda análise automatizada desde o início, em vez de acumular vulnerabilidades para uma fase posterior [6]. Esse controle deve começar durante a exploração, mas um scanner não substitui entender o caminho da dependência, a versão afetada, o alcance real e a mitigação.

### 5. Ler automação, containers e configuração como código

Workflows, Dockerfiles, manifests, scripts de migração e arquivos de infraestrutura não são documentação passiva. Eles podem executar comandos, buscar código, montar volumes, alterar permissões, acessar tokens ou publicar artefatos. Leia-os com a mesma atenção de um módulo de produção.

No GitHub Actions, confirme eventos, condições, `permissions`, actions de terceiros, checkout, caches, artefatos, runners e exposição de secrets. A documentação oficial recomenda começar com acesso mínimo para o `GITHUB_TOKEN`, auditar actions e evitar checkout de código não confiável em contextos privilegiados como `pull_request_target` ou `workflow_run` [5]. Um workflow gerado pela IA pode ser sintaticamente correto e ainda assim criar uma fronteira de confiança perigosa.

Em Docker, confirme o contexto de build, `.dockerignore`, imagem-base, usuário, portas, volumes, secrets, healthcheck e comandos de inicialização. Uma imagem ou container melhora a repetibilidade do ambiente, mas não torna automaticamente seguros os pacotes, permissões, rede ou credenciais. A exploração deve registrar quais propriedades são comprovadas e quais ainda são hipótese.

### 6. Preparar o contexto para a IA

Antes do prompt de implementação, peça uma leitura sem edição. Um pacote de contexto adequado informa:

- objetivo da mudança e quem é afetado;
- caminho da raiz e estado da linha de base;
- arquivos autorizados e proibidos;
- versão de linguagem, runtime e framework;
- contratos e invariantes existentes;
- comandos de validação conhecidos;
- casos de erro e restrições de segurança;
- dependências que não podem ser trocadas;
- resultado observável e não objetivos;
- dados que não podem sair do ambiente.

Peça a seguinte forma de saída:

```text
1. Fatos observados, com arquivo e trecho ou comando de origem.
2. Inferências, com o motivo e o nível de confiança.
3. Hipóteses que precisam de verificação.
4. Perguntas bloqueadoras antes de editar.
5. Arquivos relevantes e arquivos fora do escopo.
6. Riscos, invariantes e testes de descoberta.
7. Plano de leitura; não produzir código ainda.
```

Depois compare essa resposta com o repositório. A IA pode encontrar relações que a pessoa não percebeu, mas não pode confirmar um fato que não aparece no contexto nem no ambiente. O guia do GitHub para revisão de código gerado por IA recomenda começar por compilação, testes e análise estática; verificar se a mudança resolve o problema correto e respeita a arquitetura; examinar dependências; procurar APIs alucinadas, restrições ignoradas e testes removidos; e combinar automação com revisão colaborativa [3].

A própria documentação do GitHub é uma fonte específica sobre sua ferramenta, não uma garantia universal sobre todos os modelos. Para qualquer outra IA, mantenha o mesmo princípio: a saída é uma proposta revisável, não uma autorização.

## Arquitetura atual e mapa de dependências do material examinado

A arquitetura observável de `/home/ubuntu/vibe-coding-research` é editorial, não executável. Os capítulos existentes formam uma sequência temática parcial:

| Componente existente | Papel observável | Relação com este capítulo |
| --- | --- | --- |
| `02-linguagem.md` | escolha de linguagem, runtime e framework | recebe o inventário de stack, suporte, equipe e riscos que a exploração torna explícitos |
| `03-entrega-organizacao.md` | árvore, documentação, configuração, dependências e entrega | fornece convenções e artefatos que devem ser encontrados e confirmados na exploração |
| `04-debug-camadas.md` | diagnóstico por fronteiras e evidências | usa a arquitetura observada para escolher camadas e testes discriminantes |
| `05-calibrar-ia.md` | contexto, escopo e ciclo de feedback | transforma o pacote de exploração em instruções controladas para a IA |
| `06-github-actions.md` | GitHub Flow, CI/CD, permissões e secrets | examina a automação descoberta como código de alto impacto |
| `08-especificacao.md` | requisitos, contratos, limites e critérios de aceitação | usa perguntas de descoberta para separar o que existe do que ainda precisa ser decidido |
| `10-implementacao-ia.md` | patch pequeno, diff, testes e integração | só deve receber autorização depois que contexto, invariantes e escopo estiverem claros |

Esse mapa é uma dependência **conceitual** entre capítulos. Não é um grafo de importações, porque não há código ou manifesto que o sustente. Também não é possível afirmar que os arquivos não listados (`01`, `07`, `09` ou outros) não existam em outro lugar; é possível afirmar apenas que não estavam presentes na árvore examinada.

A ordem de trabalho sugerida é: explorar e registrar contexto; especificar o comportamento e as perguntas bloqueadoras; escolher ou confirmar a stack; calibrar a IA; implementar em diff pequeno; validar e integrar. A ordem editorial dos arquivos não prova que todos os passos foram executados.

## Invariantes de exploração

As invariantes são propriedades que o processo deve preservar mesmo quando a IA propõe atalhos:

1. **Não inventar estado.** Nenhuma afirmação sobre branch, commit, dependência, versão, runtime, teste ou deploy sem evidência correspondente.
2. **Não transformar ausência em aprovação.** Arquivo, teste, workflow ou documentação ausente vira lacuna ou risco; não vira “não necessário” sem decisão explícita.
3. **Preservar a linha de base.** A exploração não deve apagar alterações locais, reescrever histórico, instalar dependências ou alterar infraestrutura sem autorização e registro.
4. **Separar leitura de edição.** O primeiro ciclo com a IA é de inventário e perguntas; o patch só é autorizado após resolver bloqueadores.
5. **Minimizar dados.** Segredos, tokens, dados pessoais, código restrito e dumps reais não entram no prompt. Use dados sintéticos e logs sanitizados.
6. **Manter fronteiras de confiança.** Código de contribuição, scripts, actions, imagens e dependências externas são entradas potencialmente não confiáveis até revisão.
7. **Preservar contratos e compatibilidade.** Nenhuma mudança de API, schema, evento, migração, permissão ou formato é implícita.
8. **Explicar cada dependência nova.** Um pacote, action, imagem ou serviço só entra com origem, versão, finalidade, licença quando aplicável, manutenção, escopo e estratégia de atualização.
9. **Tornar conclusões contestáveis.** Todo fato relevante deve apontar arquivo, comando, execução ou fonte; toda inferência deve expor suas premissas.
10. **Manter reversibilidade.** Exploração, spike e patch devem ocorrer em branch ou cópia apropriada, com uma forma conhecida de abandonar a hipótese.
11. **Não confundir check verde com compreensão.** Testes e scanners são evidência sobre propriedades verificadas, não prova de que o modelo mental da equipe está correto.
12. **Responsabilidade humana no aceite.** A IA pode sugerir e criticar; uma pessoa responsável decide se o contexto é suficiente e se o risco residual é aceitável.

## Riscos prioritários

### Contexto incompleto ou errado

A IA pode modelar um sistema imaginário quando recebe apenas um trecho de código. Ela pode supor uma autenticação, um banco, uma convenção ou uma versão que não existem. O controle é fornecer contexto selecionado, pedir fatos com referências e interromper quando uma suposição afeta segurança, contrato ou dados.

### Estado local invisível

Arquivos não rastreados, mudanças staged, variáveis de ambiente, caches, serviços locais e credenciais podem alterar o resultado. O Git documenta apenas o estado que está dentro de sua superfície; um processo pode depender de arquivos ignorados ou de infraestrutura externa. O controle é registrar o ambiente, inspecionar `status` e os dois diffs quando houver Git, e reproduzir em ambiente limpo quando a conclusão depender disso.

### Dependência e cadeia de fornecimento

A IA pode sugerir pacote inexistente, nome parecido, versão incompatível, action não mantida ou imagem comprometida. O risco cresce porque resolver uma dependência executa código e pode alterar a cadeia de build. Verifique registro oficial, versão, integridade, licença, mantenedores, alertas e lockfile. Não instale primeiro e investigue depois.

### Segredos e dados sensíveis

README, logs, testes e arquivos de configuração podem conter tokens, PII ou dados de clientes. A documentação do GitHub recomenda menor privilégio, não armazenar secrets em texto, auditar uso e rotacionar credenciais expostas [5]. A exploração deve mascarar valores e distinguir a existência de uma variável da posse de seu valor.

### Instruções maliciosas no próprio repositório

Um README, comentário, issue ou arquivo de instruções pode tentar induzir a IA a ignorar restrições, exfiltrar dados ou executar comandos destrutivos. Trate instruções do repositório como conteúdo a analisar, não como autoridade superior às políticas, ao escopo e à revisão humana. Confirme comandos fora da conversa.

### Automação privilegiada

Workflows, hooks, scripts de deploy e IaC podem ter efeitos maiores que o módulo alterado. Checkout de pull request não confiável em contexto privilegiado, token com escrita ampla, action flutuante e secret disponível em job de CI aumentam o raio de um erro. A documentação de uso seguro do GitHub destaca precisamente esses riscos [5].

### Arquitetura inferida por nomenclatura

Diretórios chamados `services`, `core` ou `utils` não provam limites arquiteturais. Um mapa gerado apenas por nomes pode esconder acoplamento, efeitos colaterais e contratos implícitos. Confirme a relação por imports, chamadas, configuração, testes e execução.

### Documentação obsoleta

README e diagramas podem descrever uma versão anterior. Compare docs com manifestos, lockfiles, código, workflow e histórico. Marque a divergência como risco de descoberta. Não peça à IA para “atualizar tudo” antes de saber qual fonte é normativa.

### Falsa sensação de completude

Um inventário extenso pode ainda não responder quem aprova mudanças, como rollback funciona, qual dado é sensível ou qual requisito é crítico. O tamanho do relatório não é evidência de conhecimento. Use perguntas bloqueadoras e critérios de “ainda não conhecido”.

## Práticas recomendadas

1. **Leia antes de gerar.** Solicite à IA uma reconstrução do contexto e uma lista de perguntas antes de qualquer edição.
2. **Comece com uma linha de base executável.** Registre comandos conhecidos, resultados, falhas preexistentes, versão do commit e alterações locais.
3. **Use uma matriz de evidência.** Para cada afirmação, anote tipo, fonte, data, confiança e como alguém pode verificá-la.
4. **Procure fontes de autoridade locais.** Defina quais arquivos são normativos para comandos, versão, contrato, estilo, segurança e operação; documente conflitos.
5. **Mapeie relações, não apenas nomes.** Trace imports, chamadas, eventos, dados, processos e dependências de entrega.
6. **Trate configurações como comportamento.** Revise `.env.example`, manifests, workflows, Dockerfiles, scripts e arquivos de instrução como código executável ou potencialmente executável.
7. **Confronte documentação com execução.** Separe “documentado”, “observado no código”, “confirmado localmente” e “não verificável neste ambiente”.
8. **Use perguntas de descoberta como saída.** Uma boa exploração reduz incerteza mesmo quando não consegue fechar uma decisão.
9. **Envie contexto mínimo suficiente à IA.** Inclua somente arquivos relevantes, versões, contratos, restrições e evidências; remova segredos e dados reais.
10. **Peça rastreabilidade na resposta.** Exija arquivo, linha, comando, fonte ou declaração explícita de incerteza para cada conclusão importante.
11. **Faça revisão adversarial.** Pergunte quais fatos podem estar errados, quais dependências foram inferidas, quais caminhos não foram lidos e qual ação seria perigosa.
12. **Registre o que não foi analisado.** Limites são parte do resultado e devem aparecer no pull request ou no relatório de contexto.
13. **Atualize o inventário após mudanças.** O contexto é um artefato versionado; um patch pode alterar manifestos, limites, entradas, contratos e riscos.
14. **Mantenha o ser humano como responsável técnico.** A IA acelera leitura e escrita, mas a equipe decide a suficiência da evidência e a aceitação do risco.

## Antipadrões

- **Pedir “entenda o projeto inteiro” sem delimitar uma pergunta.** O resultado é um resumo genérico, impossível de auditar.
- **Assumir que a pasta aberta é a raiz.** Isso omite configuração, histórico, monorepo, submódulos ou diretórios irmãos.
- **Inicializar Git para fazer a exploração parecer limpa.** O comando altera o estado e fabrica uma linha de base.
- **Executar todo script de setup sugerido pela IA.** Um script pode instalar código, apagar dados, exfiltrar variáveis ou mudar infraestrutura.
- **Copiar o repositório inteiro para o prompt.** Isso amplia exposição de dados e aumenta ruído sem indicar o que é autoridade.
- **Aceitar a árvore como arquitetura.** Pastas e nomes não demonstram fluxo de dados, acoplamento ou contrato.
- **Ler apenas o README.** Documentação pode estar incompleta ou defasada; confirme manifesto, código, testes e automação.
- **Ler apenas manifestos.** Dependências declaradas não revelam todos os caminhos de execução, permissões ou efeitos de scripts.
- **Instalar pacote sugerido antes de verificar sua existência e procedência.** A sugestão plausível da IA pode ser uma dependência inexistente ou maliciosa.
- **Pedir um patch enquanto há perguntas bloqueadoras.** A implementação cristaliza uma suposição ainda não decidida.
- **Tratar uma resposta confiante como confirmação.** Fluência não substitui arquivo, comando, documentação ou teste.
- **Compartilhar segredos para “dar contexto”.** Um segredo exposto não é revertido por apagar a mensagem; deve ser revogado e rotacionado.
- **Usar CI verde como prova da arquitetura.** O check só testa o que foi configurado e executado.
- **Gerar um mapa sem data e sem versão.** O contexto envelhece e pode deixar de corresponder ao código.
- **Misturar observação, decisão e implementação no mesmo relatório.** Isso dificulta contestar uma inferência e transforma descoberta em autorização.

## Perguntas de descoberta

As perguntas devem ser respondidas por evidência ou registradas como abertas. Elas não são um formulário para preencher mecanicamente.

### Fronteira e propósito

1. Qual é a finalidade do sistema e qual comportamento de negócio ele torna possível?
2. Quem usa, quem administra e quem pode ser afetado por uma falha?
3. Qual é a unidade de mudança em análise e o que está deliberadamente fora dela?
4. Qual diretório é a raiz real? Há monorepo, submódulo, worktree ou código gerado fora da árvore?
5. Qual arquivo ou documento é a autoridade para cada decisão relevante?

### Execução e arquitetura

6. Qual é o ponto de entrada real em desenvolvimento, teste e produção?
7. Qual é o caminho de uma entrada até persistência, evento, resposta ou efeito externo?
8. Onde ficam validação, autenticação, autorização, transação, retry, idempotência e tratamento de erro?
9. Quais componentes são síncronos e quais são assíncronos? Como eventos são versionados e reentregues?
10. Quais limites existem entre módulos, processos, containers, serviços, contas ou redes?
11. Que invariantes o código já preserva, e onde elas são testadas ou apenas implícitas?

### Stack e dependências

12. Qual linguagem, runtime, framework e sistema operacional são suportados?
13. Qual versão é declarada, qual está instalada e qual o CI realmente executa?
14. Quais dependências são diretas, transitivas, de desenvolvimento e de produção?
15. Há lockfile, imagem pinada, checksum, assinatura ou outro mecanismo de reprodutibilidade?
16. Quem mantém cada dependência crítica, qual a licença e como vulnerabilidades são tratadas?
17. Há código gerado, vendorizado, plugin, action, script de instalação ou ferramenta externa que execute código?

### Dados e segurança

18. Que dados são pessoais, confidenciais, regulados, secretos ou de alto impacto?
19. Onde os dados entram, são transformados, persistem, logam, exportam e são descartados?
20. Quais credenciais o processo, o CI e os ambientes possuem? Qual é o menor privilégio necessário?
21. Entradas de usuários, issues, branches, artefatos e dependências são tratadas como não confiáveis onde?
22. Como são feitos backup, restauração, rotação de segredo, resposta a vulnerabilidade e revogação?

### Validação e operação

23. Quais comandos comprovam instalação, execução, testes, lint, build e migração?
24. Quais falhas existiam antes da exploração e quais foram confirmadas neste ambiente?
25. Que requisitos não são testados automaticamente? Quem revisa os caminhos negativos?
26. Quais métricas, logs, traces, alertas e identificadores de correlação existem?
27. Como identificar o artefato em execução, fazer rollback e distinguir código de configuração?
28. Quem pode aprovar, mesclar, publicar e alterar infraestrutura?

### Trabalho com a IA

29. Que arquivos a IA precisa ler para a pergunta atual e quais não devem ser enviados?
30. Quais comandos ela pode sugerir, executar ou nunca executar sem confirmação?
31. Quais fatos exigem fonte oficial externa e quem abrirá e verificará cada fonte?
32. Como será registrada a participação da IA, o diff aceito, as verificações e os riscos residuais?
33. Qual critério fará a equipe interromper a geração e pedir decisão humana sobre contrato, segurança ou arquitetura?

## Como trabalhar com a IA durante a exploração

Use três rodadas, sem misturar suas finalidades.

**Rodada 1 — inventário.** Forneça a árvore curta, os manifestos, a documentação relevante e a saída sanitizada do estado. Peça fatos observados, arquivos normativos, relações de dependência e lacunas. Proíba edição e execução de comandos.

**Rodada 2 — hipóteses e perguntas.** Peça um mapa de fluxo e arquitetura com cada aresta acompanhada de evidência. Peça duas hipóteses alternativas para cada relação não confirmada e as observações que as distinguiriam. Peça riscos e perguntas bloqueadoras.

**Rodada 3 — contexto de trabalho.** Depois de revisar as duas primeiras respostas, produza um resumo curto para a tarefa seguinte: objetivo, arquivos relevantes, contratos, invariantes, comandos, não objetivos, riscos e perguntas resolvidas. O resumo deve ser aprovado por uma pessoa antes de autorizar a IA a propor código.

Prompt-modelo:

```text
Você está fazendo somente exploração de um repositório. Não edite arquivos,
não instale dependências e não execute comandos destrutivos. Com base nos
arquivos fornecidos e nos comandos explicitamente autorizados:

1. liste fatos observados com caminho e evidência;
2. separe inferências e declare suas premissas;
3. mapeie dependências físicas, de resolução, execução e entrega;
4. descreva o fluxo de dados e os limites arquiteturais observáveis;
5. liste invariantes explícitas e invariantes que precisam ser confirmadas;
6. identifique secrets, entradas não confiáveis, permissões e riscos;
7. produza perguntas bloqueadoras antes de qualquer implementação.

Não invente versões, APIs, arquivos, testes, comandos ou requisitos. Quando
algo não estiver disponível, escreva “não verificado”. Não envie segredos para
nenhum serviço.
```

Esse método é coerente com a orientação do GitHub para revisão de código gerado por IA: verificar contexto e intenção, fornecer README e documentação confiáveis, avaliar dependências e pedir à ferramenta que explicite suposições, limitações e questões que requerem julgamento humano [3]. Também é coerente com o NIST SSDF, que propõe práticas de desenvolvimento seguro integráveis ao ciclo de vida para reduzir vulnerabilidades e criar vocabulário comum de risco [4].

## Exercício de formação — inventário verificável de um projeto desconhecido

Use uma cópia sem dados sensíveis do diretório de estudo ou um pequeno repositório didático que contenha código, testes, um manifesto, um lockfile, um workflow e uma configuração de execução. O objetivo não é implementar uma funcionalidade. O objetivo é descobrir o que pode ser afirmado com segurança.

1. **Linha de base.** Registre caminho, árvore, existência de `.git`, branch, commit, estado, submódulos e arquivos não rastreados. Se não for Git, declare explicitamente a limitação; não inicialize um repositório.
2. **Inventário.** Liste manifestos, lockfiles, README, instruções, pontos de entrada, testes, scripts, workflows, Dockerfiles, variáveis de ambiente e artefatos gerados. Para cada item, registre se foi apenas encontrado, lido ou executado.
3. **Mapa.** Construa uma tabela com pelo menos dez relações. Classifique cada uma como física, de resolução, de execução ou de entrega. Inclua evidência e uma pergunta para toda relação que não puder ser confirmada.
4. **Arquitetura.** Desenhe um diagrama simples do fluxo observado. Marque linhas como confirmadas, inferidas ou desconhecidas. Não use nomes de diretório como única evidência de uma fronteira.
5. **Invariantes e riscos.** Escreva pelo menos oito invariantes e cinco riscos. Inclua um risco de dependência, um de segredo, um de automação privilegiada, um de documentação defasada e um de contexto enviado à IA.
6. **IA somente leitura.** Envie à IA o prompt de exploração deste capítulo e um subconjunto sanitizado dos arquivos. Compare a resposta com o inventário. Marque cada afirmação como confirmada, hipótese ou incorreta.
7. **Perguntas bloqueadoras.** Escolha cinco perguntas que precisam de resposta antes de qualquer patch. Para cada uma, indique proprietário, fonte esperada e consequência de continuar sem resposta.
8. **Relatório final.** Entregue o inventário, mapa, diagrama, invariantes, riscos, perguntas, limitações, prompt usado, divergências encontradas na resposta da IA e uma decisão: “contexto suficiente para especificar” ou “contexto insuficiente”.

A atividade é concluída somente quando outra pessoa consegue repetir a exploração e distinguir o que foi observado do que foi inferido. Um relatório longo sem evidência, ou um mapa que afirma arquitetura em um diretório sem código, não atende ao exercício.

## Conclusão

Exploração responsável reduz incerteza antes de aumentar o volume de código. Ela cria uma linha de base, torna dependências e fronteiras visíveis, preserva invariantes e transforma lacunas em perguntas. A IA é útil nesse trabalho quando compara arquivos, propõe hipóteses e aponta relações para verificação. Ela é perigosa quando sua fluência é confundida com acesso ao sistema ou quando um inventário plausível vira autorização de mudança.

A diferença entre velocidade e responsabilidade é operacional: a IA pode produzir um mapa em segundos, mas a equipe ainda precisa confirmar a raiz, ler os arquivos, verificar o ambiente, proteger os dados, avaliar o risco e decidir se o contexto é suficiente para agir. O resultado de uma boa exploração pode ser “ainda não sabemos”. Registrar essa conclusão é mais seguro do que gerar código para preencher o vazio.

## Referências

[1]: https://git-scm.com/docs/git-status "Git — git-status Documentation"
[2]: https://git-scm.com/docs/git-diff "Git — git-diff Documentation"
[3]: https://docs.github.com/en/copilot/tutorials/review-ai-generated-code "GitHub Docs — Review AI-generated code"
[4]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218 — Secure Software Development Framework (SSDF) Version 1.1"
[5]: https://docs.github.com/en/actions/reference/security/secure-use "GitHub Docs — Secure use reference"
[6]: https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html "OWASP — Vulnerable Dependency Management Cheat Sheet"

As seis páginas acima foram abertas e lidas durante a pesquisa. Git fundamenta a verificação da linha de base e do diff; GitHub fundamenta a revisão de código gerado por IA e os controles de Actions; NIST fundamenta a integração de práticas de desenvolvimento seguro ao ciclo de vida; e OWASP fundamenta o inventário e a análise contínua de dependências. As fontes não autorizam afirmar que uma saída de IA é correta por si só nem que um repositório sem evidência possui uma arquitetura específica.

# Capítulo 11 — Engenharia e arquitetura de segurança do projeto

## Tese

Vibe Coding pode reduzir o tempo entre uma ideia e um protótipo, mas não reduz a responsabilidade técnica por segurança, privacidade, confiabilidade e sustentabilidade. A IA de programação acelera a geração e a transformação de código; ela não conhece automaticamente o contexto de ameaça, a classificação dos dados, os limites de confiança, as políticas do ambiente, o contrato das dependências nem o impacto operacional de uma decisão arquitetural. Portanto, código gerado por IA deve entrar no mesmo fluxo de engenharia que qualquer código de autoria humana: requisitos explícitos, modelagem de ameaças, revisão, testes, controles de acesso, gestão de mudanças e evidência de operação segura.

A abordagem responsável é **secure by design**: decisões sobre fronteiras, dados, identidade, privilégios, dependências, observabilidade e recuperação são tomadas antes ou junto da implementação, e são revistas quando o sistema muda. O NIST SSDF recomenda práticas de alto nível que podem ser integradas a qualquer ciclo de desenvolvimento para reduzir vulnerabilidades, limitar o impacto de falhas não detectadas e atacar suas causas. [1] O framework Secure by Design da OWASP reforça que a arquitetura deve ser avaliada durante planejamento e design, antes que decisões difíceis de reverter sejam cristalizadas. [2]

## O que precisa ser protegido

O primeiro passo é registrar ativos e propriedades de segurança. A lista mínima costuma incluir credenciais, tokens de sessão, chaves de assinatura, dados pessoais, dados financeiros, código-fonte, artefatos de release, ambientes de produção e capacidade de publicar ou alterar infraestrutura. Para cada ativo, indique confidencialidade, integridade, disponibilidade, autenticidade, rastreabilidade e requisitos de privacidade. Uma aplicação que apenas renderiza uma página pública tem uma superfície diferente de uma API que altera pagamentos ou de um pipeline que publica imagens com acesso à nuvem.

### Modelagem de ameaças como rotina de projeto

A modelagem de ameaças é um processo estruturado e repetível para compreender um sistema a partir da perspectiva de um adversário, identificar ameaças aplicáveis e decidir respostas. A OWASP recomenda iniciá-la cedo, mantê-la ao longo da evolução do sistema e integrá-la ao SDLC, em vez de tratá-la como uma auditoria única. [3]

Um fluxo pequeno, mas suficiente para um projeto assistido por IA, responde a quatro perguntas: **o que estamos construindo? o que pode dar errado? o que faremos a respeito? fizemos um trabalho bom o bastante?** Desenhe um diagrama de fluxo de dados com entidades externas, processos, armazenamentos, fluxos e fronteiras de confiança. Em seguida, use STRIDE ou outra técnica adequada para procurar falsificação, adulteração, repúdio, divulgação de informação, negação de serviço e elevação de privilégio. Registre cada ameaça com ativo afetado, pré-condição, impacto, probabilidade, controle preventivo, detecção, resposta, responsável e decisão de risco.

A IA pode ajudar a transformar uma descrição em um rascunho de DFD, sugerir ameaças ou gerar casos de abuso, mas a equipe deve corrigir o modelo com conhecimento do negócio. Um prompt útil fornece o diagrama, os fluxos de dados classificados, os atores, os limites de confiança e as premissas. Solicite uma tabela de ameaças e peça que a IA declare incertezas. Não peça apenas “adicione segurança”: essa instrução não define o que deve ser protegido nem contra quem.

### Menor privilégio e separação de responsabilidades

Menor privilégio significa conceder somente a permissão necessária, pelo menor tempo e ao menor número de componentes. A regra deve aparecer na aplicação, no banco, nos ambientes, no CI/CD, nos tokens e nas ferramentas da IA. Separe desenvolvimento, teste e produção; use identidades diferentes; elimine permissões de escrita quando somente leitura basta; restrinja escopo, audiência e duração de tokens; e exija revisão humana para ações de alto impacto.

No GitHub Actions, a documentação recomenda dar ao `GITHUB_TOKEN` apenas leitura por padrão e ampliar permissões no job que realmente precisa delas. [4] A mesma lógica vale para um agente de programação: ele pode ler um subconjunto do repositório e executar testes em um ambiente descartável, mas não deve receber de modo automático credenciais de produção, acesso irrestrito ao shell ou permissão de publicar. Um agente capaz de editar o workflow e também ler segredos cria um caminho direto de escalada de privilégio.

Trate entrada de pull request, issue, comentário, nome de branch e artefatos como dados não confiáveis. A documentação do GitHub alerta que workflows privilegiados, como aqueles com `pull_request_target` ou `workflow_run`, podem expor segredos e escrita no repositório quando fazem checkout de código não confiável. [4] Separe o job que analisa código não confiável do job privilegiado que assina ou publica; separe também caches, artefatos e diretórios compartilhados.

### Gestão de segredos

Segredo não é configuração comum. API keys, senhas, chaves privadas, tokens, certificados e credenciais temporárias devem ter inventário, proprietário, finalidade, ambiente, escopo, expiração, rotação, revogação e evidência de acesso. A OWASP recomenda políticas que limitem entidades capazes de ler ou escrever cada segredo, separação de segredos de desenvolvimento e produção, monitoramento de quem acessa o valor e rotação ou revogação quando houver suspeita. [5]

Nunca coloque segredos no código, em exemplos, em imagens de contêiner, em logs, em artefatos ou em prompts enviados a um serviço de IA. O `.gitignore` ajuda, mas não corrige um segredo já comitado no histórico. Se um segredo apareceu em log ou repositório, remova o acesso, apague o log quando aplicável, faça rotação e investigue o uso. Em pipelines, defina permissões mínimas, use ambientes protegidos com aprovação para operações de produção e revise ações de terceiros.

Em builds Docker, não use `ARG` nem `ENV` para passar segredos, pois eles podem persistir na imagem final. A documentação oficial recomenda secret mounts ou SSH mounts, que expõem a credencial somente durante a instrução necessária. [6] O princípio arquitetural é que a aplicação receba o segredo no ponto de uso e pelo menor intervalo possível, e não que o segredo seja propagado pela cadeia de build.

### Validação e tratamento seguro de dados

Valide dados não confiáveis no limite de entrada, mas não confunda validação com uma defesa completa contra injeção. A OWASP recomenda validação sintática, que verifica a forma, e semântica, que verifica se o valor faz sentido no contexto de negócio. Prefira allowlist, tipos, esquemas, limites de tamanho e faixa, normalização e validação no servidor. Denylist pode capturar padrões conhecidos como camada adicional, mas não deve ser a defesa principal. [7]

Depois da validação, use controles específicos para o contexto: consultas parametrizadas para banco, codificação de saída para o destino, APIs seguras de sistema de arquivos, limites de tempo e tamanho, e bibliotecas de parsing configuradas com segurança. Valide também respostas e dados de fornecedores, filas, webhooks e serviços internos; uma origem “interna” pode estar comprometida. Para uploads, valide tipo e tamanho, armazene fora do caminho executável e sirva com política adequada. Teste entradas ausentes, duplicadas, Unicode, valores extremos, formatos ambíguos, tentativas de traversal e payloads que cruzam fronteiras de interpretação.

Peça à IA para produzir testes de propriedades e casos negativos junto com o código. Depois verifique manualmente se ela preservou invariantes de autorização, limites transacionais e tratamento de erro. Uma validação gerada com regex pode aceitar uma forma perigosa, rejeitar nomes válidos ou criar uma falsa sensação de segurança.

### Dependências, supply chain e reprodutibilidade

Uma dependência é código executado sob o privilégio da aplicação. O risco inclui vulnerabilidade conhecida, dependência maliciosa, dependência transitiva, confusão de nomes, projeto abandonado, licença incompatível, comprometimento do mantenedor, ferramenta de build contaminada, cache envenenado e artefato publicado a partir de fonte não autorizada. A OWASP descreve a cadeia de software como abrangendo IDE, código, VCS, bibliotecas, gerenciadores de pacotes, ferramentas de build, CI/CD e configuração. [8]

Mantenha manifesto e lockfile revisados, fixe versões verificadas, registre origem e licença, mantenha um inventário ou SBOM e monitore avisos de segurança. A revisão de dependências do GitHub pode bloquear um pull request que introduza vulnerabilidade ou licença não permitida; o workflow deve ter apenas `contents: read` quando esse for seu único objetivo. [9] A correção não é “atualizar tudo” sem testes: atualize em ambiente de teste, execute testes unitários, integração, funcionais e de segurança, avalie compatibilidade e documente exceções com prazo e responsável. Para uma vulnerabilidade transitiva, compreenda o caminho desde a dependência direta até o componente afetado antes de escolher atualização, mitigação ou aceitação formal do risco. [10]

Proteja também a origem do artefato. Coloque workflows e scripts de build sob revisão e controle de versão, limite a rede e privilégios do builder, evite ações de terceiros não avaliadas e prefira referências imutáveis quando a política permitir. Proveniência é a informação verificável sobre onde, quando e como um artefato foi produzido; SLSA organiza garantias crescentes e formatos de atestação para que consumidores possam verificar essa relação. [11] Isso não transforma um artefato em seguro por si só: proveniência ajuda a responder “de onde veio e como foi construído”, enquanto análise de código, dependências e comportamento respondem “o que ele faz”.

A IA aumenta o risco de supply chain quando inventa pacotes, escolhe dependências populares sem avaliação, copia comandos de instalação de fontes não verificadas ou sugere desabilitar lockfiles e scanners. Exija justificativa para cada novo pacote, compare documentação oficial, mantenedores, versão, licença, vulnerabilidades, escopo de permissões e necessidade real. O ganho de velocidade deve ser medido contra o custo de incorporar código que ninguém consegue explicar ou atualizar.

### Privacidade por arquitetura

Privacidade não é apenas criptografar banco. Defina finalidade, necessidade, base de uso, retenção, acesso, compartilhamento e descarte. Colete o mínimo de dados para a finalidade declarada; não registre tokens, senhas, conteúdo sensível ou identificadores desnecessários; separe dados de identidade de dados de uso quando possível; aplique controle de acesso por função ou atributo; e implemente correção, exportação e exclusão quando exigidas pelo produto ou pela política aplicável.

A lista de riscos de privacidade da OWASP inclui coleta além da finalidade consentida, políticas não transparentes, exclusão insuficiente, qualidade insuficiente e vazamento operado por terceiros. [12] A orientação da OWASP também recomenda criptografia forte em trânsito e repouso, proteção de chaves, invalidação remota de sessões, cuidado com vazamento de IP por conteúdo de terceiros e transparência sobre solicitações ou divulgação de dados. [13] Modele no DFD para onde dados pessoais vão, quais serviços os recebem, quais logs os replicam e quem consegue reidentificá-los. Em uma interação com IA, remova dados pessoais, segredos e código confidencial do contexto sempre que não forem indispensáveis; estabeleça política de retenção e de uso do provedor.

### Arquitetura sustentável

Sustentabilidade é uma propriedade operacional e arquitetural, não um adorno de interface. A Green Software Foundation define software verde como software eficiente em carbono. Três mecanismos reduzem emissões: eficiência energética, consciência de carbono e eficiência de hardware. A disciplina também recomenda medição e consideração do carbono incorporado no hardware. [14]

Comece por medir o que é relevante: tempo de CPU, memória, bytes transferidos, duração de jobs de CI, chamadas a serviços externos, tamanho de imagens e custo de armazenamento. Reduza trabalho desnecessário com cache seguro, processamento incremental, consultas seletivas, payloads menores, compressão apropriada, imagens de contêiner mínimas, desligamento de ambientes ociosos e limites de concorrência. Escolha arquitetura proporcional ao problema; mais microsserviços, camadas ou chamadas remotas podem aumentar superfície de ataque, latência, consumo e dificuldade de operação. Inclua SLOs de confiabilidade e segurança, pois uma otimização que remove logs, backups ou controles de acesso não é sustentável.

Peça à IA alternativas com estimativa de custo computacional e de dependências, mas valide os números com medição. Uma arquitetura sustentável não é automaticamente segura: reduzir retenção pode ajudar privacidade e custo, enquanto reduzir redundância pode prejudicar disponibilidade e recuperação. As decisões devem registrar os trade-offs e os limites aceitáveis.

## Como trabalhar com uma IA de programação

1. **Antes do prompt:** escreva ativos, usuários, dados, fronteiras de confiança, requisitos de privacidade, permissões e critérios de aceite. Não envie segredos ou dados pessoais desnecessários.
2. **Durante a geração:** solicite um plano pequeno, ameaças, invariantes, testes negativos, dependências propostas e justificativas. Prefira patches revisáveis a reescritas completas. Instrua a IA a não modificar workflows, lockfiles, políticas ou infraestrutura sem autorização explícita.
3. **Na revisão:** leia o diff como responsável técnico. Verifique autorização em cada caminho, validação no servidor, tratamento de erros, logs, expiração de tokens, consultas, uploads, dependências, licenças e impacto de dados. Execute testes, linters, SAST, análise de dependências, secret scanning e, conforme o risco, DAST ou revisão especializada.
4. **Antes de integrar:** exija revisão humana para mudanças que cruzam fronteira de confiança, acessam dados sensíveis, alteram privilégio, adicionam dependência, mudam pipeline ou publicam artefato. Registre decisões, exceções, evidências e plano de rollback.
5. **Depois do release:** monitore acessos e falhas, atualize ameaças e dependências, teste recuperação e revogue credenciais quando necessário. O fato de a IA ter produzido o código não transfere a ela responsabilidade legal, operacional ou técnica.

## Antipadrões

- **“Funcionou no protótipo, então está seguro.”** Protótipo pode omitir autenticação, autorização, limites, logs e gestão de dados.
- **“A IA revisou o próprio código.”** Uma segunda geração automática não substitui revisão independente nem evidência de teste.
- **Segredo em `.env`, comentário ou prompt.** Arquivos, histórico, logs, caches e provedores podem replicar o valor.
- **Permissão ampla para acelerar.** `admin`, token de produção ou `pull_request_target` com checkout de código não confiável transformam uma conveniência em caminho de comprometimento.
- **Denylist como validação.** Bloquear `<script>` ou `1=1` não cobre codificações, contextos e entradas legítimas; use allowlist, tipos, limites e defesa contextual.
- **Dependência porque “a IA sugeriu”.** Popularidade não prova manutenção, licença, integridade, segurança ou adequação ao uso.
- **Desabilitar scanner, lockfile ou teste para liberar o merge.** Isso remove evidência e aumenta risco acumulado; qualquer exceção precisa de escopo, justificativa, prazo e responsável.
- **Criptografia sem gestão de chaves.** Algoritmo forte não compensa chave exposta, acesso excessivo, ausência de rotação ou logs com plaintext.
- **Privacidade como texto de política.** Transparência não corrige coleta excessiva, retenção indefinida ou acesso interno indevido.
- **Sustentabilidade por remoção de controles.** Menos custo não justifica perder backups, telemetria necessária, isolamento ou capacidade de resposta.

## Exercício de formação: revisar um checkout gerado por IA

Implemente ou entregue aos participantes um pequeno serviço de checkout gerado por IA. O serviço deve receber um pedido, calcular total, persistir o pedido, chamar um provedor de pagamento simulado e executar um workflow de CI que constrói uma imagem Docker. Inclua deliberadamente: uma chave em `.env.example`, uma dependência transitiva vulnerável, um endpoint que confia em `role` enviado pelo cliente, uma query concatenada, um log com e-mail e token, um Dockerfile que usa `ARG` para token privado e um workflow que concede escrita global ao `GITHUB_TOKEN`.

A turma deve produzir quatro artefatos: (a) DFD com fronteiras de confiança e STRIDE; (b) matriz de riscos com impacto, probabilidade, mitigação, detecção e responsável; (c) patch que corrige autorização, validação, query, logs, segredo de build, workflow e dependência; e (d) checklist de evidências com testes negativos, revisão de dependências, licença, SBOM ou inventário, rotação simulada e plano de rollback. Peça à IA uma proposta inicial, mas exija que cada afirmação seja conferida na documentação oficial e que nenhum segredo real seja usado.

A avaliação deve considerar segurança funcional, não apenas testes felizes. O participante precisa demonstrar que um usuário não pode acessar o pedido de outro, que campos fora do esquema são rejeitados, que entradas extremas não causam consumo ilimitado, que o token não aparece no histórico ou nas camadas da imagem, que o workflow não executa código de pull request não confiável com privilégio e que o artefato pode ser rastreado até o commit e ao builder. Como extensão, compare duas arquiteturas: uma com chamadas remotas e microsserviços excessivos e outra proporcional ao domínio. Meça tempo de build, tamanho da imagem, bytes transferidos e chamadas, e discuta os trade-offs com disponibilidade, privacidade e observabilidade.

## Referências

[1]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218 — Secure Software Development Framework (SSDF) Version 1.1"

[2]: https://owasp.org/www-project-secure-by-design-framework/ "OWASP Secure by Design Framework"

[3]: https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html "OWASP Threat Modeling Cheat Sheet"

[4]: https://docs.github.com/en/actions/reference/security/secure-use "GitHub Actions — Secure use reference"

[5]: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html "OWASP Secrets Management Cheat Sheet"

[6]: https://docs.docker.com/build/building/secrets/ "Docker Docs — Build secrets"

[7]: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html "OWASP Input Validation Cheat Sheet"

[8]: https://cheatsheetseries.owasp.org/cheatsheets/Software_Supply_Chain_Security_Cheat_Sheet.html "OWASP Software Supply Chain Security Cheat Sheet"

[9]: https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action "GitHub Docs — Configuring the dependency review action"

[10]: https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html "OWASP Vulnerable Dependency Management Cheat Sheet"

[11]: https://slsa.dev/spec/v1.0/ "SLSA v1.0 Specification"

[12]: https://owasp.org/www-project-top-10-privacy-risks/ "OWASP Top 10 Privacy Risks"

[13]: https://cheatsheetseries.owasp.org/cheatsheets/User_Privacy_Protection_Cheat_Sheet.html "OWASP User Privacy Protection Cheat Sheet"

[14]: https://learn.greensoftware.foundation/introduction/ "Green Software Foundation — Introduction to Green Software"

As páginas acima foram abertas e lidas para esta síntese. A versão consultada da especificação SLSA é a 1.0, identificada pela própria página como aposentada; ela foi usada apenas para explicar o conceito de proveniência e níveis, e projetos novos devem conferir a documentação corrente da SLSA antes de adotar uma implementação.

# Capítulo 2 — Planejamento e decisão da linguagem

## Tese

Escolher linguagem, runtime e framework é uma decisão de ciclo de vida, não uma preferência estética nem uma competição de produtividade. A escolha deve partir do problema e de suas restrições: requisitos funcionais e não funcionais, integrações, requisitos de segurança e privacidade, horizonte de manutenção, capacidade real da equipe, qualidade do ecossistema, disponibilidade de suporte e custo de reversão. Uma stack que produz um protótipo rapidamente pode ser inadequada para operar um sistema por anos; inversamente, uma stack robusta pode ser desproporcional para uma prova de conceito descartável.

O Vibe Coding pode reduzir o tempo entre uma intenção e um primeiro artefato. Ele não reduz a responsabilidade técnica por esclarecer requisitos, avaliar trade-offs, verificar o código, proteger dados, controlar dependências, operar o sistema e manter a capacidade de substituí-lo. A IA deve ser tratada como uma colaboradora de implementação e exploração, não como autoridade para decidir a stack ou como substituta de revisão, testes e julgamento profissional. A orientação do próprio projeto Python é explícita: a pessoa que submete a mudança continua responsável por seu conteúdo, mesmo quando ferramentas de IA foram usadas, e precisa entender e revisar o resultado em detalhe [1].

## O problema certo antes da tecnologia

Antes de perguntar “qual linguagem é melhor?”, descreva o sistema que precisa existir. Registre quem usará o produto, quais dados serão processados, quais integrações são necessárias, qual é o volume esperado, quais latências e disponibilidades são aceitáveis, qual é o ambiente de execução e por quanto tempo o sistema deverá ser mantido. Inclua restrições que podem eliminar alternativas, como suporte a uma plataforma legada, necessidade de execução offline, requisitos regulatórios, bibliotecas de domínio, disponibilidade de profissionais e orçamento de operação.

A decisão tem pelo menos cinco dimensões conectadas:

1. **Adequação ao problema.** A linguagem e o framework devem oferecer abstrações que tornem o comportamento necessário claro e testável. Para uma API orientada a dados, por exemplo, importam o suporte a bibliotecas de acesso a dados, validação, autenticação, observabilidade e testes. Para computação intensiva, importam o modelo de concorrência, o desempenho previsível e a integração com bibliotecas nativas. Nenhuma dessas dimensões deve ser inferida apenas pelo código que a IA consegue gerar.
2. **Equipe e capacidade de operação.** A equipe precisa conseguir ler, depurar, atualizar, monitorar e proteger a stack. Familiaridade reduz risco de entrega e de incidentes, mas não justifica permanecer em uma tecnologia sem suporte ou sem ecossistema. Avalie também a capacidade de contratar, treinar e fazer revisão independente.
3. **Ecossistema e integração.** Verifique bibliotecas essenciais, qualidade da documentação, atividade do projeto, compatibilidade entre versões, licenças, ferramentas de teste e observabilidade, além da facilidade de obter ajuda. “Existe um pacote” não é o mesmo que “existe uma dependência sustentável”.
4. **Risco técnico e de segurança.** Considere superfície de ataque, histórico de vulnerabilidades, comportamento de dependências, permissões de execução, isolamento, gestão de segredos e capacidade de verificar controles. O NIST SSDF recomenda integrar práticas de desenvolvimento seguro ao ciclo de desenvolvimento, em vez de tratá-las como uma etapa posterior [8]. Para aplicações web, o OWASP ASVS pode transformar controles de segurança em requisitos verificáveis e casos de teste [9].
5. **Manutenção e reversibilidade.** Registre o calendário de suporte, o caminho de atualização, o custo de migração, a facilidade de reproduzir o ambiente e o plano para substituir componentes. O runtime e o framework têm seus próprios ciclos de vida. A página do Node.js recomenda que aplicações de produção usem releases Active LTS ou Maintenance LTS [2]. O Python explicita fases distintas de correção de bugs, correções de segurança e fim de vida [3]. O Django informa que releases LTS recebem correções de segurança e perda de dados por um período tipicamente de três anos [4], enquanto o Angular publica uma janela típica de suporte de 24 meses, dividida entre fase ativa e LTS [5]. Esses calendários precisam entrar na decisão, no orçamento e no backlog de manutenção.

## Linguagem, runtime e framework não são a mesma decisão

A **linguagem** define sintaxe, tipos, semântica, ferramentas do compilador ou interpretador e parte do modelo de abstração. O **runtime** é o ambiente que executa o programa e condiciona versão, bibliotecas padrão, concorrência, memória, sistema operacional, arquitetura e suporte. O **framework** estabelece convenções, ciclo de vida e componentes para organizar a aplicação. A escolha de um não encerra a escolha dos outros: uma versão de linguagem pode não ser compatível com a versão do framework, e uma versão do runtime pode estar fora de suporte mesmo quando o código ainda compila.

Faça uma matriz de compatibilidade antes de aprovar uma stack. Ela deve cruzar, no mínimo, versão da linguagem, versão do runtime, framework, bibliotecas críticas, banco de dados, sistema operacional ou imagem de container e ferramentas de build. A documentação do Django, por exemplo, descreve releases de recurso, releases de correção e de segurança, branches de versões estáveis e política de depreciação [4]. A documentação do Angular descreve compatibilidade pública, depreciações, releases maiores, menores e de patch, além de ferramentas de atualização [5]. Esses detalhes são parte da arquitetura porque determinam como a aplicação evoluirá.

## Como decidir com uma IA de programação

A IA é mais útil quando recebe contexto verificável e produz artefatos pequenos, comparáveis e revisáveis. Ela é menos confiável quando recebe um pedido amplo, escolhe tecnologias sem critérios e entrega uma base grande que ninguém entende. Use uma sequência deliberada:

1. **Especificar o contexto.** Forneça requisitos, restrições, dados sensíveis, horizonte de suporte, competências disponíveis, ambiente de deploy, integrações e critérios de aceitação. Peça à IA que liste premissas e dúvidas antes de sugerir qualquer stack.
2. **Separar exploração de decisão.** Peça duas ou três opções plausíveis e uma matriz de critérios. Exija que a IA identifique o que é fato documentado, o que é hipótese e o que precisa ser verificado em documentação oficial. Não aceite “é a mais popular” como justificativa suficiente.
3. **Verificar o ciclo de vida.** Peça links para a política oficial de suporte do runtime, do framework e das dependências centrais. Confirme manualmente as datas e a compatibilidade. Não escolha uma versão experimental ou fora de suporte só porque a IA a conhece ou porque um tutorial recente a utiliza.
4. **Prototipar o risco, não apenas a tela.** Faça um spike curto para testar a integração que pode invalidar a escolha: autenticação, persistência, fila, processamento de arquivos, requisito de latência, execução offline ou observabilidade. Peça à IA código mínimo e testes que exercitem o risco.
5. **Revisar em pequenos diffs.** Trabalhe em branch e em commits pequenos. O Pro Git descreve branches como ponteiros leves que isolam uma linha de trabalho da principal e encoraja ramificar e mesclar com frequência [11]. O isolamento facilita descartar uma hipótese, comparar alternativas e revisar a contribuição da IA sem misturá-la a alterações não relacionadas.
6. **Transformar a decisão em registro.** Produza um ADR (Architecture Decision Record) curto com contexto, opções consideradas, critérios, decisão, consequências, versão exata da stack e gatilhos para reavaliá-la. A IA pode redigir o primeiro rascunho, mas pessoas responsáveis devem confirmar cada afirmação.
7. **Proteger o caminho de entrega.** Use integração contínua para executar build, testes, análise estática e verificações de dependências em cada pull request. O GitHub Actions define workflows versionados no repositório que podem executar jobs de build, teste e deploy [6]. O pipeline não é prova de correção; é um mecanismo repetível para detectar regressões e aplicar critérios.
8. **Reduzir privilégios e controlar automação.** Workflows gerados ou editados por IA devem ser revisados como código de produção. O GitHub recomenda permissões mínimas para `GITHUB_TOKEN`, proteção de segredos, cautela com código não confiável em pull requests e pinagem de actions de terceiros por SHA completo [7]. Não permita que a IA introduza uma action desconhecida, um token amplo ou um comando de shell com entrada não confiável sem revisão.
9. **Reproduzir o ambiente conscientemente.** Containers podem padronizar o ambiente e transportar a unidade de distribuição e teste; a documentação do Docker explica que a imagem contém o template somente leitura e que o container é uma instância executável [10]. Use essa capacidade para reduzir “funciona na minha máquina”, mas não confunda reprodutibilidade com segurança automática: imagem, daemon, permissões, rede, segredos e dependências continuam exigindo configuração e verificação.
10. **Manter a compreensão humana.** Peça à IA explicações sobre invariantes, falhas, decisões e limites. A pessoa que aprova o código precisa conseguir descrever o comportamento, os testes e os riscos em suas próprias palavras. O guia de IA do Python recomenda mudanças mínimas e focadas, aderência ao estilo existente, testes e revisão integral antes de abrir um pull request [1].

## Critérios práticos de comparação

Uma forma simples de comparar opções é atribuir uma nota justificada, com evidência, para cada dimensão. O peso varia conforme o problema; não use uma soma automática para esconder uma restrição eliminatória.

| Critério | Pergunta de decisão | Evidência mínima |
| --- | --- | --- |
| Adequação funcional | A stack atende as integrações e o modelo de execução necessários? | Spike executável e testes de aceitação |
| Capacidade da equipe | Há pessoas capazes de revisar, depurar, operar e atualizar? | Mapa de competências e plano de capacitação |
| Ecossistema | As dependências críticas são mantidas, documentadas e compatíveis? | Repositórios, releases, política de suporte, licença e exemplos testados |
| Segurança | É possível implementar e verificar autenticação, autorização, validação, logging e proteção de segredos? | Requisitos ASVS aplicáveis, testes e análise de dependências |
| Operação | O sistema pode ser observado, implantado e recuperado? | Pipeline, logs, métricas, health checks, rollback e runbook |
| Longevidade | A versão escolhida tem suporte e caminho de atualização? | Datas oficiais de suporte, matriz de compatibilidade e orçamento de upgrades |
| Reversibilidade | Quanto custa trocar o componente se a hipótese falhar? | Interfaces, isolamento de dependências, exportação de dados e plano de saída |

Não transforme notas em falsa precisão. Uma vulnerabilidade crítica sem correção, a ausência de uma biblioteca essencial ou a incapacidade de operar o sistema podem ser critérios de veto, ainda que a opção obtenha boa pontuação em velocidade de prototipagem.

## Onde estão os riscos

A velocidade de geração pode deslocar o gargalo para a revisão. Código gerado em grande volume tende a criar decisões implícitas, duplicação, dependências desnecessárias e testes que apenas confirmam o caminho feliz. A IA também pode misturar APIs de versões diferentes, sugerir versões fora de suporte, omitir tratamento de falhas ou produzir uma configuração segura apenas em aparência.

O risco de ecossistema não se limita à biblioteca principal. Actions, pacotes, imagens de container e scripts de instalação executam código com as permissões do pipeline ou do ambiente. A documentação do GitHub destaca que uma action de terceiros comprometida pode acessar segredos e usar o token do repositório; recomenda auditar o código e fixar actions por SHA completo [7]. Portanto, “a IA encontrou um snippet” não é evidência de confiabilidade. O componente precisa de origem, versão, licença, manutenção, escopo de permissões e estratégia de atualização.

Há também risco de dependência cognitiva. Se a equipe não entende a linguagem ou o framework escolhido, a IA pode acelerar a produção de um sistema que ninguém consegue explicar. Isso aumenta o tempo de diagnóstico e torna a manutenção dependente do mesmo fornecedor, modelo ou pessoa. O critério de aceitação deve ser compreensão operacional e técnica, não apenas uma demonstração que funciona.

Por fim, a automação pode criar uma falsa sensação de qualidade. Um workflow verde demonstra que os comandos configurados passaram; não demonstra que os requisitos estão completos, que os testes cobrem abuso ou que os dados estão protegidos. O SSDF do NIST trata práticas de segurança como parte integrada do SDLC [8], e o ASVS oferece requisitos para verificar controles técnicos de aplicações web [9]. Use esses referenciais para complementar testes funcionais, revisão e análise de risco.

## Antipadrões

- **Escolher pela popularidade ou pelo entusiasmo da IA.** Popularidade pode ser um sinal de ecossistema, mas não comprova adequação, suporte, compatibilidade ou capacidade da equipe.
- **Confundir protótipo com arquitetura de produção.** Um caminho feliz demonstrado em minutos não cobre disponibilidade, migração de dados, observabilidade, segurança e manutenção.
- **Usar a versão mais nova sem verificar suporte.** Novidade pode ser útil, mas releases Current, experimentais ou fora de LTS alteram o perfil de risco. Verifique a política oficial do componente [2] [3] [4] [5].
- **Misturar versões e dependências sem matriz de compatibilidade.** A aplicação pode compilar hoje e falhar no próximo upgrade; uma dependência transitiva pode introduzir vulnerabilidade ou incompatibilidade.
- **Aceitar uma resposta da IA sem premissas e evidências.** A resposta deve ser uma hipótese revisável. Exija referências, reproduza o exemplo e confirme a API na documentação da versão usada.
- **Gerar um grande diff sem branch, commits ou revisão.** Isso torna difícil atribuir causa, comparar alternativas e reverter. Branches leves e mudanças focadas reduzem o raio de erro [11].
- **Dar privilégios amplos ao pipeline para “fazer funcionar”.** Tokens com escrita irrestrita, secrets em texto e actions não fixadas aumentam o impacto de uma configuração comprometida [7].
- **Usar container como substituto de arquitetura e segurança.** O container melhora a consistência do ambiente, mas não elimina vulnerabilidades da imagem, permissões excessivas, exposição de rede ou segredos mal geridos [10].
- **Alterar ou remover testes para silenciar uma falha.** O guia do Python considera inaceitável burlar testes ou retirar funcionalidade para fazer um teste passar [1].
- **Escolher a stack sem plano de saída.** Se o componente se tornar incompatível, abandonado ou caro de operar, a ausência de interfaces e de migração transforma uma escolha reversível em aprisionamento.

## Exercício — ADR assistido por IA para uma stack de cinco anos

Imagine uma equipe pequena que precisa construir um serviço web interno para registrar solicitações de clientes, anexar documentos e expor uma API para outro sistema. O serviço deverá processar dados pessoais, rodar por pelo menos cinco anos, ter deploy automatizado, permitir auditoria e ser mantido por uma equipe com experiência maior em Python, mas com possibilidade de contratar profissionais JavaScript. O volume inicial é moderado; a maior incerteza é a integração com o sistema externo e o requisito de retenção dos documentos.

Produza um ADR de duas a quatro páginas comparando três alternativas que a equipe consiga justificar. Não é necessário concluir que uma alternativa é universalmente melhor. Para cada candidata, registre a linguagem, o runtime, o framework, as versões propostas, as bibliotecas de autenticação e persistência, o ambiente de execução e o caminho de atualização. Consulte as políticas oficiais de suporte do runtime e do framework; registre as datas verificadas e trate qualquer versão fora de suporte como uma exceção que exige justificativa.

Peça à IA, em uma primeira interação, que extraia premissas, dúvidas e critérios, sem escolher a tecnologia. Em uma segunda interação, peça uma matriz comparativa com evidências e links oficiais. Em uma terceira, peça um spike mínimo para a integração de autenticação e upload, acompanhado de testes de falha e de um inventário de dependências. Revise manualmente as respostas. Marque cada afirmação como **confirmada**, **hipótese** ou **não verificada**.

Depois, implemente o menor protótipo em uma branch separada. Faça a IA explicar cada dependência, cada permissão e cada caso de erro antes de aceitá-lo. Configure uma verificação de CI para lint, testes e análise de dependências; revise o workflow para que o token tenha somente permissões necessárias e para que actions de terceiros sejam fixadas ou justificadas. Para o upload, avalie tamanho, tipo, armazenamento, autorização, retenção e descarte. Use requisitos aplicáveis do ASVS como fonte de casos de teste, sem afirmar conformidade completa apenas porque os testes passaram [9].

O produto final do exercício deve conter: o ADR; a matriz de decisão; o spike e seus testes; a matriz de compatibilidade; o workflow revisado; um registro dos prompts e das alterações aceitas; e uma seção “gatilhos de reavaliação”. A revisão por pares deve responder a quatro perguntas: a escolha atende ao problema; a equipe consegue operar e explicar a solução; o ecossistema tem suporte suficiente para o horizonte de cinco anos; e existe um plano de migração se uma premissa falhar?

## Conclusão

Uma decisão responsável não procura a linguagem, o runtime ou o framework “melhor” em abstrato. Ela procura a alternativa que atende ao problema com risco aceitável e que pode ser compreendida, protegida, operada e atualizada pela equipe disponível. A IA pode acelerar pesquisa, prototipagem, testes e documentação. A responsabilidade pela escolha, pela verificação e pelas consequências em produção permanece humana.

## Referências

[1]: https://devguide.python.org/getting-started/ai-tools/ "Python Developer’s Guide — Guidelines for using AI tools"

[2]: https://nodejs.org/en/about/previous-releases "Node.js — Releases"

[3]: https://devguide.python.org/versions/ "Python Developer’s Guide — Status of Python versions"

[4]: https://docs.djangoproject.com/en/dev/internals/release-process/ "Django documentation — Django’s release process"

[5]: https://angular.dev/reference/releases "Angular — Versioning and releases"

[6]: https://docs.github.com/articles/getting-started-with-github-actions "GitHub Docs — Understanding GitHub Actions"

[7]: https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions "GitHub Docs — Security hardening for GitHub Actions"

[8]: https://csrc.nist.gov/pubs/sp/800/218/final "NIST SP 800-218 — Secure Software Development Framework (SSDF) Version 1.1"

[9]: https://owasp.org/www-project-application-security-verification-standard/ "OWASP — Application Security Verification Standard (ASVS)"

[10]: https://docs.docker.com/get-started/docker-overview/ "Docker Docs — What is Docker?"

[11]: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell "Pro Git — Branches in a Nutshell"

*Fontes consultadas e lidas integralmente em setembro de 2026. Políticas de suporte, versões e cronogramas são mutáveis; confirme-as novamente antes de uma decisão de produção.*

---

**Escopo do capítulo:** planejamento e decisão de linguagem, runtime e framework a partir do problema, da equipe, do ecossistema, do risco e da manutenção. O capítulo não apresenta Vibe Coding como substituto de engenharia; trata a geração por IA como uma aceleração subordinada a critérios, revisão e responsabilidade técnica.

**Autoria:** Manus AI

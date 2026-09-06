Aqui está o conteúdo organizado como um arquivo `prompt.md`, pronto para ser salvo e utilizado:

``` markdown
# Prompt para Antigravity: Carrossel de Portfólio Interativo & Fundo Dinâmico

Este documento traz a especificação completa e o prompt pronto para ser copiado e enviado diretamente ao **Google Antigravity**. O objetivo é modernizar o carrossel do seu site institucional (focado no desenvolvimento de sistemas e sites para pequenas empresas), permitindo a inclusão de novos projetos, alteração dinâmica da cor de fundo com base na identidade visual do cliente e visualização interativa do projeto real.

## Como utilizar este prompt
1. Copie o texto contido no bloco "Prompt Copiável" abaixo.
2. Anexe ou envie junto com a mensagem as imagens/mockups dos sites que você deseja adicionar ao carrossel.
3. Cole o prompt na interface do Google Antigravity para que o agente execute a reestruturação dos componentes no seu repositório.

## Prompt Copiável

Atue como um Engenheiro Front-end Principal e Designer Especialista em UI/UX, focado em Web Design Minimalista e de Alta Conversão para Pequenas Empresas.

Nosso site é focado em criar sistemas e sites sob medida para pequenas empresas. Preciso que você reestruture o componente de Carrossel de Portfólio/Projetos do nosso repositório com um design extremamente profissional, moderno, limpo e sem qualquer poluição visual.

### Requisitos Funcionais e de Interatividade
1. **Atualização da Galeria de Imagens**:
   - Atualize a estrutura de dados dos projetos e adicione as imagens enviadas em anexo.
   - Cada projeto deve conter: título da empresa cliente, nicho/setor, cor primária da marca, imagem principal (mockup), URL do site live (ou link de demonstração) e uma breve descrição do resultado gerado.
2. **Transição Dinâmica da Cor de Fundo por Marca**:
   - Ao clicar em um card do carrossel ou ao mudar o slide ativo, a cor de fundo do contêiner do carrossel (ou da seção principal) deve mudar suavemente para a cor primária da marca do cliente correspondente.
   - A transição CSS deve ser extremamente fluida (transition: background-color 0.6s cubic-bezier(0.16, 1, 0.3, 1)).
   - Ajuste dinamicamente o contraste dos textos e botões (ex: alternando a cor da fonte para claro/escuro) para garantir legibilidade e conformidade com acessibilidade (WCAG).
3. **Live Preview / Visualização Direta do Site**:
   - Quando o usuário clicar no item do carrossel ou no botão de ação ("Ver Projeto" / "Explorar Site"), abra um painel ou modal elegante com o preview do site criado (usando iframe sandbox responsivo ou modal expandido com os detalhes e botão para abrir em nova aba).
   - O usuário precisa conseguir visualizar o resultado final entregue àquela pequena empresa sem sair da experiência do site.
4. **Design Minimalista & Sem Poluição Visual**:
   - Mantenha espaçamentos generosos (whitespace), tipografia legível e cards elegantes com suporte a modo claro/escuro.
   - Evite excesso de badges, brilhos fortes ou elementos desnecessários. O foco principal deve ser o trabalho feito para o cliente.
   - Utilize navegação intuitiva: gestos de swipe, setas discretas e indicadores sutis de paginação.

### Especificações de UI/UX e Pesquisa Automática de Skills:
- Pesquise e aplique técnicas modernas de micro-interações (Framer Motion, CSS Hardware Acceleration, Scroll-Driven Animations ou a biblioteca de animação atual do projeto).
- Certifique-se de que o layout seja 100% responsivo (mobile-first), com suporte a toque e redimensionamento fluido de imagens.

Analise o repositório, identifique onde a lista de projetos e o carrossel estão declarados, e faça as edições necessárias com explicações breves ao final.

## Resumo das Alterações Esperadas no Repositório

| Etapa da Implementação | Arquivo / Componente Afetado | Descrição da Solução Aplicada |
| :--- | :--- | :--- |
| **1. Estrutura de Dados** | `projects.json` / `projectsData.ts` | Atualização do array com as imagens fornecidas, URLs e atributo `primaryColor`. |
| **2. Fundo Dinâmico** | `CarouselSection.jsx` / `.tsx` | Estado local escutando o item ativo/clicado e aplicando estilo inline `--bg-brand`. |
| **3. Modal / Live Preview** | `ProjectPreviewModal.jsx` / `.tsx` | Criação de modal responsivo para exibição do site live/demo do cliente. |
| **4. Ajustes Visuais** | `carousel.module.css` ou Tailwind | Aplicação de tipografia limpa, espaçamentos amplos e transição de contraste. |

```

Abaixo está o prompt otimizado em bloco estruturado. Basta copiá-lo na íntegra e colar na interface do Antigravity.
Início do Prompt para o Antigravity
Desenvolva a aplicação completa do LocalWeb Pro utilizando HTML5 Semântico, CSS3 Vanilla com CSS Variables e JavaScript Vanilla, integrado à estrutura de build do Vite.

A aplicação deve funcionar tanto como uma Landing Page / Apresentação Institucional de alta conversão quanto como um Pitch Deck Interativo Web de 6 Slides para reuniões comerciais com donos de pequenos negócios locais.
1. Estilo & Design System (Tech Dark & 3D Chrome)
Paleta de Cores Dark: Fundo principal dark estelar (#0A0C10), superfícies de cards (#12161F), bordas sutis com brilho metálico (rgba(255, 255, 255, 0.1)), destaques em acentos cromados/prateados e neons sutis para CTAs de conversão.
Tipografia (Google Fonts): Importe e aplique Syne (pesos 700 e 800) para todos os títulos/headings em caixa alta ou semi-bold, e Inter (pesos 400 e 500) para o corpo de texto e dados técnicos.
Efeitos Visuais: Efeito Glassmorphism (backdrop-filter blur) em modais e headers, gradientes cromados em botões principais, e efeitos de hover suaves com elevação em 3D.
2. Estrutura dos 6 Slides / Seções do Pitch Deck
Crie a estrutura navegável dividida nas seguintes 6 seções sequenciais:

Capa Institucional:
Título impactante: "Transformando pequenos negócios locais em referências digitais".
Subtítulo explicativo, tags de destaque e botões de ação: "Iniciar Apresentação" e "Acessar via WhatsApp".
Nossa Solução (Pilares de Valor):
Grid com 4 cards: Demos Prontas por Nicho, Entrega Recorde em 5 a 7 Dias, Foco Total em Conversão (WhatsApp/SEO), Previsibilidade Financeira.
Nichos de Mercado Atendidos (Demos Interativas):
Tabela/Cards interativos comparativos para:
Barbearias & Salões: Agendamento dinâmico e catálogo de serviços.
Nutrição & Saúde: Triagem online, institucional e blog.
Academias & Studios: Tabela de planos e feed do Instagram integrados.
Lojas de Roupas: Catálogo digital com botão direto de pedido no WhatsApp.
Modelo de Receita & Regras Comerciais:
Destaque visual para o Setup Inicial (R$ 1.200 - Taxa Única) e Hospedagem & Suporte (R$ 150/mês MRR).
Seção expansível com a Política Transparente de Ajustes (Ajustes gratuitos até 7 dias pós-entrega; R$ 200 por bloco/hora após esse prazo).
Escalabilidade & Unit Economics:
Gráficos comparativos em CSS/SVG mostrando tempo de entrega (5-7 dias vs 30+ dias das agências tradicionais) e retenção do cliente.
Próximos Passos & CTA de Fechamento:
Formulário simplificado de onboarding para o projeto piloto + Botão direto para aceite do contrato de parceria no WhatsApp.
3. Funcionalidades Interativas & Atalhos de Teclado (JS Vanilla)
Implemente um script leve em Vanilla JS que gerencie o modo apresentação com as seguintes regras:

Navegação por Teclado:
Seta Direita / Seta Baixo / Espaço / PageDown: Avança para o próximo slide.
Seta Esquerda / Seta Cima / PageUp: Volta para o slide anterior.
Home / End: Vai direto para o primeiro ou último slide.
Tecla F: Alterna modo Tela Cheia (Fullscreen).
Tecla O: Abre/Fecha um painel em grade (Drawer) com miniatura dos 6 slides para rápida alternância.
Navegação Visual:
Header fixo com barra de progresso da apresentação, indicador do slide atual (ex: Slide 3 / 6), botão de navegação manual (Anterior/Próximo) e botão de exportação para PDF.
4. Estilo de Impressão & Exportação PDF (@media print)
Adicione regras de CSS em @media print para que, ao clicar no botão "Exportar PDF" ou pressionar Ctrl+P:
O fundo escuro seja convertido ou mantido legível para impressão.
O esconde/mostra de elementos remova botões de navegação, headers fixos e menus.
Cada um dos 6 slides ocupe exatamente 1 página separada (page-break-after: always).
5. Configuração do Projeto Vite
Forneça a estrutura de arquivos limpa: index.html, style.css, main.js e package.json configurado com scripts do Vite (npm run dev, npm run build).

Monte toda a estrutura do código pronta para produção, testada e sem dependências externas desnecessárias além de fontes e ícones vetoriais em SVG.


Fim do Prompt para o Antigravity
Dicas para Utilização no Antigravity
Ação
Instrução
Geração Inicial
Cole o prompt acima no chat principal do Antigravity para criar todos os arquivos base (index.html, style.css, main.js).
Ajustes de UI
Se desejar intensificar o efeito 3D Chrome, peça a ele: "Adicione um gradiente metálico espelhado nos títulos e nos cards usando background-clip: text e bordas prateadas".
Testes Locais
Após a geração, rode npm install e npm run dev na pasta do projeto conforme o README.


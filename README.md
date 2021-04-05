# SeaQuestJs


Com o objetivo de estudar gráfico em Javascript e CSS estou desenvolvendo um clone de um dos melhores jogos do Atari 2600, o belíssimo jogo da Activision, Sea Quest.

* 04/04/2021 
	* Início do projeto, estudarei o básico dos gráfico em Js e CSS e pretendo fazer a tela de fundo do jogo.
	* A primeira dificuldade foi encontrar as cores RGB usadas no atari para reproduzir o jogo da melhor forma possível. Montei uma tabela com as cores RGB do Atari 2600 NTSC baseado em http://www.qotile.net/minidig/docs/tia_color.html .
	* O hardware do Atari desenha separadamente a cada frame o background, o playfield, 2 player sprites , 2 missile sprites e 1 ball sprite assim como recalcula a lógica do jogo em cada sprite. Então definirei essa arquitetura para o projeto.
	
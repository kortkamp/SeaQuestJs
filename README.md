# SeaQuestJs


Com o objetivo de estudar gráfico em Javascript e CSS estou desenvolvendo um clone de um dos melhores jogos do Atari 2600, o belíssimo jogo da Activision, Sea Quest.

* 04/04/2021 
	* Início do projeto, estudarei o básico dos gráfico em Js e CSS e pretendo fazer a tela de fundo do jogo.
	* A primeira dificuldade foi encontrar as cores RGB usadas no atari para reproduzir o jogo da melhor forma possível. Montei uma tabela com as cores RGB do Atari 2600 NTSC baseado em http://www.qotile.net/minidig/docs/tia_color.html .
	* O hardware do Atari desenha separadamente a cada frame o background, o playfield, 2 player sprites , 2 missile sprites e 1 ball sprite assim como recalcula a lógica do jogo em cada sprite. Então definirei essa arquitetura para o projeto.
* 05/04/2021 
	* Fazer as ondas do mar foi uma tarefa bem complicada, tive que debugar o jogo até achar a rotina que definia o padrão das ondas do mar que fica armazenada na memoria 0x82 do Atari 2600. A função que faz o shuffle desse valor fica no endereço 0xFEDB. Tentei reproduzir essa função em Javascript.
	A cada frame uma funcão específica pega o valor da memória 0x82 e desenha o padrão das ondas de acordo com a imagem abaixo. Como existem 10 faixas de onda o valor armazenado tem apenas 8 bits, o jogo faz a primeira e a última faixas repetindo o último e o primeiro dígito binário respectivamente. Além disso, a cada 8 frames o jogo chama a rotina de shuffle que gera um novo valor para o padrão das ondas causando um belo efeito realemnte muito parecido com ondas do mar. 
	![sqwave](https://user-images.githubusercontent.com/236848/113854700-8d265700-9775-11eb-9d40-e4eca034c33d.png)
	```
	
	Rotina original do shuffle das ondas do mar do Sea Quest.
	
	shuffle:
		ldy	#$02		;load $02 to y register (counter for loop)
	loop:
		lda	$82		;load memory content at 0x82 to a register
		asl			;bit rotate left, basicaly multiply by 2
		asl
		asl
		eor	$82		;a = a XOR [0x82](memory content at 0x82)
		asl
		rol	$82		;memoy content bit rotate left and add value of C flag
		dey			;decrease y
		bpl	loop		;if last operation results positive goto loop.
		rts
	
	```
* 06/04/2021
	* Foi adicionada a funçao para desenhar os sprites na tela assim como os dados e posições dos pinrcipais sprites.
	


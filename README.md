# SeaQuestJs

[Run the Game](https://kortkamp.github.io/SeaQuestJs/)


# Instructions
*	Use WASD or arrow keys to move and space to shoot

# todo list

* Urgentes
	* ~~Adicionar um timer observer em que funções poderão se cadastrar para serem invocadas.~~
	* Mudar todas as timed functions para serem chamadas pelo GameTimer
	* Corrigir contador de pontuação, kill e divers valem mais à medida que a dificuldade aumenta.
* Gerais
	* Separar game.js em módulos: gráfico, input, classes??
	* ~~Aplicar o design observer para input e timed events~~
	* Centralizar timed events em uma classe
	* Testar desempenho e otimizar as rotinas mais comuns
	* Estudar e aplicar o Design Pattern mais indicado
* Específicas
	* ~~Entregar divers e contar pontuação~~
	* ~~Enemy sub precisam atirar torpedos~~
	* Tubarões e subamarinos duplos e triplos
	* Mini sub na superfície
	* Ganhar uma vida a cada 10k pontos.
	

# Jounal (Sorry, just in portuguese)

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
	
* 07/04/2021 a 08/04/2021
	* Nesse período me sobrou um pouco mais de tempo livre e o projeto avançou muito. Fiz algumas verificações de posicionamento do inimigos assim como, em abediência ao OCP do SOLID , isolei a classe antes usada para todos os objetos móveis e a extendi para uma classe player e uma enemy. Essa solução facilitou muito o projeto porque todas as rotinas de inicialização dos inimigos pôde ser embutida em sua classe simplificando muito o código.
* 08/04/2021 
	-Colisões
	* A próxima implementação será o do detector de colisões que será usado na classe player , na classe diver e na futura classe torpedo. Aqui certamente teremos problemas porque a detecção de colosão no atari era pixel perfect, ou seja não trabalhava com hitbox e sim fazia a detecção pixel por pixel, então se o Atari 2600 disser que um tiro te acertou é porque é verdade. Eu quero implementar esse tipo de checador no meu projeto devido ao objetivo principal que fazer uma cópia perfeita do Sea Quest.
* 09/04/2021
<<<<<<< HEAD
	* Devido ao crescimento do código será necessário isolar melhor as classes e criar uma classe para o jogo.
=======
	* Devido ao crescimento do código será necessário isolar melhor as classes e criar uma classe para o game match.
* 10/04/2021 
	* Foram feitas melhorias no desempenho da função tiaColor de acordo com dicas recebidas por um amigo do grupo Atari Brasil, onde não é mais necessário fazer qualquer operação para gerar a cor RGB, a solução inicial era receber um number hexadecimal, converter para string com dapStart(6,'0') e adicionar um hashtag # , ou seja converter no formato color string. Percebi que era mais fácil simplemente armazenar direto as strings e a função passou a ser um mero redirecionador de elementos do array de cores RGB do Atari.
* 11/04/2021
	* Implementar os mergulhadores foi realmente desafiador. À medida que o projeto cresce e as classes interagem torna-se mais e mais complexo fazer novas implementações sem gerar conflitos. Faz-se necessário estudar mais um pouco de Design Patterns a fim de que os futuros projetos sejam melhor organizados e não gerem essa dificuldade nos estágios finais.
	* Para adicionar os sons do jogo foi usado o HTML Audio devido à facilidade de uso e disponibilidade do sons já prontos via Stella. 
* 12/04/2021 
	* Ao longo dos dois últimos dias parte do código foi melhor organizado e foi adicionado um controle para ser usado em navegadores mobile onde não existe a possibilidade de uso do teclado.	
* 16/04/2021
	* Nos últimos dias o código do jogo está sendo melhor organizado, foi implementada uma classe singletron que centraliza os eventos timed e defini a meta de que nenhuma classe dependa de outra diretamente. A classe Input já funciona desse modo trabalhando com a ideia de Observers.
* 17/04/2021 
	* Foram adicionados os torpedos dos submarinos inimigos. Devido às mudanças de estrutura e pattern nos dias anteriores , foi extremamente fácil implementar um novo item no jogo.
	* Mesmo com a refaturação do código não estou vizualizando uma maneira elegante de implementar os inimigos duplos e triplos, a abordagem de adicionar mais instâncias é uma possíbilidade, porém percebi que no jogo original há uma persistência dos inimigos restantes nas duplas e trios até que se elimine o último , só então a lane é resetada e os inimigos voltam a ser duplos e triplos. Provavelmente a abordagem que escolherei será de alterar a classe Enemy para adicionar um array de posições e estados "active" com as referencias aos 3 potenciais inimigos naquela lane.
>>>>>>> main
* 18/04/2021 
	* Percebi que à medida que as fases do jogo aumentam, a pontuação ganha por kill aumenta em 10 a partir do valor inicial de 20, assim como os ponto ganhos por mergulhador resgatado aumentam em 50 a partir de um valor inicial de 50.
	* Ja para a dificuldade, tive que catalogar as alterações sofridas no jogo para cada vez que o player sobe à superfície. Os resultados seguem na tabela abaixo:

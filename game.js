/*
TODO
- seria interessante criar uma classe para o campo e o score e as vidas seriam propriedade dessa classe
  nesse modo teríamos que passa-la como parametro para os enemies já que os mesmos alteram o score.

- oxygen precisa ser uma propriedade de player assim como as checkagens de profundidade para recarregar ou gastar oxigênio.

- issue - digito zero não imprime no score.

*/


var colorClosks =160;
const atariScreen = {
	// Atari equivalent Screen Height.
	'scanlines':192,
	'height':192,
	// Atari equivalent Screen Width.
	'colorClocks':160,
	'width':160
};


var enemyId = {
	'shark':0,
	'sub':1
};

var canvasScale = 3;
var cv = document.getElementById("gameCanvas");
var ctx = cv.getContext("2d");

var score;
var lifes;
var oxygen;
//Dificulty , aka speed of the game.
var dificulty;
var rescuedDivers;
// Max oxygen used do draw oxygen bar.
var maxOxygenBar = 64;
var enemies = []
// Y position for each of 4 lines of enemies.
var enemyLanes = [61,85,109,133];
// Ready for game, oxygen full.

// In Sea Quest the enemy colors change as dificulty increases.
// enemyColors[0] represents the shark colors and enemyColors[1] the sub ones.
// these are cicling array, when dificulty rises to the last element the next muust be the first.
var enemyColors = [	[0xc8,0xe8,0x58,0x36,0xc6,0xe8,0xc8,0x36], 
					[0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08]];
// Like enemyColors , enemySpeeds chages as dificulty increases.
var enemySpeeds = [];


var inGame = false;


// Generic objct to extends: player , enemy, diver , torpedo.
class GameObject {
	constructor(sprite,x,y,color,dir){
		// Coord position XY
		this.x = x;
		this.y = y;
		// Speed X and Y
		this.vx = 0;
		this.vy = 0;
		this.hScale = 1;
		this.color = color;
		// Horizontal Scale
		this.hScale = 1;
		// Default direction will be 1(left to right)
		this.dir = 1;
		// This sprite has 
		this.moveLimit = true;
		// Haw many frames to draw a new sprite animation.
		this.animationInterval = 4;
		// Internal counter to do the animation.
		this.animationCounter = 0;
		// Animation speed, Math.pow(animationSpeed,2) means how many frames are needed to update a single sprite.
		// Usually can be 2 or 3
		// bigger means slower
		this.animationSpeed = 2;
		this.sprite = sprite;
	}
	destroy(){
		
	}
	checkLimits(){
		
	}
	update(){
		this.y += this.vy;
		this.x += this.vx;
		
		this.checkLimits();	

		
		var spriteNumber = (this.animationCounter>>this.animationSpeed)%3;
		drawSprite(this.sprite[spriteNumber],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
		this.animationCounter++;
	}
	// Checks for a colision with another GameObject
	checkCollision(object){
		// horizontal contact
		if((this.x + this.hScale * 8) >= object.x && this.x <= (object.x + object.hScale*8)) {
			console.log("h contact");
			if((this.y + this.sprite[0].length) >= object.y && this.y <= object.y + object.sprite[0].length){
				// Must insert a pixel colision here.
				this.colisionAction(object);
				
			}
		}
		return false;
	}
	colisionAction(object){
		
	}
	

}

class Torpedo extends GameObject{
	constructor(parentLaucher,x,y,dir){
		super(singleTorpedoSprite,x,y,0x18,2);
		
		this.parentLaucher = parentLaucher;
		this.speed = 5;
		this.hScale = 1;
		this.dir = dir;
		this.vx = this.dir*this.speed;
		this.active = false;
	}
	update(){
		this.y = this.parentLaucher.y + 7;
		this.x += this.vx;
		
		this.checkLimits();	

		
		drawSprite(this.sprite[0],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
	}
	checkLimits(){
		
		if(this.x >= atariScreen.width || (this.x + spriteWidth <= 0 )){
			this.halt();
		}
		
	}
	colisionAction(object){
		object.kill();
		this.halt();
	}
	halt(){
		
		this.active = false;
	}
	fire(){
		
		if(!this.active){
			this.dir = this.parentLaucher.dir;
			this.vx = this.dir*this.speed;
			this.y = this.parentLaucher.y + 7;
			this.x = this.parentLaucher.x + 6*this.parentLaucher.hScale + 1;
			this.active = true;
		}
	}
}

class Player extends GameObject{
	constructor(x,y){
		super(subSprite,x,y,0x18,2);
		this.hScale = 2;
	}
	// Player must not pass these limits, ask Activion about this.
	checkLimits(){
		if(this.x >= 134){
			this.x = 134;
		}
		if(this.x <= 21){
			this.x = 21;
		}
		if(this.y >= 134){
			this.y = 134;
		}
		if(this.y <= 39){
			this.y = 39;
		}
	}
}

class Enemy extends GameObject{
	constructor(y){
		super(null,null,y,null,null);
		
		// 0 = shark and 1 = sub
		this.enemyType = enemyId.shark;
		//this.dir = dir;
		//this.vx = this.dir * 3/8;
		this.startPoint = [-55,0,atariScreen.colorClocks + 55];
		//this.x = this.startPoint[1-dir];
		//this.animationSpeed = 3;
		this.reset();
	}
	update(){
		this.y += this.vy;
		this.x += this.vx;
		
		this.checkLimits();	
		
		this.color = enemyColors[this.enemyType][dificulty%8];
		drawSprite(this.sprite[(this.animationCounter>>this.animationSpeed)%3],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
		this.animationCounter++;
	}
	
	checkLimits(){
		if((this.x > atariScreen.colorClocks+33) && (this.dir == 1)){
			// Alternate between shark and sub
			this.enemyType = this.enemyType ^ 1;
			
			this.dir = binaryRandom();
			this.vx = this.dir * 3/8;
			this.x = this.startPoint[1-this.dir];
			this.sprite = enemySprites[this.enemyType];
			
		};
		if((this.x < -33) && (this.dir == -1)){
			// Alternate between shark and sub
			this.enemyType = this.enemyType ^ 1;
			this.reset();
		};
	}
	kill(){
		// When you kill a enemy , he resets to a shark.
		this.enemyType = enemyId.shark;	
		this.reset();	
		score += 20;
		
	}
	reset(){
		//Direction is randomized every enemy reset.
		this.dir = binaryRandom();
		//Vx must follow  "dir" direction.
		this.vx = this.dir * 3/8;
		// The initial position depends on direction.
		this.x = this.startPoint[1-this.dir];
		// Basic animation speed depends on enemy type. Subs have 2 and sharks 3.
		this.animationSpeed = 3-this.enemyType;
		// Update the enemy sprite. 0 for shark and 1 for sub.
		this.sprite = enemySprites[this.enemyType];
	}
}

// returns randomically -1 or 1
function binaryRandom(){
	if(Math.random() > 0.5)
		return(1);
	return(-1);
}

// This function emulates the exact behavior of Sea Quest shuffle routine at memory address 0xFEDB.
function shuffle(value){
/*  Original Sea Quest shuffle routine in 6502 assembly.

shuffle:
	ldy	#$02	;load $02 to y register
loop:
	lda	$82		;load memory content at 0x82 to a register
	asl			;bit rotate left, basicaly multiply by 2
	asl
	asl
	eor	$82		;a = a XOR [0x82](memory content at 0x82)
	asl
	rol	$82		;memoy content bit rotate left and add value of C flag
	dey			;decrease y
	bpl	loop	;if last operation results positive goto loop.
	rts
*/

	// The code here is not optimized just to show how the original Atari 2600 routine works.
	var c_flag;			// Flag that indicates if last operation resulted in a
						// overflow of 8bit 6502 register
	for(var y_reg = 2 ; y_reg >= 0; y_reg--){ //y_reg equivalent to Y register
		var a_reg = value;	// equivalent to register A in 6502 cpu
		a_reg = a_reg << 1;
		a_reg = a_reg << 1;
		a_reg = a_reg << 1;
		a_reg = 0xff & (a_reg^value);
		a_reg = a_reg << 1;
		if(a_reg > 0xff){ // a overflow ocurred.
			c_flag = 1;
		}else{
			c_flag = 0;
		}
		value = (value << 1) + c_flag;	
	}
	return(value & 0xFF); // returns just a 8bit value
}


function drawSprite(sprite,x,y,dir,color,hScale){
	// Actually X Canvas position based in Atari x position.
	xCanvas = x*2*canvasScale;
	// Actually Y Canvas position based in Atari Y position.
	yCanvas = y*canvasScale;
    for(line = 0 ; line < sprite.length; line++){
		// Set the color to entire line as in Atari 2600 hardware.
		ctx.fillStyle = tiaColor(color);
		// If sprite are in sea line discard 4 draw lines.
		if(y + line < 46 || y + line > 49){
			for(var i = 0; i<8;i++){
				if(dir == 1){
					if(((sprite[line]<<i)&0x80)==0x80){
						ctx.fillRect(x*2*canvasScale+2*i*hScale*canvasScale,y*canvasScale+line*canvasScale,2*hScale*canvasScale,canvasScale);
					}	
				}
				if(dir == -1){
					if(((sprite[line]>>i)&0x01)==0x01){
						ctx.fillRect(x*2*canvasScale+2*i*hScale*canvasScale,y*canvasScale+line*canvasScale,2*hScale*canvasScale,canvasScale);
					}	
				}
			}
		}
	}
}

function drawBG(){	
	seaWaveGenerator = ((seaToken&1)<<9) + (seaToken<<1) + (seaToken>>7) ;
	
	// SeaQuest Background color.
	sqbk =
		[[26,0x84], // Sky
		[2,0x74],	//
		[2,0x64],	//
		[2,0x54],	//
		[2,0x44],	//	Dawn
		[2,0x34],	//
		[1,0x24],	//
		[1,0x14],	//
		[10,0x90],  // Sea waves
		[1,0x00],
		[97,0x90],	// Deep Sea
		[2,0xa0],
		[2,0xb0],
		[4,0xc0],	// Sea Botton
		//[7,0x32],
		[27,0x06],
		[12,0x00]]
		
	// Clear Screen
	ctx.clearRect(0,0,width,height);
	// Draw backgound scheme stored in sqbk.
	scanline = 0;
	for(colorBK of sqbk){
		//console.log(colorBK);
		for(i = 0; i < colorBK[0];i++){
			if((colorBK[0] == 10)&&((seaWaveGenerator>>i)&1 == 1)){
				ctx.fillStyle = tiaColor(0x92);
			}else{
				ctx.fillStyle = tiaColor(colorBK[1]);
			}
			ctx.fillRect(0,scanline*canvasScale,width,canvasScale);
			scanline++;
		}		
	}
	
	// Draw playfield;
	
	
	// Draw Score
	for(i = 5; i >= 0; i--){
		digit = Math.floor(score/Math.pow(10,i))%10;
		if(digit > 0 || i == 0 ){
			drawSprite(numberSprite[digit],66+32-i*8,2,1,0x1A,1);
		}
		
	}
	
	// Draw life ico.
	for(i = 0; i< lifes; i++ ){
		drawSprite(lifeIco,66-8 + i * 8,15,1,0x1A,1);
	}
	
	// Draw seabed mountains
	var montain = [ 3,2,1,0,0,1,2,3];
	for(i = 0 ;i < 40; i++){
		ctx.fillStyle = tiaColor(0xc0);
		ctx.fillRect(i*8*canvasScale,154*canvasScale,8*canvasScale,canvasScale*montain[i%8]);
	}
	
	// Draw Oxygen bar
	for(i = 0; i < 3; i++)
		drawSprite(oxygenSprite[i], 15 + i*8 ,163,1,0x00,1);
	// Draw Oxygen Bar
	ctx.fillStyle = tiaColor(0x32);
	ctx.fillRect(2*49*canvasScale,163*canvasScale,2* maxOxygenBar * canvasScale,5*canvasScale);
	ctx.fillStyle = tiaColor(0x0C);
	ctx.fillRect(2*49*canvasScale,163*canvasScale,2* oxygen * canvasScale,5*canvasScale);
	
	// Draw rescued divers
	for(i = 0; i< lifes; i++ ){
		drawSprite(diverIco,58 + i * 8,170,1,0x84,1);
	}
	
	// Update the frame counter.
	frameCounter++;
	// Each 8 frames update the Sea Waves Token;
	if((frameCounter & 0x07) == 0x07)
		seaToken = shuffle(seaToken);
}

function frameDraw(){
	drawBG();	
}

function gameLogic(){
	player.update();
	if(torpedo.active){
		torpedo.update();
		//check Colisions
		for(obj of enemies)
			torpedo.checkCollision(obj);
	}
	for(obj of enemies){
		if(obj != undefined)
			obj.update();
	}
	if(player.y == 39 && oxygen < maxOxygenBar && (frameCounter&1) == 1 )
		oxygen++;
	if(player.y > 45 && oxygen > 0 && (frameCounter&0b00011111) == 0b00011111 ){
		oxygen--;	
	}	
	
	// Wait for the oxygen bar become full.
	if((oxygen == maxOxygenBar) && (inGame == false)){
		for(i = 0;i< 4;i++){
			enemies[i] = new Enemy(enemyLanes[i]);
		}
		window.addEventListener('keydown',playerMove,false);
		window.addEventListener('keyup',playerMove,false);
		inGame = true;
	}
	

	
}

function frameLoop(){
	
	frameDraw();
	gameLogic();
	
	// Draw left black offset to simulate Horizontal Blank
	ctx.fillStyle = tiaColor(0x00);
	ctx.fillRect(0,0,8*2*canvasScale,height);
}

function playerMove(e){
	//issue : if left press on right pressed , release stops move , same as up down
	var code = e.keyCode;
	//console.log(code);
	if(e.type == "keydown")
		switch (code) {
			case 32:
				torpedo.fire(player);
				break;
			case 37: 
				player.vx = -1; 
				player.dir = -1;
				break; //Left key
			
			case 38: player.vy = -1; break; //Up key
			case 39: 
				player.vx = 1; 
				player.dir = 1;
				break; //Right key
			case 40: player.vy = 1; break; //Down key     
		}
	if(e.type == "keyup")
		switch (code) {
			case 37: player.vx = 0; break; //Left key
			case 38: player.vy = 0; break; //Up key
			case 39: player.vx = 0; break; //Right key
			case 40: player.vy = 0; break; //Down key     
		}
}

function init(){
	
	width = cv.width
	height = cv.height
	
	// Token used to draw sea waves.
	seaToken = 0x08;
	// Counter used to generate a new seaToken.
	seaTokenCounter = 0;
	score = 0;
	lifes = 3;
	oxygen = 0;
	rescuedDivers = 3;
	dificulty = 0;
	
	// Frame counter for use in animations and miscs.
	frameCounter = 0;
	
	// Set refresh to 60, like the original Atari 2600 hardware.
	updateTimerTimerId = setInterval(frameLoop, 16);
	player = new Player(76,39);
	torpedo = new Torpedo(player,0,0,1);
		
	//frameLoop();
	
}


window.onload = init();


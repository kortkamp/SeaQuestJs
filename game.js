

var scanlines = 192;
var canvasScale = 3;
var cv = document.getElementById("gameCanvas");
var ctx = cv.getContext("2d");
var score;
var lifes;
var oxygen;
var rescuedDivers;
var maxOxygenBar = 64;
var objects = [];


class Enemy {
	constructor(sprite,x,y,color,hScale){
		// Coord position XY
		this.x = x;
		this.y = y;
		// Speed X and Y
		this.vx = 0;
		this.vy = 0;
		this.hScale = 1;
		this.color = color;
		// Horizontal Scale
		this.hScale = hScale;
		// Default direction will be 1(left to right)
		this.dir = 1;
		// This sprite has 
		this.moveLimit = true;
		// Haw many frames to draw a new sprite animation.
		this.animationInterval = 4;
		// Internal counter to do the animation.
		this.animationCounter = 0;
		// Animation speed, pow(animationSpeed,2) means how many frames to update sprite.
		// Usually can be 2 or 3
		// bigger means slower
		this.animationSpeed = 2;
		this.sprite = sprite;
	}
	destroy(){
		
	}
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
	update(){
		this.y += this.vy;
		this.x += this.vx;
		
		this.checkLimits();	

		// Draw this;
		//drawSprite(subSprite[(frameCounter>>2)%3],this.x,this.y,this.dir,this.color,this.hScale);
		drawSprite(this.sprite[(this.animationCounter>>this.animationSpeed)%3],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
		this.animationCounter++;
	}
	checkCollision(player){
		return false;
	}

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
	/*if(seaTokenCounter == 7){
		seaToken = shuffle(seaToken);
		seaTokenCounter = 0;
	}else{
		seaTokenCounter++;
	}*/
	seaWaveGenerator = ((seaToken&1)<<9) + (seaToken<<1) + (seaToken>>7) ;
	//console.log( " " + seaToken.toString(2).padStart(8,'0'));
	//console.log(seaWaveGenerator.toString(2).padStart(10,'0'));
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
	
	// Draw Player;
	//drawSprite(subSprite[(frameCounter>>2)%3],player.x,player.y,player.dir,0x18,2);
	
	
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
	
	
	// Draw Oxygen Sprite
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
	
	// Draw left black offset
	ctx.fillStyle = tiaColor(0x00);
	ctx.fillRect(0,0,16*canvasScale,height);
	
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
	for(obj of objects){
		obj.update();
	}
	if(player.y == 39 && oxygen < maxOxygenBar && (frameCounter&1) == 1 )
		oxygen++;
	if(player.y > 45 && oxygen > 0 && (frameCounter&0b00011111) == 0b00011111 ){
		oxygen--;	
	}	
}

function frameLoop(){
	
	frameDraw();
	gameLogic();
}

function playerMove(e){
	//issue : if left press on right pressed , release stops move , same as up down
	var code = e.keyCode;
	//console.log(code);
	if(e.type == "keydown")
		switch (code) {
			case 32:
				//player.fire()
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
	
	// Frame counter for use in animations and miscs.
	frameCounter = 0;
	
	
	// Set refresh to 60, like the original Atari 2600 hardware.
	updateTimerTimerId = setInterval(frameLoop, 16);
	player = new Enemy(subSprite,76,39,0x18,2);
	
	diver = new Enemy(subSprite,0,100,0x18,1);
	
	diver.vx = 3/8;
	diver.animationSpeed = 2;
	objects.push(diver);
	//frameLoop();
	
	window.addEventListener('keydown',playerMove,false);
	window.addEventListener('keyup',playerMove,false);
}


window.onload = init();


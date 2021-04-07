
// Atari 2600 pallete converted to RGB.
// The index represents each of 128 NTSC collor  pallete.
ntscTiaPallete = [
	0x000000,0x404040,0x6c6c6c,0x909090,0xb0b0b0,0xc8c8c8,0xdcdcdc,0xececec,
	0x444400,0x646410,0x848424,0xa0a034,0xb8b840,0xd0d050,0xe8e85c,0xfcfc68,
	0x702800,0x844414,0x985c28,0xac783c,0xbc8c4c,0xcca05c,0xdcb468,0xecc878,
	0x841800,0x983418,0xac5030,0xc06848,0xd0805c,0xe09470,0xeca880,0xfcbc94,
	0x880000,0x9c2020,0xb03c3c,0xc05858,0xd07070,0xe08888,0xeca0a0,0xfcb4b4,
	0x78005c,0x8c2074,0xa03c88,0xb0589c,0xc070b0,0xd084c0,0xdc9cd0,0xecb0e0,
	0x480078,0x602090,0x783ca4,0x8c58b0,0xa070cc,0xb484dc,0xc49cec,0xd4b0fc,
	0x140084,0x302098,0x4c3cac,0x6858c0,0x7c70d0,0x9488e0,0xa8a0ec,0xbcb4fc,
	0x000088,0xac209c,0x3840b0,0x505cc0,0x6874d0,0x7c8ce0,0x90a4ec,0xa4b8fc,
	0x00187c,0x1a3890,0x3854a8,0x5070bc,0x6888cc,0x7c9cdc,0x90b4ec,0xa4c8fc,
	0x002c5c,0x1c4c78,0x386890,0x5084ac,0x689cc0,0x7cb4d4,0x90cce8,0xa4e0fc,
	0x003c2c,0x1c5c48,0x387c64,0x509c80,0x68b494,0x7cd0ac,0x90e4c0,0xa4fcd4,
	0x003c00,0x205c20,0x407c40,0x5c9c5c,0x74b474,0x8cd08c,0xa4e4a4,0xb8fcb8,
	0x143800,0x345c1c,0x507c38,0x6c9850,0x84b468,0x9ccc7c,0xb4e490,0xc8fca4,
	0x2c3000,0x4c501c,0x687034,0x848c4c,0x9ca864,0xb4c078,0xccd488,0xe0ec9c,
	0x442800,0x644818,0x846830,0x4a8444,0xb89c58,0xd0b46c,0xe8cc7c,0xfce08c
];

var scanlines = 192;
var canvasScale = 3;
var cv = document.getElementById("gameCanvas");
var ctx = cv.getContext("2d");
var score;
var lifes;
var x = 76;
var y = 39;
var vx = 0;
var vy = 0;

class Enemy {
	constructor(sprite,x,y,color,hScale){
		// Coord position XY
		this.x = x;
		this.y = y;
		
		// Speed X and Y
		this.vx = 0;
		this.vy = 0;
		
		this.collor = color;
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
		
	}
	update(){
		this.y += this.vy;
		this.x += this.vx;
		
				
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
	checkCollision(player){
		return false;
	}
}






// Converts a HEX RIA pallete code to RGB format.
function tiaColor(value){
	return("#" + ntscTiaPallete[Math.floor(value/2)].toString(16).padStart(6,"0"));
}

// This function emulates the exact behavior of Sea Quest shuffle routine.
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

// Sprites

// Sub Sprite
// Can you see a sub here ??
const subSprite = [
	[
	0b00000100,
	0b00001100,
	0b00001100,
	0b00001100,
	0b00001100,
	0b00111111,
	0b11111111,
	0b11111101,
	0b01111111,
	0b11111110,
	0b10000000],
	[
	0b00000100,
	0b00001100,
	0b00001100,
	0b00001100,
	0b00001100,
	0b10111111,
	0b01111111,
	0b11111101,
	0b11111111,
	0b01111110,
	0b10000000],
	[
	0b00000100,
	0b00001100,
	0b00001100,
	0b00001100,
	0b00001100,
	0b10111111,
	0b11111111,
	0b01111101,
	0b11111111,
	0b11111110,
	0b00000000],
];

// Mini Sub ico
lifeIco = [
	0b00000100,
	0b00001100,
	0b00001100,
	0b10111110,
	0b11111110,
	0b11111110,
	0b11111100,
	0b10000000
];

numberSprite = [
	[// 0 
	0b00111100,
	0b01100110,
	0b01100110,
	0b01100110,
	0b01100110,
	0b01100110,
	0b01100110,
	0b00111100
	],
	[// 1 
	0b00011000,
	0b00111000,
	0b00011000,
	0b00011000,
	0b00011000,
	0b00011000,
	0b00011000,
	0b00111100
	],
	[// 2
	0b00111100,
	0b01000110,
	0b00000110,
	0b00000110,
	0b00111100,
	0b01100000,
	0b01100000,
	0b01111110
	],
	[// 3
	0b00111100,
	0b01000110,
	0b00000110,
	0b00001100,
	0b00001100,
	0b00000110,
	0b01000110,
	0b00111100,
	],
	[// 4
	0b00001100,
	0b00011100,
	0b00101100,
	0b01001100,
	0b01111110,
	0b00001100,
	0b00001100,
	0b00001100
	],
	[// 5
	0b01111110,
	0b01100000,
	0b01100000,
	0b01111100,
	0b00000110,
	0b00000110,
	0b01000110,
	0b01111100
	],
	[// 6
	0b00111100,
	0b01100010,
	0b01100000,
	0b01111100,
	0b01100110,
	0b01100110,
	0b01100110,
	0b00111100
	],
	[// 7
	0b01111110,
	0b01000010,
	0b00000110,
	0b00001100,
	0b00011000,
	0b00011000,
	0b00011000,
	0b00011000
	],
	[// 8
	0b00111100,
	0b01100110,
	0b01100110,
	0b00111100,
	0b00111100,
	0b01100110,
	0b01100110,
	0b00111100,
	],
	[// 9
	0b00111100,
	0b01100110,
	0b01100110,
	0b01100110,
	0b00111110,
	0b00000110,
	0b01000110,
	0b00111100
	],

];

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
				if(((sprite[line]<<i)&0x80)==0x80){
					ctx.fillRect(x*2*canvasScale+2*i*hScale*canvasScale,y*canvasScale+line*canvasScale,2*hScale*canvasScale,canvasScale);
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
		[11,0xc0],	// Sea Botton
		[7,0x32],
		[13,0x06],
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
	drawSprite(subSprite[(frameCounter>>2)%3],player.x,player.y,1,0x18,2);
	
	
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
	// 
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
	
}

function frameLoop(){
	gameLogic();
	frameDraw();
	
}

function playerMove(e){
	
	var code = e.keyCode;
	if(e.type == "keydown")
		switch (code) {
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
	score = 20;
	lifes = 3;
	
	// Frame counter for use in animations and miscs.
	frameCounter = 0;
	
	player = new Enemy(subSprite,x,y,0x18,2);
	// Set refresh to 60, like the original Atari 2600 hardware.
	updateTimerTimerId = setInterval(frameLoop, 16);
	//frameLoop();
	
	window.addEventListener('keydown',playerMove,false);
	window.addEventListener('keyup',playerMove,false);
}


window.onload = init();


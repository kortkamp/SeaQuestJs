
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



window.onload = init();


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
	rol	$82		;bit rotate left and if overflow ocurs , set C flag
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



function drawBG(){
	
	if(seaTokenCounter == 7){
		seaToken = shuffle(seaToken);
		seaTokenCounter = 0;
	}else{
		seaTokenCounter++;
	}
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
	
	
	
	for(i = 0 ; i < scanlines; i++){
		//ctx.fillStyle = tiaColor(0x84);
		//ctx.fillRect(0,i*canvasScale,width,canvasScale);
	}
	
}

function frameDraw(){
	drawBG();
	
}


function gameLogic(){
	
	
}

function frameLoop(){
	gameLogic();
	frameDraw();
	
}


function init(){
	
	width = cv.width
	height = cv.height
	
	// Token used to draw sea waves.
	seaToken = 0x08;
	// Counter used to generate a new seaToken.
	seaTokenCounter = 0;
	
	// Set refresh to 60, like the original Atari 2600 hardware.
	updateTimerTimerId = setInterval(frameLoop, 16);
	//frameLoop();
	
}




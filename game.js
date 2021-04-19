/*
TODO
- seria interessante criar uma classe para o campo e o score e as vidas seriam propriedade dessa classe
  nesse modo teríamos que passa-la como parametro para os enemies já que os mesmos alteram o score.



- issue - tubarão não está acelerando quando toca diver

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

const surfaceYposition = 39;

const startPlayerPosition = {
	'x':76,
	'y':39
	
};

//var canvasScale = 1;
var cv = document.getElementById("gameCanvas");
var ctx = cv.getContext("2d");

var score;
var killScore;
var oxygenScore;
var diverScore;


//Dificulty , aka speed of the game.
var gameDificulty;

var enemySpeed = 0.375;

// Max oxygen used do draw oxygen bar.
var maxOxygenBar = 64;

var enemyList = [];
var enemyTorpedoList = [];
var diverList = [];
// Y position for each of 4 lines of enemies.
var enemyLanes = [61,85,109,133];
// Ready for game, oxygen full.

// In Sea Quest the enemy colors change as dificulty increases.
// enemyColors[0] represents the shark colors and enemyColors[1] the sub ones.
// these are cicling array, when dificulty rises to the last element the next muust be the first.
var enemyColors = [	[0xc8,0xe8,0x58,0x36,0xc6,0xe8,0xc8,0x36], 
					[0x08,0x08,0x08,0x08,0x08,0x08,0x08,0x08]];


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
		// List of objects to verify colisions
		this.collisorList = [];
		this.active = false;
	}
	destroy(){
		
	}
	checkLimits(){
		
	}
	checkInternals(){
		
	}
	update(){
		
		this.updateHandler();
	}

	updateHandler(){
		if(this.active){
			this.y += this.vy;
			this.x += this.vx;
			
			this.checkLimits();	

			this.checkCollision();


			var spriteNumber = (this.animationCounter>>this.animationSpeed)%3;
			drawSprite(this.sprite[spriteNumber],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
			this.animationCounter++;

			this.checkInternals();
		}

	}
	addCollisor(gameObjects){
		if(Array.isArray(gameObjects)){
			for(var obj of gameObjects)
				if(!this.collisorList.includes(obj))
					this.collisorList.push(obj);
		}
		else
			this.collisorList.push(gameObjects);
	}
	// Checks for a colision with another GameObject
	checkCollision(){
		for(var object of this.collisorList){
			
			// horizontal contact
			if((this.x + this.hScale * 8) >= object.x && this.x <= (object.x + object.hScale*8)) {
				
				if((this.y + this.sprite[0].length) >= object.y && this.y <= object.y + object.sprite[0].length){
					// Must insert a pixel colision here.
					this.colisionAction(object);
				}
			}
		}
			
	}
	colisionAction(object){
		
	}
	

}

class Torpedo extends GameObject{
	constructor(parentLaucher){
		super(singleTorpedoSprite,0,0,0x18,2);
		
		this.parentLaucher = parentLaucher;
		this.speed = 3;
		this.hScale = 1;
		this.dir = 1;
		this.vx = this.dir*this.speed;
		this.active = false;
	}
	update(){
		if(this.active){
			this.y = this.parentLaucher.y + 7;
			this.x += this.vx;
			this.checkLimits();	
			this.checkCollision();
			drawSprite(this.sprite[0],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
		}
	}
	
	checkLimits(){
		if(this.x >= atariScreen.width || (this.x + spriteWidth <= 0 )){
			this.halt();
			//fireTorpedoSound.pause();
			//fireTorpedoSound.currentTime = 0;
		}
		
	}
	colisionAction(object){
		if(object.enemyType == enemyId.shark)
			destroySharkSound.play();
		else
			destroyEnemySubSound.play();
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

class EnemyTorpedo extends Torpedo{

	constructor(parent){
		super(parent);
		this.sprite = doubleTorpedoSprite;
		this.speed = 1;
		this.y = parent.y + 5;
	}

	update(){
		if(this.active){
			
			this.x += this.vx;
			this.checkLimits();	
			this.checkCollision();
			drawSprite(this.sprite[0],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
		}
	}
	reset(){

		this.x = -20;
		this.halt();
	}
	kill(){
		this.reset();
	}
	fire(posX){
		
		if(!this.active){
			
			this.dir = this.parentLaucher.dir;
			this.vx = this.dir*this.speed;
			
			
			this.x = posX ;//+ 6*this.parentLaucher.hScale + 1;
			this.active = true;
		}
	}
}
class Diver extends GameObject{
	constructor(lanePosition){
		super(diverSprite,null,enemyLanes[lanePosition]-3,0x86,2);
		this.parentShark = null;
		this.hScale = 1;
		
		this.vx = this.dir*this.speed;
		this.vy = 0;
		this.active = false;
		this.animationSpeed = 3;
		this.recentRescued = true;
		
	}
	update(){
		if(this.active){
			this.x += this.vx;
			
			this.checkLimits();	
			this.checkInternals();
			this.checkCollision();

			var spriteNumber = (this.animationCounter>>this.animationSpeed)%3;
			drawSprite(this.sprite[spriteNumber],Math.floor(this.x),Math.floor(this.y),this.parentShark.dir,this.color,this.hScale);
			this.animationCounter++;
		}
	}
	checkLimits(){
		
		if(this.x > (atariScreen.width + 5)){
			this.active = false;
			this.x = atariScreen.width;
		}
		if(this.x   < -spriteWidth-10 ){
			this.active = false;
			this.x = 0-spriteWidth;
		}
		
	}
	colisionAction(object){
		if(this.active){
			
			if(object instanceof Player){
				// Diver rescued
				if(player.rescuedDivers < 6){
					rescueDiverSound.play();
					player.rescuedDivers++;
					this.reset();
					this.active = false;
					this.recentRescued = true;
				}
			}else{
				// Terrible shark, RUN!!
				this.animationSpeed = 2;
				this.vx = this.parentShark.vx;
			}
		}
	}
	reset(){
		if(this.recentRescued){
			// have a probability to create a new diver.
			if(Math.random() < 0.5){
				this.recentRescued = false;
			}
		}
		if(!this.recentRescued){
			
			this.dir = this.parentShark.dir;
			// Initial diver speed is 1/2 shark speed
			this.vx = this.parentShark.vx/2; 
			
			//this.x = this.parentShark.startPoint[1-this.dir]+this.dir*47;
			if(this.dir == 1)
				this.x = 0-spriteWidth;
			else
				this.x = atariScreen.width;
			//this.x = 80;
			this.animationSpeed = 3;
			this.active = true;
		}
	}
	
}

class Player extends GameObject{
	constructor(playerInput){
		
		super(subSprite,startPlayerPosition.x,startPlayerPosition.y,0x18,2);
		this.input = playerInput;
		this.baseSpeed = 1;
		this.hScale = 2;
		this.oxygen = 0;
		this.rescuedDivers = 0;
		
		this.enginePower = 0;
		//this.deliveringDivers = false;
		this.subStillSurfaced = true;
		this.explosionFrameCounter = 0;
		this.explosionInAction = false;
		this.active = false;
		this.lifesCounter = 0;
		this.stateSet = new Set();
		
	}
	setInput(inputData){
		this.vx = this.enginePower * inputData.x;
		this.vy = this.enginePower * inputData.y;
		if(this.vx > 0)
			this.dir = 1;
		
		if(this.vx < 0)
				this.dir = -1;
		if(inputData.fire)
			this.fire();
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
			this.delliverDivers();
			this.refitOxygen();
			this.y = 39;
		}
		if(this.y > 45 && this.oxygen > 0 && (frameCounter&0b00011111) == 0b00011111 ){
			this.oxygen--;	
			this.subStillSurfaced = false;
		}	
	}
	checkInternals(){
		// Y measures depth
		if(this.explosionInAction)
			this.subExplosionAnimation();
		else{
			if(this.oxygen == 0 && this.y > startPlayerPosition.y)
				this.destroyPlayer();
			if(this.oxygen <= 16)
				if(this.enginePower != 0)
					if(lowOxygenSound.currentTime == 0 || lowOxygenSound.currentTime==lowOxygenSound.duration)
						lowOxygenSound.play();
						
		}
		//if(this.oxygen <= 16 && this.enginePower != 0)
			
		
	}
	colisionAction(object){
		
		object.kill();
		stopAllGameObjects();
		this.destroyPlayer();
	}
	// Decrease a lifecouter, resets player and enemies
	destroyPlayer(){
		
		destroyPlayerSound.play();
		// here we must animate player destruction
		// Memo , sharks must not stop oscilation during this animation
		
		this.enginePower = 0;
		this.vx = 0;
		this.vy = 0;
		this.explosionInAction = true;
		this.explosionFrameCounter = 0;
		
		
		
	}
	resetAfterDestruction(){

		

		this.oxygen = 0;
		this.subStillSurfaced = true;
		this.lifesCounter--;
		if(this.rescuedDivers>0)
			this.rescuedDivers--;
		if(this.lifesCounter < 0)
			this.active = false;

		this.resetPosition();
		this.enginePower = 1;
		
		resetAllgameObjects();
		
	}
	subExplosionAnimation(){
		//console.log("subExplosionAnimation")
		this.explosionPhase = this.explosionFrameCounter>>2;
		this.explosionSchemme = {
				'frames':[4,	4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4,		4],
				'sprite':[null,	null,	null,	null,	null,	null,	null,	null,	null,	0,		0,		1,		1,		2,		2,		2,		2,		2],
				'color': [0xe0,	0x00,	0xe0,	0x00,	0xe0,	0x00,	0xe0,	0x00,	0xe0,	0x9c,	0x9c,	0x9c,	0x9c,	0x9c,	0x98,	0x96,	0x94,	0x92]
		};
		//console.log(this.explosionPhase +" "+ this.explosionSchemme.sprite.length);
		if(this.explosionPhase <= this.explosionSchemme.sprite.length){
			this.color = this.explosionSchemme.color[this.explosionPhase];
			if(this.explosionSchemme.sprite[this.explosionPhase] != null)
				this.sprite = subExplosionSprite[this.explosionSchemme.sprite[this.explosionPhase]];
		}else{
			//end exlosion animation
			this.resetAfterDestruction()
			this.explosionInAction = false;
			this.sprite = subSprite;
			this.color = 0x17;
		}
		this.explosionFrameCounter++;
	}
	resetPosition(){
		this.x = 76;
		this.y = 39;
		this.dir = 1;
		
	}
	fire(){
		if(this.enginePower != 0){
			if(!torpedo.active) fireTorpedoSound.play();
			torpedo.fire();
			
		}
	}
	refitOxygen(){
		
		this.enginePower = 1;
		if(this.oxygen < maxOxygenBar && !this.explosionInAction && this.rescuedDivers<6){
			if(refitOxygenSound.currentTime == 0 || refitOxygenSound.currentTime==refitOxygenSound.duration){
				refitOxygenSound.currentTime = refitOxygenSound.duration*(this.oxygen/maxOxygenBar);
				refitOxygenSound.play();
			}
			player.oxygen += 0.5;
			
			this.enginePower = 0;
		}else{
			
		}
	}
	
	delliverDivers(){
		// If previously the sub was not surfaced.
		// Need this to prevent a loop o dellivering divers.
		if(!this.subStillSurfaced){
			if(this.rescuedDivers >= 6){
				this.update = this.delliverAllDiversHandler;
			}
			else if(this.rescuedDivers>0){
				this.rescuedDivers--;
				gameDificulty++;
				enemySpeed += 0.0625;
			}
			else{
				if(this.oxygen > 0)
					this.destroyPlayer();
				
			}
			this.subStillSurfaced = true;
		}
	}
	delliverAllDiversHandler(){
		var spriteNumber = (this.animationCounter>>this.animationSpeed)%3;
		drawSprite(this.sprite[spriteNumber],Math.floor(this.x),Math.floor(this.y),this.dir,this.color,this.hScale);
		this.animationCounter++;
		if(this.oxygen > 0){
			if(frameCounter&2==2){

				if(dropOxygenSound.currentTime == 0 || dropOxygenSound.currentTime==dropOxygenSound.duration){
					//dropOxygenSound.currentTime = dropOxygenSound.duration*(this.oxygen/maxOxygenBar);
					dropOxygenSound.play();
				}
				
				this.oxygen--;
				score+=oxygenScore;
				
			}
		}else if(this.rescuedDivers > 0){
			if((frameCounter&0b01111)==0b01111){
				deliverDiverSound.play();
				this.rescuedDivers--;
				score+=diverScore;
			}
		}else{
			gameDificulty++;
			enemySpeed += 0.0625;
			oxygenScore += 10;
			killScore += 10;
			diverScore += 50;
			this.update = this.updateHandler;
		}
	}
}

class Enemy extends GameObject{
	constructor(lanePosition){
		super(null,null,enemyLanes[lanePosition],null,null);
		
		if(!(lanePosition => 0 && lanePosition <= 3))
			console.log("Error creating enemy, you must select a lane between 0-3");

		this.startPoint = [-55,0,atariScreen.colorClocks + 55];
		// 0 = shark and 1 = sub
		this.lanePosition = lanePosition;
		this.startYPosition = enemyLanes[lanePosition];
		this.enemyType = enemyId.shark;
		this.childDiver = null;
		
		//mirrored enemies that fallow the first enemies in a lane.
		this.copies = [true,false,false];
		this.copiesScheme = [
			[true,false,false],
			[true,false,false],
			[true,true,false],
			[true,true,false],
			[true,false,true],
			[true,false,true],
		];
			

	
	}
	update(){
		
		// if enemy is shark the y must oscilate from +0 to +8 and +0
		this.y = this.startYPosition + this.sharkOscilation();
		this.x += this.vx;
		
		this.checkLimits();
		this.checkCollision();
		this.fire();
		
		this.color = enemyColors[this.enemyType][gameDificulty%8];
		for(var copy in this.copies)
			if(this.copies[copy])
				drawSprite(
							this.sprite[(this.animationCounter>>this.animationSpeed)%3],
							Math.floor(this.x) - this.dir * copy*16,
							Math.floor(this.y),
							this.dir,
							this.color,
							this.hScale);
				this.animationCounter++;
	}
	checkCollision(){
		this.color = enemyColors[this.enemyType][gameDificulty%8];
		for(var copy in this.copies)
			if(this.copies[copy])
				for(var object of this.collisorList){	
					
					// horizontal contact
					if(object.active)
						if(((this.x - this.dir * copy*16) + this.hScale * 8) >= object.x && (this.x - this.dir * copy*16) <= (object.x + object.hScale*8)) {
							if((this.y + this.sprite[0].length) >= object.y && this.y <= object.y + object.sprite[0].length){
								// Must insert a pixel colision here.
								this.copies[copy] = false;
								this.colisionAction(object,copy);
								
								//console.log("colision copy:" + copy + " = " + this.copies[copy] );
							}
						}
				}
			
	}
	colisionAction(object,copy){
		object.colisionAction(this);
		
	}
	sharkOscilation(){
		if(this.enemyType == enemyId.shark){
			var oscilation = (frameCounter>>2)&0x0f;
			if(oscilation > 8) 
				return(12-oscilation);
			return(oscilation-4);
			}
		return(0);
	}
	
	checkLimits(){
		if((this.x > atariScreen.colorClocks+33) && (this.dir == 1)){
			// Alternate between shark and sub
			this.enemyType = this.enemyType ^ 1;	
			this.reset(this.y);
			
			
		};
		if((this.x < -33) && (this.dir == -1)){
			// Alternate between shark and sub
			this.enemyType = this.enemyType ^ 1;
			this.reset(this.y);
		};
	}
	fire(){
		for(let copy in this.copies){
			let copyPosX = this.x - this.dir * copy * 16;
			//console.log(this.x +" "+ copyPosX);
			if(this.copies[copy]){ // if the copy is active
				if(this.enemyType == enemyId.sub)
					if(!enemyTorpedoList[this.lanePosition].active)
						if(copyPosX > 39 && copyPosX < (atariScreen.width-39) && this.vx != 0) {
							//console.log("Enemy " + this.lanePosition);
							//console.log("	copy " + copy +" this.x=" +this.x + " copyPosX=" + copyPosX);
							enemyTorpedoList[this.lanePosition].fire(copyPosX);
							
						}
				return;
			}
		}
	}
	kill(){
		
		score += killScore;


	
		// if all copies are dead
		if(!(this.copies[0]||this.copies[1]||this.copies[2])){
			// When you kill a enemy , it resets to a shark.	
			this.enemyType = enemyId.shark;	
			this.reset();	
			this.childDiver.dir = this.dir
			this.childDiver.vx = this.vx/2;
			this.childDiver.animationSpeed = 3;
			
			this.setNewCopiesScheme();
			
		}
	}
	setNewCopiesScheme(){
		if(gameDificulty <= 5)
			this.copies = this.copiesScheme[gameDificulty].slice();
		else
			this.copies = [true,true,true];

		

	}
	reset(){
		
		this.y = enemyLanes[this.lanePosition];
		//Direction is randomized every enemy reset.
		this.dir = binaryRandom();
		//Vx must follow  "dir" direction.
		this.vx = this.dir * enemySpeed;
		// The initial position depends on direction.
		this.x = this.startPoint[1-this.dir];
		// Basic animation speed depends on enemy type. Subs have 2 and sharks 3.
		this.animationSpeed = 3-this.enemyType;
		// Update the enemy sprite. 0 for shark and 1 for sub.
		this.sprite = enemySprites[this.enemyType];
		
		this.childDiver.vx = this.vx/2;
		this.childDiver.animationSpeed = 3;

		// If enemy is a shark and is on the same side of hidden diver, ativate it.
		if((this.enemyType == enemyId.shark) &&(!this.childDiver.active)&& (Math.abs(this.x - this.childDiver.x) < 100)){
			
			//this.childDiver.active = true;
			this.childDiver.reset();
		}
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
	//xCanvas = x*canvasScale;
	// Actually Y Canvas position based in Atari Y position.
	//yCanvas = y*canvasScale;
    for(line = 0 ; line < sprite.length; line++){
		// Set the color to entire line as in Atari 2600 hardware.
		ctx.fillStyle = tiaColor(color);
		// If sprite are in sea line discard 4 draw lines.
		if(y + line < 46 || y + line > 49){
			for(let i = 0; i<8;i++){
				if(dir == 1){
					if(((sprite[line]<<i)&0x80)==0x80){
						ctx.fillRect(x+i*hScale,y+line,hScale,1);
					}	
				}
				if(dir == -1){
					if(((sprite[line]>>i)&0x01)==0x01){
						ctx.fillRect(x+i*hScale,y+line,hScale,1);
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
			ctx.fillRect(0,scanline,width,1);
			scanline++;
		}		
	}
	
	// Draw playfield;
	
	
	// Draw Score
	skyColor = 0x84
	scoreColor = skyColor;
	for(i = 5; i >= 0; i--){
		digit = Math.floor(score/Math.pow(10,i))%10;
		if(digit > 0 || i == 0) 
			scoreColor = 0x1A;
		drawSprite(numberSprite[digit],66+32-i*8,2,1,scoreColor,1);
	}
	
	// Draw life ico.
	for(i = 0; i< player.lifesCounter; i++ ){
		drawSprite(lifeIco,66-8 + i * 8,15,1,0x1A,1);
	}
	
	// Draw seabed mountains
	var montain = [ 3,2,1,0,0,1,2,3];
	for(i = 0 ;i < 40; i++){
		ctx.fillStyle = tiaColor(0xc0);
		ctx.fillRect(i*4,154,4,montain[i%8]);
	}
	
	// Draw Oxygen bar
	// TODO , blinking bar when oxygen reaches 10 or <
	for(i = 0; i < 3; i++)
		drawSprite(oxygenSprite[i], 15 + i*8 ,163,1,0x00,1);
		
	// Draw Oxygen Bar
	ctx.fillStyle = tiaColor(0x32);
	
		
	ctx.fillRect(49,163, maxOxygenBar ,5);
	ctx.fillStyle = tiaColor(0x0C);
	if((player.oxygen <= 16) && ((frameCounter&16) == 16)&& (player.enginePower != 0))
		ctx.fillStyle = tiaColor(0x00);
	ctx.fillRect(49,163, player.oxygen ,5);
	
	// Draw rescued divers
	diverIcoColor = 0x84;
	if(player.rescuedDivers == 6 && (frameCounter&8)==8)
		diverIcoColor = 0x06;
	for(i = 0; i< player.rescuedDivers; i++ ){
		drawSprite(diverIco,58 + i * 8,170,1,diverIcoColor,1);
	}
	
	// Update the frame counter.
	frameCounter++;
	// Each 8 frames update the Sea Waves Token;
	if((frameCounter & 0x07) == 0x07)
		seaToken = shuffle(seaToken);
}

function drawHorizontalBlank(){
	ctx.fillStyle = tiaColor(0x00);
	ctx.fillRect(0,0,8,height);
}




/*
	This class gonna organize and synchonize all timed events for game and game objects.
	We must atach only functions or methods to observerList
*/
class GameTimer{
	constructor(){
		if(typeof GameTimer.instance === 'object'){
			
			return GameTimer.instance;
		}
		GameTimer.instance = this;
		this.mainTimerId = setInterval(this.timerEventListener.bind(this), 16);
		this.observerObjectsList = [];
		this.observerFunctionsList = [];
		return(this);
	}

/*
	if(Array.isArray(gameObjects)){
		for(var obj of gameObjects)
			if(!this.collisorList.includes(obj))
				this.collisorList.push(obj);
	}
	else
		this.collisorList.push(gameObjects);
		*/

	attachFunction(functionToUpdate){
		this.observerFunctionsList.push(functionToUpdate);
	}
	attachObserver(objectToUpdate){

		if(Array.isArray(objectToUpdate)){
			for(var obj of objectToUpdate)
				this.observerObjectsList.push(obj);
				//if(!this.observerList.includes(obj.update))
				//	this.observerList.push(obj.update);
		}
		else
			this.observerObjectsList.push(objectToUpdate);

		
	}
	detachObserver(functionToDetach){
		for(var obs in this.observerList)
			if(this.observerList[obs] === functionToDetach)
				this.observerList.splice(obs,1);
	}
	
	// Functions gonna be drawed first.
	updateAll(){
	
		for(var update of this.observerFunctionsList)
			update();
		for(var obj of this.observerObjectsList){
			
				obj.update();
			}
		

		//Fix this you lazy stupid!
		drawHorizontalBlank();

	}
	timerEventListener(){
		this.updateAll();
		
	}

}

class Input{
	constructor(){
		this.inputData = {
			'x': 0,
			'y': 0,
			'fire':true
		};
		this.observerList = [];
		this.moveLeft = 0;
		this.moveRight = 0;
		this.moveUp = 0;
		this.moveDown = 0;
		this.fire = false;
		this.stick = null;
		this.stickArea = document.getElementById("stickBorder"); 
		this.controller = document.getElementById("controller"); 
		this.controllerX = 0;
		this.controllerY = 0;
		this.controllerCenterX = this.stickArea.offsetLeft+this.stickArea.offsetWidth/2;
		this.controllerCenterY = this.stickArea.offsetTop+this.stickArea.offsetHeight/2+ this.controller.offsetTop;
	}
	atachObserver(observer){
		
		if(observer.setInput == undefined)
			console.trace(observer.constructor.name + " has not setInput method");
		else
			this.observerList.push(observer);
	}
	notifyObservers(){
		for(var id in this.observerList)
			this.observerList[id].setInput({	'x':this.moveRight-this.moveLeft+this.controllerX,
							'y':this.moveDown-this.moveUp + this.controllerY,
							'fire':this.fire});

	}
	keyboardListener(e){
		
		var code = e.keyCode;
		if(e.type == "keydown"){
				
				switch (code) {
					case 32: this.fire = true; break; // Space
					case 37: this.moveLeft = 1; break; //Left key
					case 65: this.moveLeft = 1; break; //A key
					case 38: this.moveUp = 1; break; //Up key
					case 87: this.moveUp = 1; break; //W key
					case 39: this.moveRight = 1; break; //Right key
					case 68: this.moveRight = 1; break; //D key
					case 40: this.moveDown = 1;	break; //Down key
					case 83: this.moveDown = 1;	break; //S key     
				}
			
		}
		if(e.type == "keyup"){
			
			switch (code) {
				case 32: this.fire = false; break; //space
				case 37: this.moveLeft = 0; break; //Left key
				case 65: this.moveLeft = 0; break; //A key
				case 38: this.moveUp = 0; break; //Up key
				case 87: this.moveUp = 0; break; //W key
				case 39: this.moveRight = 0; break; //Right key
				case 68: this.moveRight = 0; break; //D key
				case 40: this.moveDown = 0; break; //Down key     
				case 83: this.moveDown = 0;	break; //S key  
			}
			
		}
		this.notifyObservers();
	}
	cotrollerListener(e,input){
		
		
		input.controllerX = 0;
		input.controllerY = 0;
		if(e.type === "touchend"){
			//console.log("end touch");
			
			//release controls
			//console.log(e.type);
		}else if(e.type === "touchstart" || e.type === "touchmove"){
			//console.log(e.type);
			var x = e.touches[0].clientX - input.controllerCenterX;
			var y = e.touches[0].clientY - input.controllerCenterY;
			var touchDirectionDegrees  = 180*(1 - Math.atan2(x,y)/Math.PI);
			
			//console.log(touchDirectionDegrees);

			var radius = Math.sqrt(x*x + y*y)/document.getElementById("stickBorder").offsetHeight;
			
			var thresholdRadius = 0.15;
			if(radius > thresholdRadius){
				if(touchDirectionDegrees > 30 && touchDirectionDegrees < 150 )
					input.controllerX = 1;
				if(touchDirectionDegrees > 210 && touchDirectionDegrees < 330)
					input.controllerX = -1;
				if(touchDirectionDegrees > 120 && touchDirectionDegrees < 240)
					input.controllerY = 1;
				if(touchDirectionDegrees > 300 || touchDirectionDegrees < 60)
					input.controllerY = -1;
			}
		}
		input.notifyObservers();
		document.getElementById("stick").style.top = (35+7*input.controllerY) + "%";
		document.getElementById("stick").style.left = (37+7*input.controllerX) + "%";
	}
	initControllerListener(input){
		window.addEventListener('keydown',function(e){input.keyboardListener(e)},false);
		window.addEventListener('keyup',function(e){input.keyboardListener(e)},false);	
		this.stickArea.addEventListener("touchstart", function(e){input.cotrollerListener(e,input)}, false);
		this.stickArea.addEventListener("touchend", function(e){input.cotrollerListener(e,input)}, false);
		this.stickArea.addEventListener("touchmove",function(e){input.cotrollerListener(e,input)}, false);
	}
	getX(){
		return(this.moveRight-this.moveLeft + this.controllerX);
	}
	getY(){
		return(this.moveDown-this.moveUp + this.controllerY);
	}
	getFire(){
		return(this.fire);
	}
}

function resetGame(){
	

	killScore = 20;
	oxygenScore = 20;
	diverScore = 50;
	// Token used to draw sea waves.
	seaToken = 0x08;
	// Counter used to generate a new seaToken.
	seaTokenCounter = 0;
	score = 0;
	player.lifesCounter = 3;
	player.oxygen = 0;
	player.rescuedDivers = 0;
	gameDificulty = 0;
	enemySpeed = 0.375;
	
	// Frame counter for use in animations and miscs.
	frameCounter = 0;
	
	player.resetPosition();
	player.active = true;

	for(i in enemyList){
		enemyList[i].reset();
		enemyList[i].type = enemyId.shark;
		enemyList[i].sprite = sharkSprite;
		enemyList[i].color = enemyColors[gameDificulty];
		diverList[i].reset();
		//diverList[i].active = false;

	}
}

function loadSounds(){
	destroySharkSound = new Audio('./sounds/destroyShark.mp3');
	destroyEnemySubSound = new Audio('./sounds/destroyEnemySub.mp3');
	fireTorpedoSound = new Audio('./sounds/fireTorpedo.mp3');
	destroyPlayerSound = new Audio('./sounds/destroyPlayer.mp3');
	rescueDiverSound = new Audio('./sounds/rescueDiver.mp3');
	refitOxygenSound = new Audio('./sounds/refitOxygen.mp3');
	deliverDiverSound = new Audio('./sounds/deliverDiver.mp3');
	dropOxygenSound = new Audio('./sounds/dropOxygen.mp3');
	lowOxygenSound = new Audio('./sounds/lowOxygen.mp3');
	

}

function mobileCheck() {
	let check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check;
  };
function stopAllGameObjects(){
	for(let i = 0; i< 4; i++ ){
		enemyTorpedoList[i].vx = 0;
		enemyList[i].vx = 0;
		diverList[i].vx = 0;
	}
	// In original game when all enemies stop , player torpedo hides.
	torpedo.halt();
}
function resetAllgameObjects(){
	for(let i = 0; i< 4; i++ ){		
		diverList[i].reset();
		diverList[i].active = false;
		enemyList[i].reset();
		enemyTorpedoList[i].reset();

	}
}
function init(){
	
	seaToken = 0x08;
	score = 0;
	frameCounter = 0;
	gameDificulty = 0;

	width = cv.width
	height = cv.height

	// Mobile / dektop configs
	if(mobileCheck()){
		document.getElementById("gameCanvas").style.width = window.innerWidth + "px";
		document.getElementById("gameCanvas").style.height = Math.floor(window.innerWidth/1.66) + "px";
		document.getElementById("controller").style.display = "inline-block";

		function preventBehavior(e) {
			e.preventDefault(); 
		};
		
		document.addEventListener("touchmove", preventBehavior, {passive: false});
	}else{
		document.getElementById("gameCanvas").style.width = "70vw";
		document.getElementById("gameCanvas").style.height = "42vw";
	}



	loadSounds();
	
	input = new Input();
	input.initControllerListener(input);

		

	player = new Player(input);
	player.resetPosition();
	input.atachObserver(player);
	torpedo = new Torpedo(player);



	for(i = 0;i< 4;i++){
		enemyList[i] = new Enemy(i);
		enemyTorpedoList[i] = new EnemyTorpedo(enemyList[i]);
		
		diverList[i] = new Diver(i);
		// Link same lane Divers and Sharks.
		enemyList[i].childDiver = diverList[i];
		diverList[i].parentShark = enemyList[i];
		enemyList[i].reset(i);
		diverList[i].reset();
		
	}

	for(i in enemyList){
			enemyList[i].reset(i);
			diverList[i].reset();
			//diverList[i].active = false;
	}
	
	// Colisions
	//player.addCollisor(enemyList);
	player.addCollisor(enemyTorpedoList);
	//torpedo.addCollisor(enemyList);
	for(var enemy of enemyList){
		enemy.addCollisor(player);
		enemy.addCollisor(torpedo);
	}
	for(var diver of diverList){
		diver.addCollisor(enemyList);
		diver.addCollisor(player);
	}


	// Update Objects
	frameEvent = new GameTimer();
	frameEvent.attachFunction(drawBG);
	frameEvent.attachObserver(torpedo);
	frameEvent.attachObserver(enemyList);
	frameEvent.attachObserver(enemyTorpedoList);
	frameEvent.attachObserver(diverList);
	frameEvent.attachObserver(player);
	

}


window.onload = init();


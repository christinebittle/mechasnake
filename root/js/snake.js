
function gid(d){
	return document.getElementById(d);	
	
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}


function closeTo(a,b){
	if (Math.abs(a-b)<5) return true;  //more like 15.2
	return false;	
}
const game = gid('maingame');;
const ctx = game.getContext("2d");
var snakeheadw;
var snakeheadh;
var gw;
var gh;
var xpos;
var ypos;
var timecounter;
const directions = ['L','R','U','D'];
var direction;
var newgoodie;
var coords;
var trail;
var segment;
var segments;
var gamesteps;
var end;
const goodies = ['gear','wrench','battery','spring','oil'];
var xmin;
var xmax;
var ymin;
var ymax;

function resetGame(){
	
	 
	//base variables
	snakeheadw = 32;
	snakeheadh = 32;
	
	gw = window.innerWidth*0.65; // of width
	gh = gw*(9/16) ; //game width
	
	xpos = gw/2;
	ypos = gh/2; //start x, start y
	
	timecounter = 0;
	
	
	direction = directions[getRandomInt(directions.length)]; //starting direction
	
	newgoodie=1; //generate a goodie to start
	coords = [];
	trail = []
	
	switch(direction){
		case 'L': {deltax=snakeheadw; deltay=0; break;}
		case 'R': {deltax=-1*snakeheadw; deltay=0; break;}
		case 'U': {deltax=0; deltay=snakeheadh; break;}
		case 'D': {deltax=0; deltay=snakeheadh*-1; break;}	
	}
	
	trail = [[xpos+4*deltax, ypos+4*deltay],[xpos+3*deltax, ypos+3*deltay],[xpos+2*deltax, ypos+2*deltay],[xpos+1*deltax, ypos+1*deltay]]; //starting trail, len 1
	//var trail = [[xpos,ypos]];
	
	segment = []; //starting segment
	segments = 4;
	gamesteps = 4; //starting off game steps of 3
	//console.log(trail);
	end = false;
	
	
	
	
	//idea of "grid"
	xmin = 0;
	xmax = Math.floor(gw/32); //max width in 32px unit
	ymin = 0; 
	ymax = Math.floor(gh/32); //max height in 32px unit
	
	
	game.width = gw;
	game.height = gh;
	
	window.requestAnimationFrame(animate);
}

//console.log(direction);

window.addEventListener("keypress", function(e){
	console.log(e);
	switch(e.key){
		case 'w': {direction="U"; break;}
		case 'W': {direction="U"; break;}
		case 'a': {direction="L"; break;}
		case 'A': {direction="L"; break;}
		case 's': {direction="D"; break;}
		case 'S': {direction="D"; break;}
		case 'd': {direction="R"; break;}	
		case 'D': {direction="R"; break;}	
		case ' ': {e.preventDefault(); if(end) resetGame(); end=false; break;}	
	}
	//console.log(direction);
});



function animate(){
	
	ctx.fillStyle = "#000";
	ctx.fillRect(0,0,gw,gh);
	//console.log('animating...');
	//console.log(direction);
	drawsnakehead(ctx, xpos, ypos, direction); //L, R, U, D
	drawsegments(ctx,trail,segments);
	
	if(newgoodie) {coords = schedulegoodie(ctx,trail,4); newgoodie=0;}
	//console.log('i have coords of '+coords);
	placegoodie(coords); //<--segments (4) for now
	
	
	
	
	if(timecounter%10==0){
		segment = [xpos,ypos];
		end = collisiondetection(trail, segment, segments); //returns true if collision found
		trail[gamesteps] = segment;
		gamesteps=gamesteps+1; //increment gamesteps by 1
		switch(direction){
			case 'D' : {ypos += snakeheadh; break;}
			case 'R' : {xpos += snakeheadw; break;}
			case 'U' : {ypos -= snakeheadh; break;}
			case 'L' : {xpos -= snakeheadw; break;}
		}
		
		
		//console.log('xsegment: '+segment[0]+' xcoords '+(coords[0] +15));
		//console.log('ysegment: '+segment[1]+' ycoords '+((coords[1])+15));
		if(closeTo(segment[0],coords[0]+15) && closeTo(segment[1],coords[1]+15)){
			console.log('yum yum!');
			segments=segments+3;	
			newgoodie=1;
		}
		
		//console.log(trail);
		
	}
	
	
	
	
	timecounter=timecounter+1;
	//if(timecounter>800) end=true;
	timecounter=timecounter%1000; //recount every 1k
	//console.log(timecounter);
	
	if(end) showgameover(ctx);
	
	if(!end) window.requestAnimationFrame(animate);
	
}

function collisiondetection(trail, segment,segments){
	
	//collision with walls
	if(segment[0]<0) return true; //lower x bound
	if(segment[1]<0) return true; //"upper" (lower) y
	if(segment[0]>gw) {console.log('exceeded upper x!'); return true;} //upper x bound
	if(segment[1]>gh) {console.log('exceeded upper y!'); return true;} //"lower" (upper) y
	
	//collision with self
	for(var i=0; i<segments; i++){
		var idx = trail.length - 1 - i;
		if(closeTo(trail[idx][0],segment[0]) && (closeTo(trail[idx][1],segment[1]))){
			return true;
		}
	}	
	return false;
}

function showgameover(ctx){
	console.log('gameover!');
	ctx.font = "60px Luckiest Guy";
	ctx.fillStyle="red";
	ctx.textAlign = "center";
	ctx.fillText('Game Over!', gw/2,gh/2);
	
	ctx.font = "25px Luckiest Guy";
	ctx.fillText('[Space] To Play Again', gw/2, gh/2 + 50);	
	
}

function isgoodieinvalid(invalidspots,goodiex,goodiey){
	
	for(var i=0; i<invalidspots.length; i++){
		if (closeTo(trail[i][0],(goodiex*32)+4) && closeTo(trail[i][1],(goodiey*32)+8)) return true;
	}
	return false;
}


function schedulegoodie(ctx, trail, segments){
	var invalidspots = trail.slice(trail.length-1-segments,trail.length);
	//console.log('invalid spots are '+invalidspots.length);
	//console.log(invalidspots);
	
	goodiex = getRandomInt(xmax);
	goodiey = getRandomInt(ymax);
	//goodiex = (trail[0][0])/32;
	//goodiey = (trail[0][1])/32;
	
	
	while(isgoodieinvalid(invalidspots,goodiex,goodiey)){
		goodiex = getRandomInt(xmax);
		goodiey = getRandomInt(ymax);
		console.log('detected invalid..');
	}
	
	//console.log('passing data of '+goodiex+' and '+goodiey);
	goodiepic = goodies[getRandomInt(goodies.length)];
	
	return [(goodiex*32)+4,(goodiey*32)+8,goodiepic];
}

function placegoodie(arr){
	
	//the goodie cannot be placed on any of the trail for the number of segments
	//the goodie cannot be placed outside of the bound including the offset of the width of the head (32)
	
	//console.log('drawing goodie at '+arr[0]+' '+arr[1]);
	
	ctx.drawImage(gid(arr[2]),arr[0],arr[1]); //strange offset.. fine
	
	
}


function drawsegments(ctx,trail, segments){
	
	for(var i=0; i<segments; i++){
		
		var idx = trail.length-i-1;
		//console.log(trail.length);
		
		
		ctx.fillStyle="#dedede";
		//console.log(trail);
		
		ctx.fillRect(trail[idx][0]-13,trail[idx][1]-13,26,26);
		
	}
}


//needs the x and y coord
//also needs direct
function drawsnakehead(ctx, x, y, d){
	
	var rotate = Math.PI/4;//default is 90deg
	
	switch(d){
		case 'D' : {rotate =  Math.PI/4 + Math.PI; break;}
		case 'R' : {rotate = -1*Math.PI/4 + Math.PI; break;}
		case 'U' : {rotate =Math.PI/4; break;}
		case 'L' : {rotate = -1*Math.PI/4; break;}
		
	}
	
	//origin needs to be re-aligned? fix later
	
	//draw the head (diamond)
	
	ctx.translate(x,y);
	ctx.rotate(rotate); //90 degrees
	ctx.translate(-1*x, -1*y);
	
	//x, y, width, height
	ctx.fillStyle = '#e5e5e5';
	ctx.fillRect(x-(snakeheadw/2), y-(snakeheadh/2), snakeheadw, snakeheadh);
	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	
	//draw tongue (red rect)
	ctx.translate(x,y);
	ctx.rotate(rotate-Math.PI/4); //90 degrees
	ctx.translate(-1*x, -1*y);
	
	ctx.fillStyle="#cc0000";
	ctx.fillRect(x-2, y-31, 4,14); //tongue width is small, also rotated about the center of the head
	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	
	//draw eyes (blue dots)
	ctx.translate(x,y);
	ctx.rotate(rotate-Math.PI/4); //90 degrees
	ctx.translate(-1*x, -1*y);
	
	
	ctx.fillStyle="#5070F6";
	ctx.beginPath(); //first eye
	ctx.arc(x-9,y-10,6,0,2*Math.PI);
	ctx.fill();
	
	ctx.beginPath(); //second eye
	ctx.arc(x+9,y-10,6,0,2*Math.PI);
	ctx.fill();
	//console.log("the object origin is x:"+x+" and y:"+y);
	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}

	

	
	
resetGame();



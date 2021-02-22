function statek(s,l){
	//koordynaty i wymiary
	this.h = 50;
	this.w = 100;
	this.x = canvas.width/2;
	this.y = canvas.height-this.h;
	//prędkość w px/tick
	this.v = 4;
	//licznik punktów jakbym chciał robić multi
	this.score = s || 0;
	//licznik pooberwaniowy
	this.hit = 0;
	//ilość żyć
	this.l = l || 3;
	//ilość jednoczesnych pocisków na ekranie
	this.sAmount = 1;
	//ilość pocisków gracza na ekranie
	this.b = 0;
	//minimalna ilość gameticków pomiędzy strzałami
	this.sDelay = 10;
	//licznik opóźnienia między strzałami
	this.t = 0;
	//przełączniki od poruszania i strzelania
	this.mvL = false;
	this.mvR = false;
	this.fire = false;
	
	//poruszanie się
	this.mv = function(){
		if(this.mvL){
			this.x = this.x - this.v;
			if(this.x < this.w/4){
				this.x = this.w/4;
			}
		}
		else if(this.mvR){
			this.x = this.x + this.v;
			if(this.x > canvas.width - this.w/4){
				this.x = canvas.width - this.w/4;
			}
		}
	}

	//pokazywanie obiektu
	this.show = function(){
		canrys.fillStyle = "#BEEEEF";
		canrys.fillRect(this.x-this.w/2,this.y,this.w,this.h);
	}

	//strzał
	this.shoot = function(){
		//sprawdza czy ilość pocisków mieści się w dozwolonej i czy już minął minimalny czas od ostatniego strzału
		if(this.b < this.sAmount && this.t > this.sDelay){
			//przełącznik od strzału
			if(this.fire){
				this.b++;
				//reset licznika od strzału
				this.t = 0;
				newBullet = new bullet(this.x,canvas.height-this.h*1.5,false);
				bullets.push(newBullet);
			}
		}
		else{
			this.t++
		}
	}

	//trafienie statku gracza
	this.kolizja = function(bulColl){
		if(
			bulColl.x - bulColl.w/2 < this.x + this.w/2 &&
			bulColl.x + bulColl.w/2 > this.x - this.w/2
		){
			this.l--;
			return true;
		}
		else{
			return false;
		}
	}
}

function bullet(x,y,e){
	//koordynaty startowe pocisku
	this.x = x;
	this.y = y;
	this.w = 5;
	this.h = 15;
	
	//prędkość
	this.v = -5;
	
	//wkaźnik czy pocisk jest gracza czy nie
	this.evil = e;
	
	//kierunek na podstawie przynależności
	if(this.evil){
		this.v = -this.v;
	}
	
	//pokazywanie, kolor na postawie przynależności
	this.show = function(){
		if(this.evil){
			canrys.fillStyle = "#F00";
		}
		else{
			canrys.fillStyle = "#FFF";
		}
		canrys.fillRect(this.x-this.w/2,this.y,this.w,this.h);
	}
	
	//poruszanie
	this.mv = function(){
		this.y += this.v;
	}
}

function enemies(){
	//ilość kolumn przeciwników
	this.col = 11;
	//ilość rzędów
	this.row = 5;
	//licznik decydujący o ukończeniu rundy
	this.enemyCount = this.col * this.row;
	//odstęp po bokach i z góry, górny wynosi połowę wartości
	this.spacer = 100;
	//licznik potrzebny do poruszania skokami
	this.t = 0;
	//odległość na skok
	this.v = 20;
	//odstęp pomiędzy skokami
	this.vDelay = 10;
	//tablica trzymająca przeciwników, jest opróżniana z czasem
	this.legion = [];
	for(var i = 0; i < this.row;i++){
		this.legion[i] = [];
	}
	
	//generowanie nowego zestawu przeciwników
	this.newLegion = function(){
		var points = 0;
		for(var i = 0; i < this.row; i++){
			//wartość punktowa na podstawie rzędu
			if(i == 0){
				points = 30;
			}
			else if(i < 3){
				points = 20;
			}
			else{
				points = 10;
			}
			for(var j = 0; j < this.col; j++){
				this.legion[i][j] = new enemy(
					this.spacer + (canvas.width)/this.col/2 + j*(canvas.width-this.spacer*2)/this.col,
					this.spacer/2 + (i-1+runda) * (canvas.height/2 - this.spacer)/this.row,
					points
				);
			}
		}
	}
	
	this.shoot = function(){
		//szansa na strzal invadera
		if(Math.random() < 0.01){
			var i = Math.floor(Math.random()*this.legion.length);
			var j = Math.floor(Math.random()*this.legion[i].length);
			newBullet = new bullet(this.legion[i][j].x,this.legion[i][j].y,true);
			bullets.push(newBullet);
		}
	}
	
	//detekcja uderzenia w przeciwnika
	this.kolizja = function(bulColl,x,y){
		if(
			bulColl.x - bulColl.w/2 < this.legion[x][y].x + this.legion[x][y].w/2 &&
			bulColl.x + bulColl.w/2 > this.legion[x][y].x - this.legion[x][y].w/2 &&
			bulColl.y + bulColl.h < this.legion[x][y].y + this.legion[x][y].h &&
			bulColl.y + bulColl.h > this.legion[x][y].y
		){
			this.enemyCount--;
			return true;
		}
		else{
			return false;
		}
	}
	
	//poruszanie przeciwnikami
	this.mv = function(){
		this.t++;
		//decyzja czy już moźe się poruszyć
		if(this.t >= this.enemyCount/4 * this.vDelay){
			this.t = 0;
			//zmienna decydująca o zeskoczeniu w dół
			var down = false;
			//decyzja czy następuje skok w dół czy nie
			for(var i = 0; i < this.legion.length && !down; i++){
				//sprawdza krańcowych przeciwników dla każdego rzędu
				if(
					this.legion[i][0].x + this.v < 0 + this.spacer/2 ||
					this.legion[i][this.legion[i].length - 1].x + this.v > canvas.width - this.spacer/2
				){
						this.v = -this.v;
						//blokuje poruszanie w dół jeśli jest 1/4 wysokości od dolnej krawędzi
						if(this.legion[this.legion.length-1][0].y < canvas.height * 0.75){
							down = true;
						}
				}
			}
			//właściwe poruszenie
			for(var i = 0; i < this.legion.length; i++){
				for(var j = 0; j < this.legion[i].length; j++){
					this.legion[i][j].x += this.v
					if(down){
						this.legion[i][j].y += this.spacer/4;
					}
					
				}
			}
		}
	}

}

function enemy(x,y,p){
	this.w = 40;
	this.h = 20;
	this.x = x;
	this.y = y;
	this.points = p;
	this.show = function(){
		canrys.fillStyle = "#000";
		canrys.fillRect(this.x - this.w/2,this.y,this.w,this.h);
	}
}

function setup(scr,l){
	klawisze = {};
	score = scr || 0;
	canrys.fillStyle = "#A5A5A5";
	canrys.fillRect(0,0,canvas.width,canvas.height);
	bullets = new Array();
	Statek = new statek(scr,l);
	Legion = new enemies();
	document.getElementById("punkto").innerHTML = "SCORE: "+score;
	document.getElementById("hipunkto").innerHTML = "HI-SCORE: "+hiscore;
	document.getElementById("lajfo").innerHTML = "LIVES: "+Statek.l;
	Legion.newLegion();
	Statek.show();
	for(var i = 0; i < Legion.legion.length; i++){
		for(var j = 0; j < Legion.legion[i].length; j++){
			Legion.legion[i][j].show(i);
		}
	}
	
	if(scr === 0){
		canrys.font="40px Georgia";
		canrys.textAlign = 'center';
		canrys.fillStyle = "#F00";
		canrys.fillText("Game over",canvas.width/2,canvas.height/2);
	}
	
	if(scr != 0){
		canrys.font="40px Georgia";
		canrys.textAlign = 'center';
		canrys.fillStyle = "#FFF";
		canrys.fillText("Runda: "+runda,canvas.width/2,canvas.height/2);
	}
	
	canrys.font="20px Georgia";
	canrys.textAlign = 'center';
	canrys.fillStyle = "#BEEEEF";
	canrys.fillText("Wciśnij R by rozpocząć",canvas.width/2,canvas.height/2 + 30);
}

function gameLoop(){
	canrys.clearRect(0,0,canvas.width,canvas.height);
	canrys.fillStyle = "#A5A5A5";
	canrys.fillRect(0,0,canvas.width,canvas.height);
	document.getElementById("punkto").innerHTML = "SCORE: "+score;
	document.getElementById("hipunkto").innerHTML = "HI-SCORE: "+hiscore;
	document.getElementById("lajfo").innerHTML = "LIVES: "+Statek.l;
	if(!Statek.hit){
		Statek.shoot();
		Legion.shoot();
		Statek.mv();
		Legion.mv();
	}
	//pokazanie przeciwników
	for(var i = 0; i < Legion.legion.length; i++){
		for(var j = 0; j < Legion.legion[i].length; j++){
			Legion.legion[i][j].show();
		}
	}
	//poruszanie i pokazanie pocisków
	for(var i = bullets.length-1; i >= 0 ; i--){
		if(!Statek.hit){
			bullets[i].mv();
			//kolizje pocisków
			if(bullets[i].y < 0 || bullets[i].y > canvas.height){
				if(!bullets[i].evil){
					Statek.b--;
				}
				bullets.splice(i,1);
				continue;
			}
			//uderzenie w statek
			if(bullets[i].evil && bullets[i].y + bullets[i].h > Statek.y){
				if(Statek.kolizja(bullets[i])){
					bullets.splice(i,1);
					Statek.hit = 300;
					continue;
				}
			}
			
			if(Legion.enemyCount <= 0){
				continue;
			}
			
			//uderzenie w przeciwnika
			if(!bullets[i].evil && bullets[i].y < Legion.legion[Legion.legion.length-1][0].y){
				var hit = false;
				var x = Legion.legion.length - 1;
				for(x; x >= 0 && !hit; x--){
					var y = Legion.legion[x].length - 1;
					for(y; y >= 0 && !hit; y--){
						if(Legion.kolizja(bullets[i],x,y)){
							score += Legion.legion[x][y].points;
							Statek.b--;
							bullets.splice(i,1);
							Legion.legion[x].splice(y,1);
							if(Legion.legion[x].length == 0){
								Legion.legion.splice(x,1);
							}
							hit = true;
						}
					}
				}
				if(hit){
					continue;
				}
			}
		}
		bullets[i].show();
	}
	Statek.show();
	if(Statek.hit){
		Statek.hit--;
		if(Statek.hit > 200){
			canrys.font="40px Georgia";
			canrys.textAlign = 'center';
			canrys.fillstyle="#FFFFFF";
			canrys.fillText("3",canvas.width/2,canvas.height/2);
		}
		else if(Statek.hit > 100){
			canrys.font="40px Georgia";
			canrys.textAlign = 'center';
			canrys.fillstyle="#FFFFFF";
			canrys.fillText("2",canvas.width/2,canvas.height/2);
		}
		else{
			canrys.font="40px Georgia";
			canrys.textAlign = 'center';
			canrys.fillstyle="#FFFFFF";
			canrys.fillText("1",canvas.width/2,canvas.height/2);
		}
	}
	
	//zatrzymanie po śmierci
	if(Statek.l==0){
		if(score > hiscore)
		{
			hiscore = score;
		}
		clearInterval(petla);
		runda = 1;
		setup(0);
	}
	if(Legion.enemyCount<=0){
		if(score > hiscore)
		{
			hiscore = score;
		}
		clearInterval(petla);
		runda++;
		setup(score,Statek.l);
	}
}

//kilka globalnych zmiennych
var runda = 1;
var petla;
var score = 0;
var hiscore = 0;

//obsługa klawiszy
var klawisze = {};
onkeydown = onkeyup = function(e){
	e = e || event;
	klawisze[e.key] = e.type == 'keydown';
	console.log(klawisze);
	if(klawisze["ArrowLeft"]){
		Statek.mvL = true;
	}
	else{
		Statek.mvL = false;
	}
	if(klawisze["ArrowRight"]){
		Statek.mvR = true;
	}
	else{
		Statek.mvR = false;
	}
	if(klawisze["ArrowUp"]){
		Statek.fire = true;
	}
	else{
		Statek.fire = false;
	}
	if(klawisze["r"]){
		clearInterval(petla);
		petla = setInterval(gameLoop,10);
	}
	if(klawisze[" "]){
		clearInterval(petla);
		runda = 1;
		setup();
	}
}

//dodanie canvasa do strony
var canvas = document.createElement("canvas");
canvas.width = 1000;
canvas.height = 600;
document.body.appendChild(canvas);
var canrys = canvas.getContext("2d");
setup();
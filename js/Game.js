(function() {
	var Game = window.Game = function() {
		this.winWidth = document.documentElement.clientWidth > 640 ? 640 : document.documentElement.clientWidth;
		this.winHeight = document.documentElement.clientHeight;

		this.myCanvas = document.getElementById('myCanvas');
		myCanvas.width = this.winWidth;
		myCanvas.height = this.winHeight;
		this.ctx = this.myCanvas.getContext("2d");

		this.GameStatus = 'A';

		this.frameNumber = 0;
		this.fps = 0;
		this._fps = 0;
		this._teamstep = 0;

		this.timer = null;
		this.stop = false;

		this.level = 0;
		this.score = 0;
		this.lines = 0;
		this.leveNum = 70;
		this.leveNumArr = [70,55,40,30,20,15,10,8,6,4,2];

		this.timeType = 'go_on';

		this.readyStart();
	}

	Game.prototype = {
		id: function(id) {
			return document.getElementById(id)
		},
		readyStart: function() {
			this.imgArr = [];
			this.numberArr = ['images/0.png', 'images/1.png', 'images/2.png', 'images/3.png', 'images/4.png', 'images/5.png', 'images/6.png', 'images/7.png', 'images/8.png', 'images/9.png'];
			this.otherImgArr = ['btn-bg.png', 'e_block-bg.jpg', 'ico-reset.png','text-addSocre.png','text-fenshu.png','text-fybang.png','text-gameover.png','text-goback.png','text-mingci.png','text-redaygo.png','text-time.png'];
			this.blockImg = new Image();
			this.blockImg.src = 'images/block.png';

			this.imgArr.push(this.blockImg);

			var count = 0;
			var self = this;

			for (var i = 0; i < this.numberArr.length; i++) {
				this['num' + i] = new Image();
				this['num' + i].src = this.numberArr[i]
				this.imgArr.push(this['num' + i]);
			};

			for (var i = 0; i < this.otherImgArr.length; i++) {
				var a = new Image();
				a.src = 'images/' + this.otherImgArr[i];
				this.imgArr.push(a);
			};

			for (var i = 0; i < this.imgArr.length; i++) {
				this.imgArr[i].onload = function() {
					count++;
					self.id('progress').innerHTML = parseInt(((count / self.imgArr.length) * 100)) + '%';
					if (count == self.imgArr.length) {
						self.hide('progress');
						self.show('startBtn');
						self.start();
					}
				}
			};
		},
		init: function() {
			this.BlockUnit = new BlockUnit(0, 3);
			this.Map = new Map();
			this.bindEvent();
			this.SVGmusic();
		},
		start: function() {
			this.init();
			this.mainloop();
		},
		mainloop: function() {
			this.ctx.clearRect(0, 0, this.winWidth, this.winHeight);

			this.fpsFun();
			this.showNumber();
			this.BlockUnit.render();
			this.Map.render();
			this.timeOut(this.timeType);

			if (this.GameStatus == 'B') {
				if (this.frameNumber % this.leveNum == 0) this.DealEvent().downEvent();
			}
			this.drawSmallMap(this.BlockUnit.shape, this.BlockUnit.directionAmount);


			var self = this;
			this.timer = window.requestAnimationFrame(function() {
				self.mainloop();
			});

			if (!this.BlockUnit.canMove(0, 3)) {
				this.showGameOver();
				this.stop = true;
				this.GameStatus = 'C';
			}


			if (this.stop) window.cancelAnimationFrame(this.timer);
		},
		music: function (playOrPause) {
			// this.id('audio').load();
			if(playOrPause == "pause"){
				this.id('audio').pause();
				this.SVGmusic().pause();
				
			} else {
				this.id('audio').play();
				this.SVGmusic().play();
			}

		},
		SVGmusic: function () {
			var musicBtn = this.id('musicBtn');
			var dur = ['4.3s', '2s', '1.4s', '2s']
			var animateArr = musicBtn.getElementsByTagName('animate')
			
			musicBtn.width.baseVal.valueInSpecifiedUnits = _rate * 0.8;
			musicBtn.height.baseVal.valueInSpecifiedUnits = _rate * 1.6;

			return {
				play: function () {
					for (var i = 0; i < animateArr.length; i++) {
						animateArr[i].setAttribute('begin', '0s')
						animateArr[i].setAttribute('dur', dur[i])
					};
				},
				pause: function () {
					for (var i = 0; i < animateArr.length; i++) {
						animateArr[i].setAttribute('dur', 0)
					};
				}
			}

		},
		fpsFun: function() {
			this.frameNumber++;
			this.ctx.fillStyle = '#fff';
			// this.ctx.fillText(this.frameNumber, 20, 20);

			if (Date.parse(new Date()) == this._teamstep) {
				this._fps++;
			} else {
				this.fps = this._fps;
				this._fps = 0;
				this._teamstep = Date.parse(new Date());
			}

			if (this.frameNumber < 60) this.fps = 60;

			// this.ctx.fillText(this.fps, 20, 40);
		},
		DealEvent: function(type) {
			var self = this;

			var events = {
				leftEvent: function() {
					var cc = self.BlockUnit.col - 1
					if (self.BlockUnit.canMove(self.BlockUnit.row, cc)) {
						self.BlockUnit.moveTo(self.BlockUnit.row, --self.BlockUnit.col);
					}
				},
				rightEvent: function() {
					var cc = self.BlockUnit.col + 1
					if (self.BlockUnit.canMove(self.BlockUnit.row, cc)) {
						self.BlockUnit.moveTo(self.BlockUnit.row, ++self.BlockUnit.col);
					}
				},
				upEvent: function() {
					self.BlockUnit.changeDirection()
				},
				downEvent: function() {
					var rr = self.BlockUnit.row + 1;
					var YorN = self.BlockUnit.canMove(rr, self.BlockUnit.col);
					if (!YorN) {
						self.Map.blocksArray = self.Map.blocksArray.concat(self.BlockUnit.blockArr);

						for (var r = 0; r < 4; r++) {
							var theMapCode = self.Map.code[self.BlockUnit.row + r];
							var theBlockUnit = (self.BlockUnit.shapeCode >> (4 * (3 - r))) & 0xf;

							self.Map.code[self.BlockUnit.row + r] = theMapCode | (theBlockUnit << (10 - self.BlockUnit.col));
						}

						self.BlockUnit = new BlockUnit(0, 3);

						self.Map.check(function() {
							self.addPoint();
						});
					} else {
						self.BlockUnit.row++;
						self.BlockUnit.moveTo(rr, self.BlockUnit.col);
					}

					return YorN;
				},
			}


			return events;
		},
		bindEvent: function() {

			var self = this;
			document.onkeydown = function(e) {

				switch (e.keyCode) {
					case 37:
						self.DealEvent().leftEvent();
						break;
					case 38:
						self.DealEvent().upEvent();
						break;
					case 39:
						self.DealEvent().rightEvent();
						break;
					case 40:
						while (self.DealEvent().downEvent()) {};
						break;
				}
			}

			var startx, starty, lock = true,
				isMove = false;

			this.myCanvas.addEventListener('touchstart', function(event) {
				event.preventDefault();
				startx = event.touches[0].clientX;
				starty = event.touches[0].clientY;
				lock = true;
			}, false);

			this.myCanvas.addEventListener('touchmove', function(event) {

				event.preventDefault();

				var movex = event.touches[0].clientX - startx;
				var movey = event.touches[0].clientY - starty;

				if (movex < -20) {
					startx = event.touches[0].clientX;
					self.DealEvent().leftEvent();
					isMove = true;
				} else if (movex > 20) {
					startx = event.touches[0].clientX;
					self.DealEvent().rightEvent();
					isMove = true;
				} else if (movey > 50 && lock) {
					while (self.DealEvent().downEvent()) {};
					isMove = true;
					lock = false;
				}

			}, false);

			this.myCanvas.addEventListener('touchend', function(event) {
				event.preventDefault();
				if (isMove) {
					isMove = false;
				} else {

					if (startx > _rate * 1.15 && startx < _rate * 2.7 && starty > _rate * 2.7 && starty < _rate * 3.86) {
						if (self.timeType == 'time_out') {
							self.timeType = 'go_on';
							self.music();
							self.timeOut(self.timeType);
						} else {
							self.music('pause');
							self.timeType = 'time_out';
						}
					} else if (startx > _rate * 3.86 && startx < _rate * 15.45 && starty > _rate * 2.32 && starty < _rate * 23.2) {
						self.BlockUnit.changeDirection();
					}
				}
			}, false);

			//音乐暂停
			this.musicLock = true;
			this.id('musicBtn').addEventListener('click', function(event) {
				if(self.musicLock){
					self.music('pause');
					self.musicLock = false;
				} else {
					self.music();
					self.musicLock = true;
				}
			}, false)

			//A场景的事件
			this.id('startBtn').addEventListener('click', function() {
				self.hide('Contanier');
				self.hide('redayGoBox');
				self.music();
				// setTimeout(function(){
					self.GameStatus = 'B';
				// }, 800);
			}, false);

			//C场景的事件
			this.id('resetBtn').addEventListener('click', function() {
				self.hide('Contanier');
				self.hide('gameOver');
				self.clearData();
				// setTimeout(function(){
					self.GameStatus = 'B';
					self.stop = false;
					self.mainloop();
				// }, 800);
			}, false);

			this.id('addScore').addEventListener('click', function() {
				var gotScore = self.id('gotScore');
				gotScore.style.fontSize = '.8rem';
				gotScore.innerHTML = '正在提交...';
				self.ajaxGet('php/insert.php',{score: self.score},function (err,res) {
					res = eval('(' + res + ')');
					if(res.result == 'ok'){
						gotScore.innerHTML = '提交成功~!';
						self.hide('gameOver');
						self.showRankingList();
					} else {
						gotScore.className += ' error';
						gotScore.innerHTML = '服务器错误~！请稍后...'
					}
				})
			}, false);

			this.id('goseeBtn').addEventListener('click', function() {
				self.hide('gameOver');
				self.showRankingList();
			}, false);

			this.id('gobackBtn').addEventListener('click', function() {
				self.hide('Contanier');
				self.hide('rankingList');
				self.clearData();
				// setTimeout(function(){
					self.GameStatus = 'B';
					self.stop = false;
					self.mainloop();
				// }, 800);
			}, false);

		},
		clearData: function () {
			this.frameNumber = 0;
			this.score = 0;
			this.level = 0;
			this.lines = 0;
			this.Map.blocksArray = [];
			this.Map.code = [
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xc00f,
				0xffff,
				0xffff,
				0xffff,
				0xffff
			];
			this.BlockUnit = new BlockUnit(0, 3);	
		},
		addPoint: function() {
			if (!this.Map.full) return;
			switch (this.Map.full.length) {
				case 1:
					this.score += 10;
					break;
				case 2:
					this.score += 30;
					break;
				case 3:
					this.score += 50;
					break;
				case 4:
					this.score += 100;
					break;
			}

			this.level = this.score > 100 * (this.level + 1) ? this.level + 1 : this.level;
			this.level = this.level > 10 ? 10 : this.level;
			this.leveNum = this.leveNumArr[this.level];
			this.lines += this.Map.full.length;
		},
		showNumber: function() {

			this.drawNumber(this.level, 0);
			this.drawNumber(this.score, 1);
			this.drawNumber(this.lines, 2);
		},
		drawNumber: function(number, y) {
			var typeX = [
				_rate * 1.6,
				_rate * 1.3,
				_rate * 1.1,
				_rate * 0.9
			]

			var typeY = [
				_rate * 14.8,
				_rate * 14.8 * 1.24,
				_rate * 14.8 * 1.475
			]

			var targety = typeY[y];

			var targetx = _rate * 1.6;

			for (var i = 0; i < number.toString().length; i++) {

				var targetx = typeX[number.toString().length - 1] + _rate * (i / 2);
				var num = this['num' + number.toString().charAt(i)];

				this.ctx.drawImage(num, 0, 0, num.width, num.height, targetx, targety, _rate / 2, (num.height * _rate) / (2 * num.width))
			}
		},
		drawSmallMap: function(shape, directionAmount) {
			if (directionAmount > 3) directionAmount = 3;

			var typeShape = [
				function() {
					var x = -4.8;
					y = 5.7,
						i = 0,
						size = _rate / 1.2;
					new BlockUnit(y, x, shape, i, size).render();
				},

				function() {
					var x = -5.5;
					y = 6,
						size = _rate / 1.5;
					for (var i = 0; i < directionAmount; i++) {
						new BlockUnit(y + i * (_rate / 5.5), x, shape, i, size).render();
					};
				},

				function() {
					var x = -6;
					y = 8,
						size = _rate / 2;
					for (var i = 0; i < directionAmount; i++) {
						new BlockUnit(y + i * (_rate / 6.5), x, shape, i, size).render();
					};
				}

			]

			typeShape[directionAmount - 1]();

		},
		timeOut: function(type) {
			var typeObj = {
				go_on: function() {
					this.ctx.rect(_rate * 1.75, _rate * 3.35, _rate / 5, _rate / 1.6);
					this.ctx.rect(_rate * 2.05, _rate * 3.35, _rate / 5, _rate / 1.6);
				},
				time_out: function() {
					this.ctx.moveTo(_rate * 1.8, _rate * 3.35);
					this.ctx.lineTo(_rate * 2.05 + _rate / 5, _rate * 3.35 + _rate / 3.2);
					this.ctx.lineTo(_rate * 1.8, _rate * 3.35 + _rate / 1.6);
				}
			}

			this.ctx.beginPath();
			typeObj[type].call(this);
			this.ctx.closePath();
			this.ctx.fill();

			if (type == 'time_out') {
				this.stop = true;
			} else {
				if (this.stop) {
					this.stop = false;
					this.mainloop();
				}
			}
		},
		showGameOver: function () {
			this.show('Contanier').show('gameOver');
			this.id('gotScore').style.fontSize = '2rem';
			this.id('gotScore').className = 'gotScore';
			this.id('gotScore').innerHTML = this.score;
		},
		showRankingList:function () {
			this.show('rankingList');
			var self = this;
			this.ajaxGet('php/index.php',{},function (err,res) {
				res = eval('(' + res + ')');
				var dataArr = [];
				for (var i = 0; i < res.res.length; i++) {
					var a = eval('(' + res.res[i] + ')');
					a.index = i + 1;
					dataArr.push(a);
				}

				var tpl = '<li><span><%=index%></span><span><%=score%></span><span><%=time%></span></li>';

				var html = '';
				var template = _.template(tpl);
				for (var i = 0; i < dataArr.length; i++) {
					html += template(dataArr[i]);
				}
				self.id('rankingListBox').innerHTML = html;
			})
		},
		show: function(id) {
			this.id(id).style.display = 'block';
			return this;
		},
		hide: function(id) {
			this.id(id).style.display = 'none';
			return this;
		},
		ajaxGet: function(URL,queryJSON,callback){
			//创建xhr对象，解决兼容问题
			if(window.XMLHttpRequest){
				var xhr = new XMLHttpRequest();
			}else{
				var xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
			//结果返回之后做的事情
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4){
					if(xhr.status >= 200 && xhr.status < 300 || xhr.status == 304){
						callback(null,xhr.responseText);
					}else{
						callback(new Error("没有找到请求的文件"),undefined);
					}
				}
			}
			//拼接字符串
			var querystring = _queryjson2querystring(queryJSON);
			//配置
			xhr.open("get" , URL + "?" + querystring , true);
			//发送
			xhr.send(null);


			function _queryjson2querystring(json){
				var arr = [];	//结果数组
				for(var k in json){
					arr.push(k + "=" + encodeURIComponent(json[k]));
				}
				return arr.join("&");
			};
		}




	}

})()
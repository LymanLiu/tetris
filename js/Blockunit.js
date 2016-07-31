(function () {
	var BlockUnit = window.BlockUnit = function (row, col, shape, direction, size) {
		this.row = row;
		this.col = col;
		this.size = size || 0;
		this.shape = shape != undefined ? shape : _.random(0, shapeCodes.length - 1);
		this.shapeCodeArr = shapeCodes[this.shape];
		this.directionAmount = this.shapeCodeArr.length;
		this.direction = direction != undefined ? direction : _.random(0, this.directionAmount - 1);
		this.shapeCode = this.shapeCodeArr[this.direction];
		this.blockArr = [];

		for(var i = 0; i < 4; i++){
            for(var j = 0; j < 4; j++){
                var char = (this.shapeCode >> (3 - i) * 4 & 0xf) >> (3 - j) & 0x1;
                if(char){
                    var b = new Block(this.row + i, this.col + j, this.size);
                    b.i = i;
                    b.j = j;
                    this.blockArr.push(b);
                }
            }
        }
	}

	BlockUnit.prototype = {
		render: function  () {
			_.each(this.blockArr, function(block) {
				block.render();
			});
		},
		moveTo: function (row , col) {
			this.row = row;
			this.col = col;

			_.each(this.blockArr, function(block) {
				block.row = row + block.i;
				block.col = col + block.j;
			});

		},
		canMove: function (row , col) {
			if(col < -1 || col > 8) return false;

			var mapcode = g.Map.code;
			for(var i = 0 ; i < 4 ; i++){
				var r = mapcode[row + i];
				var mapchar = r >> (10 - col) & 0xf;
				var thischar = this.shapeCode >> (3 - i) * 4 & 0xf;
				if((mapchar & thischar) != 0) return false;
			}
			return true;
		},
		changeDirection: function () {
			var direction = this.direction + 1;
			if(direction > this.directionAmount - 1) direction = 0;

			var tempshapecode = shapeCodes[this.shape][direction];
			var mapcode = g.Map.code;
			for(var i = 0 ; i < 4 ; i++){
				var r = mapcode[this.row + i];
				var mapchar = r >> (10 - this.col) & 0xf;
				var thischar = tempshapecode >> (3 - i) * 4 & 0xf;
				if((mapchar & thischar) != 0) return false;
			}

			g.BlockUnit = new BlockUnit(this.row, this.col, this.shape, direction);
		}

	}

	var shapeCodes = [
        [0x0660],
        [0x4460,0x0e80,0xc440,0x2e00],
        [0x44c0,0x8e00,0x6440,0x0e20],
        [0xc600,0x2640],
        [0x4620,0x6c00],
        [0xe400,0x4c40,0x4e00,0x4640],
        [0x4444,0x0f00]
    ]
})()
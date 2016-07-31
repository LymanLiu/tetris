(function () {
	var Block = window.Block = function (row,col,size) {
		this.row = row || 0;
		this.col = col || 0;
		this.blockImg = g.blockImg;
		this.w = size || _rate * 1.05;
		this.h = size || _rate * 1.05;
		
	}
	Block.prototype.render = function () {
		this.x = this.w * this.col + _rate * 4.54;
		this.y = this.w * this.row +  _rate * 2.43;
		
		g.ctx.drawImage(this.blockImg, 0, 0, this.blockImg.width, this.blockImg.height, this.x, this.y , this.w, this.h);
	}
})()
(function () {
	var Map = window.Map = function () {
		this.code = [
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
		

		this.blocksArray = [];

	}

	Map.prototype = {
		render: function () {
			_.each(this.blocksArray, function(block) {
				block.render();
			});
		},
		check: function (success) {
			this.full = [];

			for (var i = 0; i <= 19; i++) {
				if(this.code[i] == 0xffff) this.full.push(i)
			}

			var self = this;

			for (var i = 0; i < this.full.length; i++) {
				this.code.splice(this.full[i],1);
				this.code.unshift(0xc00f);
				_.each(this.blocksArray , function(block) {
					if(block.row == self.full[i]){
						self.blocksArray =  _.without(self.blocksArray , block);
					} else if ( block.row < self.full[i]){
						block.row ++;
					}
				});
			};

			success && success.call(g);
		}
	}

})()
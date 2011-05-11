describe("Game", function(){

  var game = new Game();

  it("should set a default speed", function(){
    expect(game.get("speed") == 200);
  });

  it("should set a default size", function(){
    expect(game.get("size") == 50);
  });

  it("should start at 0 generations", function(){
    expect(game.get("gen") == 0);
  });

  it("should have a Board", function(){
    expect(game.board).toBeDefined();
  });

  it("should have some controls", function(){
    expect(game.controls).toBeDefined();
  });

  it("should have a counter", function(){
    expect(game.counter).toBeDefined();
  });

  it("should know how to step generations", function(){
    spyOn(game.board, 'step');
    game.step();
    expect(game.board.step).wasCalled();
  });

  it("should know how to count generations", function(){
    game.step();
    expect(game.get('gen') == 1);
    game.step();
    expect(game.get('gen') == 2);
  });

  it("should know how to randomize the board", function(){
    spyOn(game.board, 'random');
    game.random();
    expect(game.board.random).wasCalled();
  });

  describe("starting a game", function(){
    it("should set this.int", function(){
      expect(game.int).not.toBeDefined();
      game.start();
      expect(game.int).toBeDefined();
    });
  });

  describe("stopping a game", function(){
    it("should clear this.int", function(){
      game.start();
      expect(game.int).toBeDefined();
      game.stop();
      expect(game.int).not.toBeDefined();
    });
  });

  describe("clearing the board", function(){
    it("should actually clear the board", function(){
      spyOn(game.board, 'clear');
      game.clear();
      expect(game.board.clear).wasCalled();
    });

    it("should stop the game", function(){
      spyOn(game, 'stop');
      game.clear();
      expect(game.stop).wasCalled();
    });

    it("should reset the generation count", function(){
      game.set({gen: 1})
      game.clear();
      expect(game.get('gen') == 0);
    });
  });

});


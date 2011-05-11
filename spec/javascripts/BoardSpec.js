describe("Board", function(){
  var game = new Game();
  var board = game.board;

  it("should have a size", function(){
    expect(board.get("size")).toEqual(50)
  });

  it("should have Cells", function(){
    expect(board.cells).toBeDefined();
  });

  it("should have a view", function(){
    expect(board.view).toBeDefined();
  });

});

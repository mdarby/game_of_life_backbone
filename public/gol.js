var Board, BoardView, Cell, CellView, Cells, Game;
var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
  for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
  function ctor() { this.constructor = child; }
  ctor.prototype = parent.prototype;
  child.prototype = new ctor;
  child.__super__ = parent.prototype;
  return child;
};
Cells = (function() {
  function Cells() {
    Cells.__super__.constructor.apply(this, arguments);
  }
  __extends(Cells, Backbone.Collection);
  Cells.prototype.model = Cell;
  return Cells;
})();
Cell = (function() {
  function Cell() {
    Cell.__super__.constructor.apply(this, arguments);
  }
  __extends(Cell, Backbone.Model);
  Cell.prototype.initialize = function(options) {
    return this.set({
      x: options.x,
      y: options.y,
      id: options.x + "x" + options.y,
      alive: 0
    });
  };
  Cell.prototype.die = function() {
    return this.set({
      alive: 0
    });
  };
  Cell.prototype.live = function() {
    return this.set({
      alive: 1
    });
  };
  Cell.prototype.toggle = function() {
    if (this.get("alive") === 0) {
      return this.live();
    } else {
      return this.die();
    }
  };
  return Cell;
})();
CellView = (function() {
  function CellView() {
    CellView.__super__.constructor.apply(this, arguments);
  }
  __extends(CellView, Backbone.View);
  CellView.prototype.model = Cell;
  CellView.prototype.className = "cell";
  CellView.prototype.events = {
    "click": "toggle"
  };
  CellView.prototype.initialize = function() {
    this.model.bind("change:alive", this.changeState);
    return this.render();
  };
  CellView.prototype.render = function() {
    $('#board').append(this.el);
    return this;
  };
  CellView.prototype.birth = function() {
    return $(this.el).css('background', '#0AF');
  };
  CellView.prototype.death = function() {
    return $(this.el).css('background', '#DDD');
  };
  CellView.prototype.toggle = function() {
    return this.model.toggle();
  };
  CellView.prototype.changeState = function() {
    console.log(this);
    if (this.model.get("alive") === 1) {
      return this.birth();
    } else {
      return this.death();
    }
  };
  return CellView;
})();
Board = (function() {
  function Board() {
    Board.__super__.constructor.apply(this, arguments);
  }
  __extends(Board, Backbone.Model);
  Board.prototype.initialize = function(options) {
    var x, y, _ref, _ref2;
    this.size = options.size;
    this.cells = new Cells();
    for (x = 1, _ref = this.size; (1 <= _ref ? x <= _ref : x >= _ref); (1 <= _ref ? x += 1 : x -= 1)) {
      for (y = 1, _ref2 = this.size; (1 <= _ref2 ? y <= _ref2 : y >= _ref2); (1 <= _ref2 ? y += 1 : y -= 1)) {
        this.cells.add(new Cell({
          x: x,
          y: y,
          alive: 0
        }));
      }
    }
    return this.view = new BoardView({
      collection: this.cells
    });
  };
  Board.prototype.step = function() {
    var alive, cell, id, nextState, x, y, _ref, _ref2, _ref3, _results;
    this.nextGen = new Cells();
    for (x = 1, _ref = this.size; (1 <= _ref ? x <= _ref : x >= _ref); (1 <= _ref ? x += 1 : x -= 1)) {
      for (y = 1, _ref2 = this.size; (1 <= _ref2 ? y <= _ref2 : y >= _ref2); (1 <= _ref2 ? y += 1 : y -= 1)) {
        id = x + "x" + y;
        cell = this.cells.get(id);
        alive = this.check(cell);
        this.nextGen.add(new Cell({
          x: x,
          y: y,
          alive: alive
        }));
      }
    }
    _results = [];
    for (x = 1, _ref3 = this.size; (1 <= _ref3 ? x <= _ref3 : x >= _ref3); (1 <= _ref3 ? x += 1 : x -= 1)) {
      _results.push((function() {
        var _ref, _results;
        _results = [];
        for (y = 1, _ref = this.size; (1 <= _ref ? y <= _ref : y >= _ref); (1 <= _ref ? y += 1 : y -= 1)) {
          id = x + "x" + y;
          cell = this.cells.get(id);
          nextState = this.nextGen.get(id);
          _results.push(nextState === 1 ? cell.live() : cell.die());
        }
        return _results;
      }).call(this));
    }
    return _results;
  };
  Board.prototype.check = function(cell) {
    var crowd;
    crowd = this.neighborhood(cell);
    if (cell.get("alive") === 1) {
      if (crowd <= 1) {
        return 0;
      }
      if (crowd >= 4) {
        return 0;
      }
    } else {
      if (crowd === 3) {
        return 1;
      }
    }
    return cell.alive;
  };
  Board.prototype.neighborhood = function(cell) {
    var c, count;
    c = this.coordinates(cell);
    count = 0;
    count += this.topLeft(c);
    count += this.top(c);
    count += this.topRight(c);
    count += this.left(c);
    count += this.right(c);
    count += this.bottomLeft(c);
    count += this.bottom(c);
    count += this.bottomRight(c);
    return count;
  };
  Board.prototype.topLeft = function(c) {
    return this.cellValue((c.x - 1) + "x" + (c.y - 1));
  };
  Board.prototype.top = function(c) {
    return this.cellValue((c.x - 1) + "x" + c.y);
  };
  Board.prototype.topRight = function(c) {
    return this.cellValue((c.x - 1) + "x" + (c.y + 1));
  };
  Board.prototype.left = function(c) {
    return this.cellValue(c.x + "x" + (c.y - 1));
  };
  Board.prototype.right = function(c) {
    return this.cellValue(c.x + "x" + (c.y + 1));
  };
  Board.prototype.bottomLeft = function(c) {
    return this.cellValue((c.x + 1) + "x" + (c.y - 1));
  };
  Board.prototype.bottom = function(c) {
    return this.cellValue((c.x + 1) + "x" + c.y);
  };
  Board.prototype.bottomRight = function(c) {
    return this.cellValue((c.x + 1) + "x" + (c.y + 1));
  };
  Board.prototype.cellValue = function(id) {
    var cell, num;
    num = 0;
    cell = this.cells.get(id);
    if (cell !== void 0) {
      if (cell.alive === 1) {
        num = 1;
      } else {
        num = 0;
      }
    }
    return num;
  };
  Board.prototype.coordinates = function(cell) {
    var bits;
    bits = cell.id.split('x');
    return {
      x: parseInt(bits[0]),
      y: parseInt(bits[1])
    };
  };
  return Board;
})();
BoardView = (function() {
  function BoardView() {
    BoardView.__super__.constructor.apply(this, arguments);
  }
  __extends(BoardView, Backbone.View);
  BoardView.prototype.el = $('#board');
  BoardView.prototype.collection = Cells;
  BoardView.prototype.initialize = function() {
    return this.render();
  };
  BoardView.prototype.render = function() {
    this.el.html('');
    this.collection.each(function(cell) {
      return new CellView({
        model: cell
      });
    });
    return this;
  };
  return BoardView;
})();
Game = (function() {
  function Game() {
    Game.__super__.constructor.apply(this, arguments);
  }
  __extends(Game, Backbone.Model);
  Game.prototype.initialize = function(options) {
    return this.board = new Board(options);
  };
  Game.prototype.run = function(count) {
    var x, _results;
    _results = [];
    for (x = 0; (0 <= count ? x <= count : x >= count); (0 <= count ? x += 1 : x -= 1)) {
      _results.push(this.step());
    }
    return _results;
  };
  Game.prototype.step = function() {
    return this.board.step();
  };
  return Game;
})();
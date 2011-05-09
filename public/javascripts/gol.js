var Board, BoardView, Cell, CellView, Cells, Controls, Game, GenerationCount;
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
      alive: options.alive
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
    "mouseover": "toggle"
  };
  CellView.prototype.initialize = function() {
    _.bindAll(this, "changeState");
    this.model.bind("change:alive", this.changeState);
    return this.render();
  };
  CellView.prototype.render = function() {
    $('#board').append(this.el);
    return this;
  };
  CellView.prototype.birth = function() {
    return $(this.el).css('background', 'crimson');
  };
  CellView.prototype.death = function() {
    return $(this.el).css('background', '#FFF');
  };
  CellView.prototype.toggle = function() {
    return this.model.toggle();
  };
  CellView.prototype.changeState = function() {
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
  Board.prototype.clear = function() {
    return this.cells.each(function(cell) {
      return cell.die();
    });
  };
  Board.prototype.random = function() {
    this.clear();
    return this.cells.each(function(cell) {
      var rand;
      rand = Math.floor(Math.random() * 10);
      if (rand % 3 === 0) {
        return cell.live();
      }
    });
  };
  Board.prototype.step = function() {
    var alive, cell, id, nextGen, state, x, y, _ref, _ref2, _ref3, _results;
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
          nextGen = this.nextGen.get(id);
          state = nextGen.get("alive");
          _results.push(state === 1 ? cell.live() : cell.die());
        }
        return _results;
      }).call(this));
    }
    return _results;
  };
  Board.prototype.check = function(cell) {
    var alive, crowd;
    crowd = this.neighborhood(cell);
    alive = cell.get("alive");
    if (alive === 1) {
      if (crowd <= 1) {
        alive = 0;
      }
      if (crowd >= 4) {
        alive = 0;
      }
    } else {
      if (crowd === 3) {
        alive = 1;
      }
    }
    return alive;
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
      if (cell.get("alive") === 1) {
        num = 1;
      } else {
        num = 0;
      }
    }
    return num;
  };
  Board.prototype.coordinates = function(cell) {
    return {
      x: cell.get("x"),
      y: cell.get("y")
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
    this.size = options.size;
    this.board = new Board({
      size: this.size
    });
    this.controls = new Controls({
      model: this,
      el: "body"
    });
    this.counter = new GenerationCount({
      model: this
    });
    return this.set({
      gen: 0
    });
  };
  Game.prototype.start = function() {
    if (this.int) {
      return;
    }
    return this.int = setInterval(function(_this) {
      return _this.step();
    }, 200, this);
  };
  Game.prototype.stop = function() {
    if (!this.int) {
      return;
    }
    clearInterval(this.int);
    return this.int = void 0;
  };
  Game.prototype.clear = function() {
    this.stop();
    this.board.clear();
    return this.set({
      gen: 0
    });
  };
  Game.prototype.random = function() {
    return this.board.random();
  };
  Game.prototype.step = function() {
    this.board.step();
    return this.incrementGen();
  };
  Game.prototype.incrementGen = function() {
    var g;
    g = this.get("gen");
    return this.set({
      gen: g + 1
    });
  };
  return Game;
})();
GenerationCount = (function() {
  function GenerationCount() {
    GenerationCount.__super__.constructor.apply(this, arguments);
  }
  __extends(GenerationCount, Backbone.View);
  GenerationCount.prototype.el = "#generations";
  GenerationCount.prototype.initialize = function() {
    _.bindAll(this, "updateCount");
    return this.model.bind("change:gen", this.updateCount);
  };
  GenerationCount.prototype.updateCount = function() {
    return $(this.el).html("Generation: " + (this.model.get("gen")));
  };
  return GenerationCount;
})();
Controls = (function() {
  function Controls() {
    Controls.__super__.constructor.apply(this, arguments);
  }
  __extends(Controls, Backbone.View);
  Controls.prototype.events = {
    "click #random": "random",
    "click #start": "start",
    "click #stop": "stop",
    "click #clear": "clear",
    "keyup": "step"
  };
  Controls.prototype.random = function() {
    return this.model.random();
  };
  Controls.prototype.start = function() {
    return this.model.start();
  };
  Controls.prototype.stop = function() {
    return this.model.stop();
  };
  Controls.prototype.clear = function() {
    return this.model.clear();
  };
  Controls.prototype.step = function(e) {
    if (e.keyCode === 32) {
      return this.model.step();
    }
  };
  return Controls;
})();
function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;

  /* For plot */
  this.moveCount  = 0;
  this.totalMoves = 0;
  this.plot       = new Chart(document.getElementById('chart-container'), createPlotDefinition());
  this.lineCount  = 0;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = AI_getBest(this.grid, true);
    this.actuator.showHint(best.move);
  }.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('Auto-Run');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('Stop');
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('Auto-Run');
  this.setup();

  // For plot
  this.plot.data.datasets.push(initialDataConfig());
  this.moveCount = 0;
  this.lineCount += 1;
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addInitialTiles();

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Update the actuator
  this.actuate();
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
      ++this.moveCount;
      this.plot.data.labels.push(this.moveCount);
      this.plot.data.datasets[this.lineCount].data.push(this.score);
      this.plot.update();
    }
  } else {
//    this.won = true;
  }

  if (!this.grid.movesAvailable()) {
    this.over = true;    // Game over!
  }

  this.actuate();
}

GameManager.prototype.run = function() {
  let rlAgent = new RL(this.grid);
  // this.move(rlAgent.getOptimalMove());
  this.move(rlAgent.greedy());
  let timeout = animationDelay;
  
  if (this.running && !this.over && !this.won) {
    let self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
}

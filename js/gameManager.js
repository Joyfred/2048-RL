/*

methods():
1. 
*/
class GameManager {
    static maxMoveCount = 0;
    static trialCount = 0;
    constructor (size, InputManager, Actuator) {
        this.size         = size; // Size of the grid
        this.inputManager = new InputManager;
        this.actuator     = new Actuator;
        this.running      = false;
        this.algorithm    = null;

        /* For plot */
        this.moveCount  = 0;
        this.totalMoves = 0;
        this.plot       = new Chart(document.getElementById('chart-container'), createPlotDefinition());
        this.lineCount  = 0;

        this.inputManager.on("move"   , this.move.bind(this));
        this.inputManager.on("restart", this.restart.bind(this));
        this.inputManager.on("run"    , this.manageRunOperation.bind(this));

        this.setup();
    };

    actuate = () => {
        this.actuator.actuate(this.grid, {
            score: this.score,
            over : this.over,
            won  : this.won
        });
    };

    setup = () => {
        this.grid  = new Grid(this.size);
        this.score = 0;
        this.over  = false;
        this.won   = false;

        this.grid.addInitialTiles();
        this.setPlotTooltip(true);
        this.actuate();
    };

    updatePlot = () => {
        ++this.moveCount;

        if (this.moveCount > GameManager.maxMoveCount) {
            GameManager.maxMoveCount = this.moveCount;
            this.plot.data.labels.push(this.moveCount);
        }

        this.plot.data.datasets[this.lineCount].data.push(this.score);
        this.plot.update();
    };

    move = direction => {
        const result  = this.grid.move(direction);
        this.score   += result.score;

        if (result.moved) {
            this.grid.computerMove();
            this.updatePlot();
        }

        if (!this.grid.movesAvailable()) {
            this.over = true;
            this.setPlotTooltip(true);
        }

        this.actuate();
    };

    resetPlotConfig = () => {
        this.moveCount   = 0;
        this.lineCount  += 1;
        this.plot.data.datasets.push(getInitialPlotData(GameManager.trialCount));
        this.plot.update();
    };

    restart = () => {
        this.running            = false;
        GameManager.trialCount += 1;
        this.actuator.restart();
        this.actuator.setRunButton('Auto-Run');
        this.setup();

        this.resetPlotConfig();
    };

    run = () => {
        const rlAgent = new RL(this.grid);
        // console.log('run', algorithmChoice);
        
        if (algorithmChoice === 'MCTS')
            this.move(rlAgent.mcts());
        else if (algorithmChoice === 'greedy')
            this.move(rlAgent.greedy());
        else if (algorithmChoice === 'UCB1')
            this.move(rlAgent.ucb1());
        
        let timeout = animationDelay;
        if (this.running && !this.over && !this.won) {
            const self = this;
            setTimeout(() => {
                self.run();
            }, timeout);
        }
    };

    setPlotTooltip = showToolTip => {
        this.plot.options.tooltips.enabled = showToolTip;
        this.plot.update();
    };

    manageRunOperation = () => {
        if (this.running) {
            this.running = false;
            this.actuator.setRunButton('Auto-Run');
            this.setPlotTooltip(true);
        } else {
            this.running = true;
            this.setPlotTooltip(false);
            this.run();
            this.actuator.setRunButton('Stop');
        } 
    };
}
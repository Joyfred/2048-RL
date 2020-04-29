
/*
Methods:
0. initializeCellIndexes()
1. build()
2. getRandomFreeCell()
3. eachCell(callback)
4. getFreeCells()
5. isFreeCellAvailable()
6. isCellWithinBounds(cell)
7. getCellContent(cell)
8. isCellOccupied(cell)
9. isCellFree(cell)
10. insertTile(tile)
11. removeTile(tile)
12. clone()
13. addRandomTile()
14. addInitialTiles()
15. prepareTilesForTransition()
16. moveTileToCell(tile, cell)
17. getDirectionAsVector(direction)
18. buildTraversals(vector)
19. findFarthestPosition(cell, vector)
20. postionsEqual(first, second) 
21. move(direction) 
22. computerMove() 
23. tileMatchesAvailable() 
24. movesAvailable()
25. toString()
*/
class Grid {
    static directionAsVector = {
        0: { x: 0,  y: -1 }, // up
        1: { x: 1,  y: 0 },  // right
        2: { x: 0,  y: 1 },  // down
        3: { x: -1, y: 0 }   // left
    };

    static cellIndexes = [
        [ { x: 0, y:0 }, { x: 0, y:1 }, { x: 0, y:2 }, { x: 0, y:3 } ],
        [ { x: 1, y:0 }, { x: 1, y:1 }, { x: 1, y:2 }, { x: 1, y:3 } ],
        [ { x: 2, y:0 }, { x: 2, y:1 }, { x: 2, y:2 }, { x: 2, y:3 } ],
        [ { x: 3, y:0 }, { x: 3, y:1 }, { x: 3, y:2 }, { x: 3, y:3 } ]
    ];

    static binary = {
        null  : '0000',
        2     : '0001',
        4     : '0010',
        8     : '0011',
        16    : '0100',
        32    : '0101',
        64    : '0110',
        128   : '0111',
        256   : '1000',
        512   : '1001',
        1024  : '1010',
        2048  : '1011',
        4096  : '1100',
        8192  : '1101',
        16384 : '1110',
        32768 : '1111'
    };

    static reward = {
        0     : 0,
        2     : 1,
        4     : 2,
        8     : 3,
        16    : 4,
        32    : 5,
        64    : 6,
        128   : 7,
        256   : 8,
        512   : 9,
        1024  : 10,
        2048  : 11,
        4096  : 12,
        8192  : 13,
        16384 : 14,
        32768 : 15
    };

    constructor(size) {
        this.size = size;
        this.initialTileCount = 2;
        this.cells = [];

        this.build();
        this.playerTurn = true;
    }

    build = () => {
        for (let i = 0; i < this.size; i++) {
            this.cells[i] = [];
            for(let j =0; j < this.size; j++) {
                this.cells[i].push(null);
            }
        }
    };

    getRandomFreeCell = () => {
        let freeCells = this.getFreeCells();

        if (freeCells.length === 0) {
            return null;
        }
        else {
            return freeCells[Math.floor(Math.random() * freeCells.length)];
        }
    }

    eachCell = (callback) => {
        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                callback(i, j, this.cells[i][j]);
            }
        }
    };

    getFreeCells = () => {
        let freeCells = [];
        let self = this;

        this.eachCell((x, y, tile) => {
            if(!tile) {
                freeCells.push({ x:x, y:y });
            }
        });

        return freeCells;
    };

    isFreeCellAvailable = () => {
        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                if(!this.cells[i][j])
                    return true;
            }
        }
        return false;
    };

    isCellWithinBounds = cell => {
        return cell.x >= 0 && cell.x < this.size &&
               cell.y >= 0 && cell.y < this.size;
    };

    getCellContent = cell => {
        if (this.isCellWithinBounds(cell)) {
            return this.cells[cell.x][cell.y]
        }
        else {
            return null;
        }
    };
    
    isCellOccupied = cell => {
        if (this.getCellContent(cell))
            return true;
        else
            return false;
    };

    isCellFree = cell => {
        return !this.isCellOccupied(cell);
    };

    insertTile = tile => {
        this.cells[tile.x][tile.y] = tile;
    };

    removeTile = tile => {
        this.cells[tile.x][tile.y] = null;
    };

    // Used in rl.js to run monte carlo episodes
    clone = () => {
        let newGrid = new Grid(this.size);
        newGrid.playerTurn = this.playerTurn;

        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                if (this.cells[i][j]) {
                    newGrid.insertTile(this.cells[i][j].clone());
                }
            }
        }

        return newGrid;
    }

    addRandomTile = () => {
        if (this.isFreeCellAvailable()) {
            let value = Math.random() < 0.9 ? 2 : 4;
            let randomCell = this.getRandomFreeCell();
            let tile = new Tile(randomCell, value);

            this.insertTile(tile);
        }
    };

    addInitialTiles = () => {
        for(let i=0; i<this.initialTileCount; i++) {
            this.addRandomTile()
        }
    };

    prepareTilesForTransition = () => {
        this.eachCell((x, y, tile) => {
            if(tile) {
                tile.mergedFrom = null;
                tile.savePosition();
            }
        });
    };

    moveTileToCell = (tile, cell) => {
        this.cells[tile.x][tile.y] = null;
        this.cells[cell.x][cell.y] = tile;
        tile.updatePosition(cell);
    };

    getDirectionAsVector = direction => {
        return Grid.directionAsVector[direction];
    };

    buildTraversals = vector => {
        let traversals = { x: [], y: [] };

        for(let i = 0; i < this.size; i++) {
            traversals.x.push(i);
            traversals.y.push(i)
        }

        if (vector.x == 1) traversals.x = traversals.x.reverse();
        if (vector.y == 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    // renmaing required
    findFarthestPosition = (cell, vector) => {
        let previous;

        do {
            previous = cell;
            cell = { 
                x: previous.x + vector.x, 
                y: previous.y + vector.y
            };
        } while (this.isCellWithinBounds(cell) && this.isCellFree(cell));

        return { farthest: previous, next: cell };
    };

    positionsEqual = (first, second) => {
        return first.x === second.x && first.y === second.y;
    };

    getRowHash = rowIndex => {
        let rowInBinary = this.cells[rowIndex].map(tile => {
            if (tile)
                return Grid.binary[tile.value];
            else
                return Grid.binary[null];
        });

        rowInBinary = rowInBinary.join('');
        return parseInt(rowInBinary, 2);
    };

    getColumnHash = columnIndex => {
        let columnInBinary = [];

        for(let i=0; i<4; i++) {
            let tile = this.cells[i][columnIndex]
                if (tile)
                    return Grid.binary[tile.value];
                else
                    return Grid.binary[null];
        }

        columnInBinary = columnInBinary.join('');
        return parseInt(columnInBinary, 2);
    }
    
    move1 = direction => {
        let hash;
        let won = false
        let moved = false
        let score = 0
        let output
        this.prepareTilesForTransition();
        for(let i=0; i<4; i++) {

            if (direction === 1 || direction === 3) {
                hash = this.getRowHash(i);
            }
            else {
                hash = this.getColumnHash(i);
            }

            console.log(rightOrDownHash)
            switch (direction) {
                case 1:
                    output = rightOrDownHash[hash];
                    for(let j=3; j>=0; j--) {
                        
                        if (output['result']) {
                            let newTile = new Tile({ x: i, y: j }, output['result'])
                            newTile.mergedFrom = [ this.cells[i][output['mergedFrom'][0]], this.cells[i][output['mergedFrom'][1]] ]
                            this.insertTile(newTile)
                        }
                        else {
                            this.removeTile(i, j)
                        }
                    }
                    won = won | output['won'];
                    moved = moved | output['moved'];
                    score += output['score'];
                    break;
                case 2:
                    output = rightOrDownHash[hash];
                    for(let j=3; j>=0; j--) {
                        
                        if (output['result']) {
                            let newTile = new Tile({ x: j, y: i }, output['result'])
                            newTile.mergedFrom = [ this.cells[output['mergedFrom'][0]][i], this.cells[output['mergedFrom'][1]][i] ]
                            this.insertTile(newTile)
                        }
                        else {
                            this.removeTile(j, i);
                        }
                    }
                    won = won | output['won'];
                    moved = moved | output['moved'];
                    score += output['score'];
                    break;
            }
        }
        console.log({ moved: moved, score: score, won: won });
    }

    move = direction => {
        let self = this;
        let cell, tile;

        let directionVector = this.getDirectionAsVector(direction);
        let traversals = this.buildTraversals(directionVector);
        let moved = false;
        let score = 0;
        let reward = 0;
        let won = false;

        this.prepareTilesForTransition();

        for(let i=0; i<4; i++) {
            for(let j=0; j<4; j++) {
                
                let x = traversals.x[i];
                let y = traversals.y[j];

                cell = Grid.cellIndexes[x][y];
                tile = self.getCellContent(cell);

                if (tile) {
                    let positions = self.findFarthestPosition(cell, directionVector);
                    let next = self.getCellContent(positions.next);

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        let merged = new Tile(positions.next, tile.value * 2);
                        merged.mergedFrom = [tile, next];

                        self.insertTile(merged);
                        self.removeTile(tile);
                    
                        // In near future, we make a check whether current tile
                        // has been moved from its cell.
                        tile.updatePosition(positions.next);

                        score += merged.value;
                        reward += Grid.reward[merged.value];  // for UCB1

                        if (merged.value === 2048) {
                            won = true;
                        }
                    }
                    else {
                        self.moveTileToCell(tile, positions.farthest);
                    }

                    // If no tile has moved from its cell,
                    // it implies player hasn't made any
                    // move, which made a tile to move out
                    // from its current cell
                    if (!self.positionsEqual(cell, tile)) {
                        self.playerTurn = false;
                        moved = true;
                    }
                }
            }
        }
        return { moved, score, reward, won };
    }

    computerMove = () => {
        this.addRandomTile();
        this.playerTurn = true;
    }

    tileMatchesAvailable = () => {
        let self = this;
        let tile;

        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                tile = this.getCellContent({ x: i, y: j});

                if (tile) {
                    for (let direction = 0; direction < 4; direction++) {
                        let directionVector = self.getDirectionAsVector(direction);
                        let neighbourCell = {
                            x: i + directionVector.x,
                            y: j + directionVector.y
                        };
                
                        var neighbourTile = self.getCellContent(neighbourCell);
                
                        if (neighbourTile && neighbourTile.value === tile.value) {
                            return true;
                        }
                    }
                }
            }
        }
        return false
    };

    // Used in gameManager
    movesAvailable = () => {
        return this.isFreeCellAvailable() || this.tileMatchesAvailable();
    };

    toString = () => {
        let string = '';

        for(let i = 0; i < this.size; i++) {
            for(let j = 0; j < this.size; j++) {
                if(this.cells[i][j]) {
                    string += this.cells[i][j].value + ' ';
                }
                else {
                    string += '_ '
                }
            }
            string += '\n';
        }
        console.log(string);
    };
}

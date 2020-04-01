/*
Properties:


Methods:
1. actuate(gridState, metadata)
2. restart()
3. clearContainer(tileContainer)
4. addTile(tile)
5. applyClasses(element, classes)
6. normalizePositionClass(position)
7. positionClass(position)
8. updateScore(score)
9. message(won)
10. clearMessage()
11. showHint(hint)
12. setRunButton(message)
*/

class HTMLActuator {
    constructor() {
        this.tileContainer    = document.getElementsByClassName("tile-container")[0];
        this.scoreContainer   = document.getElementsByClassName("score-container")[0];
        this.messageContainer = document.getElementsByClassName("game-message")[0];
        this.score = 0;
    }

    applyClasses = (element, classes) => {
        element.setAttribute("class", classes.join(" "));
    };

    normalizePosition = position => {
        return { x: position.x + 1, y: position.y + 1} ;
    }

    positionClass = position => {
        position = this.normalizePosition(position);
        return "tile-position-" + position.x + "-" +position.y;
    };

    addTile = tile => {
        let self = this;

        let element = document.createElement("div");
        let position = tile.previousPosition || { x: tile.x, y: tile.y };
        let positionClass = this.positionClass(position);

        let classes = ["tile", "tile-" + tile.value, positionClass]
        this.applyClasses(element, classes);

        element.textContent = tile.value

        if(tile.previousPosition) {
            window.requestAnimationFrame(() => {
                classes[2] = self.positionClass({ x: tile.x, y: tile.y });
                self.applyClasses(element, classes);
            });
        }
        else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(element, classes);

            tile.mergedFrom.forEach((merged) => {
                self.addTile(merged);
            });
        }
        else {
            classes.push("tile-new");
            this.applyClasses(element, classes);
        }

        this.tileContainer.appendChild(element);
    };

    clearContainer = (container) => {
        // What does _.firstChild return ?
        // A Node object, representing the first child of a node, or null if 
        // there are no child nodes
        while (container.firstChild)
            container.removeChild(container.firstChild);
    };
    
    updateScore = score => {
        this.clearContainer(this.scoreContainer);

        let difference = score - this.score;
        this.score = score;

        this.scoreContainer.textContent = this.score;

        if(difference > 0) {
            let addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = "+" + difference;

            this.scoreContainer.appendChild(addition)
        }
    };
    actuate = (gridState, metadata) => {
        let self = this;

        window.requestAnimationFrame(() => {
            self.clearContainer(self.tileContainer);

            gridState.cells.forEach((column) => {
                column.forEach((cell) => {
                    if (cell) {
                        self.addTile(cell);
                    }
                });
            });

            self.updateScore(metadata.score);
            if (metadata.over) self.message(false); // lose case
            if (metadata.won) self.message(true);  // win case
        });
    };

    message = won => {
      const type    = won ? 'game-won' : 'game-over';
      const message = won ? 'You win'  : 'Game over!';

      this.messageContainer.classList.add(type);
      this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };

    setRunButton = message => {
        document.getElementById('run-button').innerHTML = message;
    };

    clearMessage = () => {
        this.messageContainer.classList.remove("game-won", "game-over");
    };

    restart = () => this.clearMessage();

    
}
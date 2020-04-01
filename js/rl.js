class RL {
    constructor(grid) {
        this.state = grid;
        this.moveCount = [0, 0, 0, 0]  //['up', 'right', 'down', 'left']
        this.moveValue = [Infinity, Infinity, Infinity, Infinity]
        this.totalMoveCount = 0;
    }

    greedy = () => {
        const possibleDirections = [...Array(4).keys()]
        const moveScore = possibleDirections.map(direction => {
            const mockGrid = this.state.clone();
            const result = mockGrid.move(direction);
            return result.moved ? result.score : -1;
        });

        return getMaxIndex(moveScore);
    }

    ucb1Calculation = (moveValue, moveCount) => {
        if(moveCount == 0) {
            return Infinity;
        }
        return moveValue +                                             //Exploitation
                Math.sqrt(2 * Math.log(this.totalMoveCount)/moveCount) //Exploration
    }
    
    ratioCalculation = (moveValue, moveCount) => {
        if(moveCount == 0) {
            return null;
        }
        return (moveValue/Math.sqrt(Math.log(this.totalMoveCount)/moveCount))
    }

    ucb1Score = () => {
        let ucb1Score = []
        // let ratio = []
        
        for(let i=0; i<4; i++) {
            ucb1Score.push(this.ucb1Calculation(this.moveValue[i], this.moveCount[i]));
            // ratio.push(this.ratioCalculation(this.moveValue[i], this.moveCount[i]));
        }

        // console.log(ratio); 
        return ucb1Score;
    }

    updateMoveValue = (moveIndex, reward) => { // Incremental Implementation
        if(this.moveValue[moveIndex] == Infinity) {
            this.moveValue[moveIndex] = reward;
        }
        else {
            this.moveValue[moveIndex] += 1/this.moveCount[moveIndex] *
                                        (reward - this.moveValue[moveIndex])
        }                                    
    }

    mcts = () => {
        let episodeCount = document.getElementById('run-count').value;
        const residue = episodeCount%4;
        const discountFactor = 1; // discount factors for rewards recieved
        let maxAvgScore = 0;
        let optimalMove;
        
        if(residue) {
            episodeCount = episodeCount + 4 - residue;
        }

        for(let i=0; i<4; i++) {
            let score = 0;
            for(let j=0; j<episodeCount/4; j++) {
                const mockGrid = this.state.clone();

                let initialMoveResult = mockGrid.move(i);
                if (initialMoveResult.moved) mockGrid.addRandomTile();
                score += initialMoveResult.score;

                let stepCount = 1;
                while(initialMoveResult.moved && mockGrid.movesAvailable())
                {
                    const result = mockGrid.move(getRandomInteger(4));
                    if(result.moved) mockGrid.addRandomTile();
                    score += Math.pow(discountFactor,  stepCount) * result.score;
                    stepCount++;
                }
            }
            let avgScore = score/(episodeCount/4);
            if(avgScore > maxAvgScore) {
                maxAvgScore = avgScore;
                optimalMove = i;
            }
        }

        return optimalMove;
    }

    ucb1 = () => {

        let episodeCount = document.getElementById('run-count').value;
        const residue = episodeCount%4;

        if(residue) {
            episodeCount = episodeCount + 4 - residue;
        }

        for(let i=0; i<episodeCount; i++) {
            let score = 0;
            let ucb1Score = this.ucb1Score()
            let mockGrid = this.state.clone();

            let moveIndex = ucb1Score.indexOf(Math.max(...ucb1Score));
            this.moveCount[moveIndex] += 1;
            this.totalMoveCount += 1;

            let initialMoveResult = mockGrid.move(moveIndex);
            if (initialMoveResult.moved) mockGrid.addRandomTile();
            score += initialMoveResult.score;

            while(initialMoveResult.moved && mockGrid.movesAvailable())
            {
                let result = mockGrid.move(Math.floor(Math.random() * 4));
                if(result.moved) mockGrid.addRandomTile();
                score += result.score;
            }

            // mockGrid.toString();
            this.updateMoveValue(moveIndex, score)
            // console.log(this.moveCount, this.moveValue, this.totalMoveCount);
        }

        let ucb1Score = this.ucb1Score();
        // console.log(ucb1Score, this.moveValue, this.moveCount);
        return ucb1Score.indexOf(Math.max(...ucb1Score));
    }


}
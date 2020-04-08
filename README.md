# 2048 - RL
Reinforcement Learning approach to solve [2048](https://github.com/gabrielecirulli/2048)!

Watch the RL Agent in action [here](http://joyfred.github.io/2048-RL/)

###### Keywords: 2048, monte carlo tree search, greedy algorithm, upper confidence bound for trees, UCB1

## Introduction:

2048 is a single-player puzzle game developed by Gabriele Cirulli, in March 2014. The game’s objective is to slide numbered tiles on a grid to combine them to create a tile with the number 2048. At the beginning, there are only two numbered tiles, either numbering 2 or 4 at arbitrary locations. The player controls and alters the board by pressing arrow keys, with the tiles in the board moving accordingly. Adjacent tiles of the same value are  merged into a tile of twice the value. Moreover, after each move, a new number, either 2 or 4, will appear on one of the empty cells uniformly with a probability of 9:1.

We consider the following methods as the  effective strategies for solving 2048: Monte Carlo Tree Search(MCTS) and Upper Confidence bound for Trees(UCT). Then we set rewards and punishments which are based on the rules that we set for the game when training the RL Agent. In that way, 2048 can be derived from a single-player puzzle game to an auto AI game, which means no human interactions are needed throughout the entire self-learning process. 

## Problem Formulation:

##### State Space:
Theoretically, the maximum tile possible is 131072(2<sup>17</sup>). We reduced this upper bound to 32768(2<sup>15</sup>) for aesthetic computations. Consequently, there are 16 different possibilities for a cell {empty, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384,  32768}. There are 16 cells in a standard board which leads to 16<sup>16</sup> ≅ 10<sup>20</sup> possible states.

##### Action Space:
At any instance, there are only four possible actions namely UP, RIGHT, DOWN and LEFT.

##### Reward function:
Rewards are formulated in two different ways.

1. Game Score: Score is the sum of values of merged tiles for a particular action.
2. Bespoke Score: Sum of binary logarithm of merged values for a particular action.

##### Goal:
Develop an RL agent to solve 2048 without any human or prior knowledge, except knowing the rules of the game.

## Implementation:

The basic ideology of the game is constructed as a web application using JavaScript. RL Agent is developed as a separate module to increase flexibility. Basic structure of the RL Agent is defined conventionally, with customised policy optimization techniques as discussed below:

##### Monte Carlo Tree Search:

Basic ideology behind MCTS is to construct a tree with nodes (states) and edges (actions) which is incrementally built by the expansion of nodes, and the values of nodes are updated through a backup strategy based on the average value of child nodes. Since, the number of states is high, we integrate planning with learning approach with MCTS i.e as and when a state is reached we construct a Monte carlo tree by considering the current state as root node and run Monte Carlo episodes. Based on the results of Monte Carlo episodes optimal action is exploited. Number of episodes to be carried is a user input which determines the efficiency of the RL agent and time taken to accomplish the 2048 tile.

##### Upper Confidence Bound for Trees:

UCT is a slight improvement to MCTS. Rather than executing Monte Carlo episodes in a pure randomized fashion, we exploit promising moves  based on the scores achieved in previous episodes. UCB1 is used to evaluate the state-action value at each step of the game. Given infinite time and memory, UCT theoretically converges to Minimax which is a deterministic game theory strategy to solve 2048. 



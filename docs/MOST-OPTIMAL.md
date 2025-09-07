We are going to write an algorithm for the most optimal path from 1-99 farming for seeds we currently understand.
This optimization path will be called "LEAST PATCH" mode.

At each level step from 1 - 99

Check ALL farming opportunities for the player at that level
For the highest level seed, identify the highest EXP PER PATCH which is either the sum total per patch due to harvest and yield modifiers OR the check health + initial tree harvest (we dont support trees yet)
Then use the level gain algorithm to count the number of that patch that needs to be farmed based on the quantity (starting at quantity 1) until the next level is made using the level calculation method in the calculator for N and N+1. The result of that is the needed growth path for that level step.

it must use quantity of target crop, because the whole algorithm runs on this

Then repeat for every level step until 99.

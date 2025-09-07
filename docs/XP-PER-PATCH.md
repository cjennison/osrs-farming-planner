

XP per a single patch = Planting XP + (Harvest XP per item × Expected yield)

We know that a target crop has dependencies, so in order to determine the number of target crops per patch, we need to consider the dependencies of each crop and how they affect the overall yield and experience gained.

This is done via an algorithm:

Use the existing method calculateDependencies.
Set the parameters accordingly, and we know the target level.
Start with 1 target crop, the outcome will tell us the total experience for that crop based on all its built in dependencies. If thats less than the goal, add one more quantity and so on until we are over the exp goal. Then you can simply return the results from calculateDependencies.

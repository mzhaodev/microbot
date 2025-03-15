# Microbot

<https://microbot.mzhao.dev/>

[GitHub](https://github.com/mzhaodev/microbot)

Microbot is a finite-state machine turtle programming game. Given a map, the goal is to define a state transition mapping such that the microbot, following the mapping, will reach all open squares regardless of its starting position.

This project was developed to help students in a high school computer science class test their solutions to a homework assignment.

## Instructions

The state of a bot consists of:

- An integer value from 0-255 (8 bits of storage).
- The presence or absence of walls in its four adjacent cells (north, east, west, south).

Mappings should be formatted:

```
A BBBB -> C D
```

This means: "A bot with state `A BBBB` should move in direction `C` and update its integer value to `D`."

- `A` is an integer from 0-255.
- `BBBB` is a 4-character string that represents the presence of walls (`N`, `E`, `W`, `S`) or open spaces.
  - `N`, `E`, `W`, or `S` means there is a wall to the north, east, west, or south respectively.
  - `*` acts as a wildcard (matches both wall and empty space).
  - Any other non-whitespace character represents an empty cell.
  - The characters **must always be written in NEWS order**.
- `C` is the direction the bot should move (N, W, E, S) or `X` to indicate no movement. Moving into a wall is an error.
- `D` is the new integer value to store. (It replaces the previous value.)

No two rules should cover the same integer + wall combination.

The bot always starts with integer value `0` stored.

### Examples:
```
0 **** -> E 0
```
This rule makes the bot move east until it "crashes" into a wall.  

```
0 NEW_ -> S 1
```
If there are walls to the north, east, and west, and there is an empty cell to the south, this rule makes the bot move south and store the integer `1`

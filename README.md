# Microbot

<https://microbot.mzhao.dev/>

Microbot is a puzzle game where, given a grid, you define a set of rules to program the microbot to visit every open square regardless of where it starts.

## Instructions

Each rule is based on two inputs: the bot’s state and its surroundings:

- The "state" is a single integer from 0–255 (8 bits of storage).
- The "surroundings" is the presence or absence of walls in the four adjacent cells (north, east, west, south).

Rules should be formatted:

```
A BBBB -> C D
```

This means: "A bot with state `A` observing surroundings `BBBB` should move in direction `C` and update its state to `D`."

- `A` is an integer from 0-255.
- `BBBB` is a 4-character string that represents the surroundings (walls `N`, `E`, `W`, `S` or open spaces).
  - `N`, `E`, `W`, or `S` means there is a wall to the north, east, west, or south respectively.
  - `*` acts as a wildcard (matches both wall and empty space).
  - `_` represents an empty cell.
  - The characters must always be written in NEWS order.
- `C` is the direction the bot should move (N, W, E, or S). Use `X` to indicate no movement. Moving into a wall is an error.
- `D` is the new integer state to store.

No two rules should cover the same combination of state + surroundings.

The bot always starts with integer value `0` stored.

### Examples:
```
0 *_** -> E 0
```
This rule makes the bot move east while the cell to the east is empty.

```
0 *EW_ -> S 1
```
If there are walls to the east, and west, and there is an empty cell to the south, this rule makes the bot move south and change its state to`1`.

```
1 **** -> X 2
```
This rule changes the bot's state from `1` to `2` without moving.

## About

This project is a reimplementation of an existing puzzle game, adding additional features for debugging and testing solutions.

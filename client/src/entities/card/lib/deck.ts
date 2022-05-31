import explodingkitten from "@shared/assets/cards/exploding-kitten.png";
import defuse from "@shared/assets/cards/defuse.png";
import favor from "@shared/assets/cards/favor.png";
import attack from "@shared/assets/cards/attack.png";
import nope from "@shared/assets/cards/nope.png";
import shuffle from "@shared/assets/cards/shuffle.png";
import skip from "@shared/assets/cards/skip.png";
import seethefuture from "@shared/assets/cards/see-the-future.png";

export type CardType =
  | "exploding-kitten"
  | "defuse"
  | "favor"
  | "attack"
  | "nope"
  | "shuffle"
  | "skip"
  | "see-the-future";

export interface CardDetails {
  name: string;
  tone: string;
  description: string;
  avatar: string;
}

export const deck: Record<CardType, CardDetails> = {
  "exploding-kitten": {
    name: "exploding kitten",
    tone: "#5C5C5C",
    description:
      "if you drew an exploding kitten, you can play this card instead of dying. place your defuse card in the discard pile.",
    avatar: explodingkitten,
  },
  defuse: {
    name: "defuse",
    tone: "#8FBC5C",
    description:
      "you must show this card immediately. unless you have a defuse card, you're dead. discard all of your cards, including the exploding kitten.",
    avatar: defuse,
  },
  favor: {
    name: "favor",
    tone: "#2C2C2C",
    description:
      "force any other player to give you 1 card from their hand. they choose which card to give you.",
    avatar: favor,
  },
  attack: {
    name: "attack",
    tone: "#F69A23",
    description:
      "immediately end your turn(s) without drawing and force the next player to take 2 turns in a row. the victim of this card takes a turn as normal (play-or-pass, then draw). then, when their first turn is oevr, it's their turn again.",
    avatar: attack,
  },
  nope: {
    name: "nope",
    tone: "#DC1934",
    description:
      "stop any action except for an exploding kitten or a defuse card.",
    avatar: nope,
  },
  shuffle: {
    name: "shuffle",
    tone: "#736357",
    description: "shuffle the draw pile thoroughly.",
    avatar: shuffle,
  },
  skip: {
    name: "skip",
    tone: "#4290D0",
    description: "immediately end your turn without drawing a card.",
    avatar: skip,
  },
  "see-the-future": {
    name: "see the future",
    tone: "#ED3F8C",
    description:
      "privately view the top 3 cards from the draw pile and put them back in the same order.",
    avatar: seethefuture,
  },
};

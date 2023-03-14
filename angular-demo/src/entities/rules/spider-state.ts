import { Scene } from "game-engine";
import { EngineStateService } from "src/app/engine-state.service";
import { sizeCards } from "src/utils/card-sizer";
import { CardDeckEntity } from "../card-deck-entity";
import { CardEntity } from "../card-entity";
import { CardStackEntity } from "../card-stack-entity";
import { CardGameRules } from "./game-rules";

export class SpiderRules implements CardGameRules {
  viewOption: string = 'Spider';

  ruleKeys = {
    suit1: '1 suit',
    suit2: '2 suit',
    suit4: '4 suit',
    norules: 'no rules'
  };

  options: { name: string; type: string; value: any; callback: (val: any) => void; }[] = [
    {
      name: this.ruleKeys.suit1,
      type: 'radio',
      value: false,
      callback: async (val: any) => {
        this.setOption(this.ruleKeys.suit1, true);
        this.setOption(this.ruleKeys.suit2, false);
        this.setOption(this.ruleKeys.suit4, false);
        this.engineState?.reset();
        await this.engineState?.engine.doTick();
        this.engineState?.engine.resetStates();
      }
    },
    {
      name: this.ruleKeys.suit2,
      type: 'radio',
      value: false,
      callback: async (val: any) => {
        this.setOption(this.ruleKeys.suit1, false);
        this.setOption(this.ruleKeys.suit2, true);
        this.setOption(this.ruleKeys.suit4, false);
        this.engineState?.reset();
        await this.engineState?.engine.doTick();
        this.engineState?.engine.resetStates();
      }
    },
    {
      name: this.ruleKeys.suit4,
      type: 'radio',
      value: true,
      callback: async (val: any) => {
        this.setOption(this.ruleKeys.suit1, false);
        this.setOption(this.ruleKeys.suit2, false);
        this.setOption(this.ruleKeys.suit4, true);
        this.engineState?.reset();
        await this.engineState?.engine.doTick();
        this.engineState?.engine.resetStates();
      }
    },
    {
      name: 'no rules',
      type: 'toggle',
      value: false,
      callback: (val: any) => { this.setOption('no rules', val.srcElement.checked) }
    }
  ];

  getOption(name: string): any {
    return this.options.find(option => option.name == name)?.value;
  }

  private setOption(name: string, val: any) {
    this.options!.find(opt => opt.name == name)!.value = val;
  }

  cardColumns = 10;
  cardRows = 2;
  cardStackSize = 20;

  deck: CardDeckEntity | null = null;
  stacks: CardStackEntity[] = [];

  sorts: CardDeckEntity[] = [];

  private engineState: EngineStateService | null = null;

  init(engine: EngineStateService, scene: Scene): void {

    this.engineState = engine;
    const cardSize = sizeCards(this);
    cardSize.width = `calc(${cardSize.width} / 2)`;
    cardSize.height = `calc(${cardSize.height} / 2)`;
    this.deck = new CardDeckEntity('deck', true, true);
    this.deck.setSize(cardSize);

    const suits = this.getOption(this.ruleKeys.suit1) ? 1 : this.getOption(this.ruleKeys.suit2) ? 2 : 4;

    for (let i = 0; i < 8 / suits; i++) {
      for (let i = 0; i < 13; i++) {
        this.deck.addEntity(new CardEntity('♠', `${i + 1}`, false));
      }
      if (suits > 1) {
        for (let i = 0; i < 13; i++) {
          this.deck.addEntity(new CardEntity('♥', `${i + 1}`, false));
        }
      }
      if (suits == 4) {
        for (let i = 0; i < 13; i++) {
          this.deck.addEntity(new CardEntity('♣', `${i + 1}`, false));
        }
        for (let i = 0; i < 13; i++) {
          this.deck.addEntity(new CardEntity('♦', `${i + 1}`, false));
        }
      }
    }

    this.deck.shuffle();

    this.stacks = [];
    for (let i = 0; i < 10; i++) {
      scene.addEntity(this.stacks[i] = new CardStackEntity(`stack${i + 1}`));
      this.stacks[i].setSize(sizeCards(this));
      for (let j = 0; j < (i < 4 ? 5 : 4); j++) {
        this.stacks[i].addCard(this.deck.drawCard()!);
      }
      const card = this.deck.drawCard()!;
      card.makeFaceUp();
      this.stacks[i].addCard(card);
    }

    scene.addEntity(this.deck);
    for (let i = 0; i < 8; i++) {
      scene.addEntity(this.sorts[i] = new CardDeckEntity(`sort${i + 1}`, true, false));
      this.sorts[i].setSize(cardSize);
    }
  }

  canDropTo(dropTo: CardDeckEntity | CardStackEntity, cardLastFrom: CardDeckEntity | CardStackEntity, held: CardStackEntity | CardEntity | null): boolean {
    return this.sorts.every(sort => sort != dropTo) && (this.getOption(this.ruleKeys.norules) || dropTo.count() == 0 || Number.parseInt(dropTo.peekCard().value) == Number.parseInt((held?.getEntities()[0] as CardEntity).value) + 1 || dropTo == cardLastFrom);
  }

  deal(deck: CardDeckEntity): void {
    for (let i = 0; i < this.stacks.length; i++) {
      if (this.stacks[i].count() == 0) {
        return;
      }
    }

    for (let i = 0; i < 10; i++) {
      const card = deck.drawCard()!;
      card.makeFaceUp();
      this.stacks[i].addCard(card);
    }
  }

  cycleDeck(deck: CardDeckEntity): void {
  }

  pickUp(deck: CardDeckEntity): CardEntity | null {
    return null;
  }

  canPickUpStack(stack: CardStackEntity, pickupCount: number): boolean {
    const cards = stack.getEntities() as CardEntity[];
    if (pickupCount == 1 && !cards[cards.length - 1].isUp) {
      cards[cards.length - 1].makeFaceUp();
      return false;
    }

    if (this.getOption(this.ruleKeys.norules)) {
      return true;
    }

    if (pickupCount == 1) {
      return true;
    }

    let descending = true;
    for (let i = cards.length - pickupCount; i < cards.length - 1; i++) {
      if (!cards[i].isUp || Number.parseInt(cards[i].value) != Number.parseInt(cards[i + 1].value) + 1) {
        descending = false;
        break;
      }
    }

    return descending && new Set(cards.slice(cards.length - pickupCount).map(card => card.suit)).size == 1;
  }

  autoPlay(held: any): boolean {
    if (held) {
      return false;
    }

    for (let i = 0; i < this.stacks.length; i++) {
      const card = this.stacks[i].peekCard();
      // Flip cards
      if (card && !card?.isUp) {
        card.makeFaceUp();
        return true;
      }

      const cards = this.stacks[i].getEntities() as CardEntity[];
      for (let j = 0; j < cards.length; j++) {
        if (Number.parseInt(cards[j].value) == 13 && cards[j].isUp && cards.length - j >= 13) {
          let descending = true;
          for (let k = j + 1; k < cards.length; k++) {
            if (!cards[k].isUp || Number.parseInt(cards[k].value) != Number.parseInt(cards[k - 1].value) - 1) {
              descending = false;
              break;
            }
          }

          if (descending && new Set(cards.slice(j, 13).map(card => card.suit)).size == 1) {
            for (let k = 0; k < this.sorts.length; k++) {
              if (this.sorts[k].count() == 0) {
                this.stacks[i].drawCards(13).forEach(card => this.sorts[k].addCard(card));
                return true;
                break;
              }
            }
          }
        }
      }

    }

    return false;
  }

  rebind(scene: Scene): void {
    const cardSize = sizeCards(this);
    cardSize.width = `calc(${cardSize.width} / 2)`;
    cardSize.height = `calc(${cardSize.height} / 2)`;

    this.deck = scene.entitiesSlice().find(entity => entity instanceof CardDeckEntity && entity.key == 'deck') as CardDeckEntity;
    this.deck.setSize(cardSize);
    this.stacks = [];

    const indexFinderStack = /stack(?<index>[0-9]+)/;
    scene.entitiesSlice()
      .filter(entity => entity instanceof CardStackEntity && entity.key.indexOf('stack') > -1)
      .map(stack => stack as CardStackEntity)
      .forEach(stack => {
        this.stacks[Number.parseInt(indexFinderStack.exec(stack.key)?.groups?.['index'] as string) - 1] = stack;
        stack.setSize(sizeCards(this));
      });

    const indexFinderSort = /sort(?<index>[0-9]+)/;
    scene.entitiesSlice()
      .filter(entity => entity instanceof CardDeckEntity && entity.key.indexOf('sort') > -1)
      .map(sort => sort as CardDeckEntity)
      .forEach(sort => {
        this.sorts[Number.parseInt(indexFinderSort.exec(sort.key)?.groups?.['index'] as string) - 1] = sort;
        sort.setSize(cardSize);
      });
  }

}
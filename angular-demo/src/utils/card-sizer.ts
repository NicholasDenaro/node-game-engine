import { GameRules } from "src/entities/game-rules";

export function sizeCards(rules: GameRules): {width: string, height: string} {
    let horizontalCards = rules.cardColumns;
    let verticalCards = rules.cardRows;
    let stackLength = rules.cardStackSize;
    const screenWidth = window.visualViewport?.width!;
    const screenHeight = window.visualViewport?.height!;
    const maxWidth = screenWidth / horizontalCards;
    const maxHeight = screenHeight / (verticalCards + stackLength / 10);

    let width = '';
    let height = '';
    if (maxHeight / 1.4 < maxWidth) {
        width = `${maxHeight * 0.98 / 1.4}px`;
        height = `${maxHeight * 0.98}px`;
    } else {
        width = `${maxWidth * 0.98}px`;
        height = `${maxWidth * 0.98 * 1.4}px`;
    }

    return {
        width,
        height
    }
}
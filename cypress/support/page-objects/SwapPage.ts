import MarketComponent from "./MarketComponent";
import LimitComponent from "./LimitComponent";
import { TEST_IDS as SwapHeaderTestIds } from '../../../src/elements/swapHeader/SwapHeader';

export default class SwapPage {
    visit(skipWait = false) {
        cy.visit('http://localhost:3000/');

        if (skipWait) {
            cy.wait(4000);
        }

        return this;
    }

    selectMarket() {
        cy.get('button').contains('Market').click();
        return new MarketComponent();
    }

    selectLimit() {
        cy.get('button').contains('Limit').click();
        return new LimitComponent();
    }
};
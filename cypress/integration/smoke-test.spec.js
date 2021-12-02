/* eslint-disable jest/valid-expect-in-promise */
/* eslint-disable no-undef */

/// <reference types="cypress" />

const dataCy = (name) => `[data-cy=${name}]`;

describe('smoke test', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');

    cy.wait(4000);
  });

  it('Should survive happy path', () => {
    // in swap
    cy.get(dataCy('selectTokenButton')).click();
    // cy.get(dataCy('searchToken')).type('bnt');

    // cy.get(dataCy('searchableTokensList')).first().click();

    // cy.get(dataCy('fromAmount')).type('3');
    // cy.wait(2000);

    // cy.get(dataCy('toAmount')).then((input) => {
    //   const originalAmount = input.val();
    //   console.log({ originalAmount }, input);
    //   expect(Number(originalAmount)).to.be.a('number').greaterThan(0);
    //   cy.get(dataCy('fromAmount')).type('{backspace}0.5');
    //   cy.wait(1000);

    //   cy.get(dataCy('toAmount')).should((input) => {
    //     expect(input.val()).not.to.eq(originalAmount);
    //   });

    //   cy.get(dataCy('priceImpact')).then((input) => {
    //     const rate = input.text();

    //     console.log('rate', rate);

    //     cy.get(dataCy('fromAmount')).type('{backspace}{backspace}{backspace}');
    //     cy.wait(1000);

    //     cy.get(dataCy('priceImpact')).should((input) => {
    //       const newRate = input.text();
    //       console.log('newRate', newRate);
    //       expect(newRate).not.to.eq(rate);
    //     });

    //     cy.get(dataCy('fromAmount')).type('0.');
    //     cy.wait(2000);

    //     cy.get(dataCy('toAmount')).should((input) => {
    //       expect(input.val()).not.to.eq('NaN');
    //     });
    //   });
    // });
  });
});

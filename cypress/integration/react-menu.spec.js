import {iframe} from './utils';

context('React Menu', () => {
    beforeEach(() => {
        cy.visit('localhost:3000');
    });
    it('Navigation propagates to React Menu IFrame', () => {
        cy.iframe('#iFrameResizer0')
            .contains('Vue')
            .click();
        cy.location('pathname').should('include', '/vue');
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/vue"]')
            .should('have.class', 'active');

        cy.iframe('#iFrameResizer0')
            .contains('IFrame')
            .click();
        cy.location('pathname').should('include', '/iframe');
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/iframe"]')
            .should('have.class', 'active');
    });
});

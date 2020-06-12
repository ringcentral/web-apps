context('React Menu IFrame', () => {
    beforeEach(() => {
        cy.visit('localhost:3000');
    });
    it('Navigation propagates to React Menu', () => {
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/vue"]')
            .click();
        cy.location('pathname').should('include', '/vue');
        cy.iframe('#iFrameResizer0')
            .find('a[href*="/vue"]')
            .should('have.class', 'active');

        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/global"]')
            .click();
        cy.location('pathname').should('include', '/global');
        cy.iframe('#iFrameResizer0')
            .find('a[href*="/global"]')
            .should('have.class', 'active');
    });
});

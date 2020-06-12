context('Vue', () => {
    beforeEach(() => {
        cy.visit('localhost:3000');
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/vue"]')
            .click();
    });
    it('Deep link to React', () => {
        cy.get('web-app-vue')
            .shadow()
            .find('a[href*="/global/groups"]')
            .click();
        cy.location('pathname').should('include', '/global');
        cy.contains('Deep in Vue').should('be.visible');
    });

    it('Deep link to IFrame', () => {
        cy.get('web-app-vue')
            .shadow()
            .find('a[href*="/app/bar"]')
            .click();
        cy.iframe('#iFrameResizer1')
            .contains('BAR')
            .should('be.visible');
    });
});

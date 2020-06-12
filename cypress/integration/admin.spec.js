context('Admin', () => {
    beforeEach(() => {
        cy.visit('localhost:3000');
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/admin"]')
            .click();
    });
    it.skip('Basics', () => {
        // Travis does not like it...
        cy.iframe('#iFrameResizer1')
            .contains('other page')
            .click();
        cy.iframe('#iFrameResizer1')
            .contains('index page')
            .click();
        cy.iframe('#iFrameResizer1')
            .contains('other page')
            .click();
    });
});

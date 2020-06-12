context('IFrame', () => {
    beforeEach(() => {
        cy.visit('localhost:3000');
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/iframe"]')
            .click();
    });

    it('Navigation to Foo', () => {
        cy.iframe('#iFrameResizer1')
            .contains('Foo')
            .click();
        cy.iframe('#iFrameResizer1')
            .contains('The standard')
            .should('be.visible');
    });

    it('Navigation to Bar', () => {
        cy.iframe('#iFrameResizer1')
            .contains('Bar')
            .click();
        cy.iframe('#iFrameResizer1')
            .contains('BAR')
            .should('be.visible');
    });

    it('Navigation to Vue', () => {
        cy.iframe('#iFrameResizer1')
            .contains('Vue')
            .click();
        cy.get('web-app-vue')
            .shadow()
            .find('a[href*="/global/groups"]') // FIXME Proper assertion
            .should('be.visible');
    });

    it('Popup', () => {
        cy.wait(500); // redirect

        cy.iframe('#iFrameResizer1')
            .contains('Popup')
            .click();
        cy.get('div.app-popup').should('be.visible');

        cy.get('div.app-popup-bg').click({force: true}); // not visible...
        cy.iframe('#iFrameResizer1')
            .get('div.modal')
            .should('not.exist');
    });

    it('Message to host', () => {
        cy.iframe('#iFrameResizer1')
            .contains('Send message')
            .click();
        cy.iframe('#iFrameResizer1')
            .get('input[name=messages]')
            .should('have.value', '[{"fromIframe":"pew"}]');
        cy.get('input[name=messages]').should('have.value', '[{"fromIframe":"pew"}]');
    });

    it('Message to app', () => {
        cy.iframe('#iFrameResizer1').contains('Send message'); // wait for app to load

        cy.get('div.border-success')
            .contains('Send message')
            .click();
        cy.iframe('#iFrameResizer1')
            .get('input[name=messages]')
            .should('have.value', '[{"toApp":"message to app"}]');
        cy.get('input[name=messages]').should('have.value', '[{"toApp":"message to app"}]');
    });
});

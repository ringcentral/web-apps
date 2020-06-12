context('React', () => {
    beforeEach(() => {
        cy.visit('localhost:3000');
        cy.get('web-app-react')
            .shadow()
            .find('a[href*="/global"]')
            .click();
    });

    it('Basic history', () => {
        cy.get('a[href*="/groups"]').click();

        cy.location('pathname').should('include', '/groups');

        cy.go('back');
        cy.location('pathname').should('not.include', '/groups');
        cy.location('pathname').should('include', '/application/apps/global');

        cy.go('forward');
        cy.location('pathname').should('include', '/groups');
    });

    it('Deep link to Vue', () => {
        cy.get('a[href*="/vue"]').click();
        cy.location('pathname').should('include', '/vue');
        cy.get('web-app-vue')
            .shadow()
            .find('a[href*="/global/groups"]') // FIXME Proper assertion
            .should('be.visible');
    });

    it('Popup', () => {
        cy.contains('Popup').click();
        cy.contains('Understood').click();
        cy.get('body').should('not.have.class', 'modal-open');
    });

    it('Message to host', () => {
        cy.get('div.border-primary')
            .contains('Send message')
            .click();
        cy.get('div.border-primary')
            .get('input[name=messages]')
            .should('have.value', '[{"toHost":"message to host"}]');
        cy.get('div.border-success')
            .get('input[name=messages]')
            .should('have.value', '[{"toHost":"message to host"}]');
    });

    it('Message to app', () => {
        cy.get('div.border-primary').contains('Send message'); // wait for app to load

        cy.get('div.border-success')
            .contains('Send message')
            .click();
        cy.get('div.border-primary')
            .get('input[name=messages]')
            .should('have.value', '[{"toApp":"message to app"}]');
        cy.get('div.border-success')
            .get('input[name=messages]')
            .should('have.value', '[{"toApp":"message to app"}]');
    });

    it('Props', () => {
        cy.get('div.border-primary').contains('Send message'); // wait for app to load

        cy.contains('Bump').click();
        cy.get('div.border-primary')
            .get('input[name=authToken]')
            .should('have.value', 'set-by-hostX');
        cy.get('div.border-success')
            .get('input[name=authToken]')
            .should('have.value', 'set-by-hostX');

        cy.contains('Bump').click();
        cy.get('div.border-primary')
            .get('input[name=authToken]')
            .should('have.value', 'set-by-hostXX');
        cy.get('div.border-success')
            .get('input[name=authToken]')
            .should('have.value', 'set-by-hostXX');
    });

    it('Dynamic import', () => {
        cy.get('div.border-primary').contains('import()');
    });
});

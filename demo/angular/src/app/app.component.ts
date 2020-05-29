import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
        <style>
            :host {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
                    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                font-size: 14px;
                color: #333;
                box-sizing: border-box;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        </style>

        <ul class="nav nav-tabs">
            <li class="nav-item">
                <a
                    routerLink="/application/apps/angular"
                    class="nav-link"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{exact: true}"
                    >Index</a
                >
            </li>
            <li class="nav-item">
                <a routerLink="/application/apps/angular/page" class="nav-link" routerLinkActive="active">Page</a>
            </li>
        </ul>

        <router-outlet></router-outlet>
    `,
})
export class AppComponent {
    public title = 'demo-angular';
}

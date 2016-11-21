var assert = require('assert');
const express = require('express');
describe('reddit-wallpapers-module', () => {
    var redditModule;
    var app;
    before(() => {
        app = express();
    });
    beforeEach(() => {
        redditModule = require('../modules/reddit-wallpapers-module');
        redditModule(app);
    });
    describe('settings', () => {
        it('should have array of subreddits, refresh time, and amount of liks to fetch', () => {
            redditModule.settings.current.should.have.deep.members({
                refresh: 120,
                links: 50
            });
        });
    });
});

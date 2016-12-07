const rewire = require('rewire');
const express = require('express');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('bookmarks-module', () => {
    var bookmarksModule;
    var app;
    before((done) => {
        app = express();
        bookmarksModule = rewire('../modules/bookmarks-module/src/bookmarks.js');
        bookmarksModule(app).then(() => {
            bookmarksModule.__set__({
                settingsDir: './bookmarkstestsettings.json'
            });
            done();
        });
    });
    it('Should have all settings loaded', () => {
        var settings = bookmarksModule.__get__('settings');
        settings.current.should.have.property('bookmarks');
        settings.current.bookmarks.should.have.property('categories');
        settings.current.bookmarks.categories.should.have.deep.property('name').and.not.be.empty;
        settings.current.bookmarks.categories.should.have.deep.property('bookmarks').and.not.be.empty;
    });
});

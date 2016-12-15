const fs = require('fs');
const rewire = require('rewire');
const express = require('express');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const moduleDir = '../modules/bookmarks-module/src/bookmarks.js';
const settingsDir = './bookmarkstestsettings.json';

describe('bookmarks-module', () => {
    var bookmarksModule;
    var app;

    before((done) => {
        app = express();
        bookmarksModule = rewire(moduleDir);
        bookmarksModule.__set__({
            settingsDir: settingsDir
        });
        fs.mkdir('./thumbnails', (err) => {
            if (err) {
                console.log(err);
            }
        });
        bookmarksModule(app).then(() => {
            done();
        });
    });

    after((done) => {
        fs.readdirSync('./thumbnails').forEach((file) => {
            fs.unlinkSync(`./thumbnails/${file}`);
        });
        fs.rmdirSync('./thumbnails');
        done();
        fs.unlink(settingsDir, (err) => {
            if (err) {
                console.log(err);
            }
        });
    });

    it('Should have all settings loaded', () => {
        var settings = bookmarksModule.__get__('settings');
        settings.current.should.have.property('bookmarks');
        settings.current.bookmarks.should.have.property('categories');
        settings.current.bookmarks.categories.forEach((category) => {
            category.should.have.property('name').and.not.be.empty;
            category.bookmarks.forEach((bookmark) => {
                bookmark.should.have.property('name').and.not.be.empty;
                bookmark.should.have.property('url').and.not.be.empty;
            });
        });
    });
    it('Should be able to find category in store', () => {
        bookmarksModule.__set__({
            'settings.current': {
                bookmarks: {
                    categories: [{
                        name: 'cat1',
                        bookmarks: [{
                            name: 'book11',
                            url: 'url11'
                        }, {
                            name: 'book12',
                            url: 'url12'
                        }]
                    }, {
                        name: 'cat2',
                        bookmarks: [{
                            name: 'book21',
                            url: 'url21'
                        }, {
                            name: 'book22',
                            url: 'url22'
                        }]
                    }]
                }
            }
        });
        var findCategory = bookmarksModule.__get__('findCategory');
        findCategory('cat1').should.be.equal(0);
        findCategory('cat2').should.be.equal(1);
        findCategory('cat3').should.be.equal(-1);
    });
    it('Should be able to find bookmark in store', () => {
        bookmarksModule.__set__({
            'settings.current': {
                bookmarks: {
                    categories: [{
                        name: 'cat1',
                        bookmarks: [{
                            name: 'book11',
                            url: 'url11'
                        }, {
                            name: 'book12',
                            url: 'url12'
                        }]
                    }, {
                        name: 'cat2',
                        bookmarks: [{
                            name: 'book21',
                            url: 'url21'
                        }, {
                            name: 'book22',
                            url: 'url22'
                        }]
                    }]
                },
                view:'items'
            }
        });
        var findBookmark = bookmarksModule.__get__('findBookmark');
        var findCategory = bookmarksModule.__get__('findCategory');
        findBookmark('url11', findCategory('cat1')).should.be.equal(0);
        findBookmark('url12', findCategory('cat1')).should.be.equal(1);
        findBookmark('url13', findCategory('cat1')).should.be.equal(-1);
        findBookmark('url21', findCategory('cat2')).should.be.equal(0);
        findBookmark('url22', findCategory('cat2')).should.be.equal(1);
        findBookmark('url23', findCategory('cat2')).should.be.equal(-1);
    });
    it('Should be able to render settings page', (done) => {
        bookmarksModule.getSettings().then((page) => {
            page.should.not.be.empty;
            done();
        }).catch((err) => {
            err.should.be.empty;
            done();
        });
    });
    it('Should be able to render main page', (done) => {
        bookmarksModule.getMainView().then((page) => {
            page.should.not.be.empty;
            done();
        }).catch((err) => {
            err.should.be.empty;
            done();
        });
    });
    it('Should be able to add category to store', (done) => {
        chai.request(app)
            .post('/bookmarks/addNewCategory')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                name: 'cat4'
            })
            .end((err, res) => {
                res.should.have.status(200);
                var findCategory = bookmarksModule.__get__('findCategory');
                findCategory('cat4').should.not.be.equal(-1);
                done();
            });
    });
    it('Should be able to add bookmark to category', (done) => {
        chai.request(app)
            .post('/bookmarks/addBookmark')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                bookmarkName: 'bok41',
                bookmarkLink: 'http://google.com/',
                category: 'cat4'
            })
            .end((err, res) => {
                res.should.have.status(200);
                var findCategory = bookmarksModule.__get__('findCategory');
                var findBookmark = bookmarksModule.__get__('findBookmark');
                findBookmark('http://google.com/', findCategory('cat4')).should.not.be.equal(-1);
                done();
            });
    });
    it('Should be able to delete bookmark from category', (done) => {
        chai.request(app)
            .post('/bookmarks/deleteBookmark')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                url: 'http://google.com/',
                category: 'cat4'
            })
            .end((err, res) => {
                res.should.have.status(200);
                var findCategory = bookmarksModule.__get__('findCategory');
                var findBookmark = bookmarksModule.__get__('findBookmark');
                findBookmark('http://google.com/', findCategory('cat4')).should.be.equal(-1);
                done();
            });
    });
    it('Should be able to delete category from store', (done) => {
        chai.request(app)
            .post('/bookmarks/deleteCategory')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                name: 'cat4'
            })
            .end((err, res) => {
                res.should.have.status(200);
                var findCategory = bookmarksModule.__get__('findCategory');
                findCategory('cat4').should.be.equal(-1);
                done();
            });
    });
    it('Should be able to change display method to items', (done) => {
        chai.request(app)
            .post('/bookmarks/displayMethod')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                method: 'items'
            })
            .end((err, res) => {
                res.should.have.status(200);
                var settings = bookmarksModule.__get__('settings');
                settings.current.view.should.be.equal('items');
                done();
            });
    });

    it('Should be able to change display method to cards', (done) => {
        chai.request(app)
        .post('/bookmarks/displayMethod')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
            method: 'cards'
        })
        .end((err, res) => {
            res.should.have.status(200);
            var settings = bookmarksModule.__get__('settings');
            settings.current.view.should.be.equal('cards');
            done();
        });
    });

    it('Should not change display method if recived method is invalid', (done) => {
        var lastView = bookmarksModule.__get__('settings').current.view;
        chai.request(app)
        .post('/bookmarks/displayMethod')
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({
            method: 'wrongDisplayMethod'
        })
        .end((err, res) => {
            res.should.have.status(500);
            var settings = bookmarksModule.__get__('settings');
            settings.current.view.should.be.equal(lastView);
            done();
        });
    });
});

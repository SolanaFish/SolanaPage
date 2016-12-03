const rewire = require('rewire');
const express = require('express');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('reddit-wallpapers-module', function() {
    var redditModule;
    var app;
    before(function(done) {
        app = express();
        redditModule = rewire('../modules/reddit-wallpapers-module/src/reddit.js');
        redditModule(app).then(() => {
            done();
        });
    });
    it('Should have all settings loaded', () => {
        var settings = redditModule.__get__('settings');
        settings.current.should.have.property('subreddits').and.not.be.empty;
        settings.current.should.have.property('refresh').and.not.be.empty;
        settings.current.should.have.property('links').and.not.be.empty;
        settings.current.should.have.property('checkUrls');
    });
    it('Should have meaningful values in current settings', () => {
        var settings = redditModule.__get__('settings');
        settings.current.refresh.should.be.above(0);
        settings.current.links.should.be.above(0);
    });
    it('Should be able to return new random wallpaper', () => {
        var getRandomWallpaper = redditModule.__get__('getRandomWallpaper');
        var wallUrl = getRandomWallpaper();
        wallUrl.should.have.property('url').and.not.be.empty;
        wallUrl.should.have.property('permalink').and.not.be.empty;
        wallUrl.should.have.property('subreddit').and.not.be.empty;
        wallUrl.should.have.property('title').and.not.be.empty;
    });
    it('Should be able to fetch wallpapers from single subreddit', () => {
        var getUrlsFromSubreddit = redditModule.__get__('getUrlsFromSubreddit')('EarthPorn');
        getUrlsFromSubreddit.then((urls) => {
            urls.should.have.length.above(0);
            urls.forEach((url) => {
                wallUrl.should.have.property('url').and.not.be.empty;
                wallUrl.should.have.property('permalink').and.not.be.empty;
                wallUrl.should.have.property('subreddit').and.not.be.empty;
                wallUrl.should.have.property('title').and.not.be.empty;
            });
        });
    });
    it('Should be able to fetch wallpaper from multiple subreddits', () => {
        redditModule.__with__({
            settings: {
                current: {
                    subreddits: ['EarthPorn', 'VillagePorn'],
                    refresh: 120,
                    links: 50,
                    checkUrls: false
                }
            }
        })(() => {
            var fetchURLs = redditModule.__get__('fetchURLs')();
            fetchURLs.then((urls) => {
                urls.forEach((url) => {
                    wallUrl.should.have.property('url').and.not.be.empty;
                    wallUrl.should.have.property('permalink').and.not.be.empty;
                    wallUrl.should.have.property('subreddit').and.not.be.empty;
                    wallUrl.should.have.property('title').and.not.be.empty;
                });
            });
        });
    });
    it('Should be able to send new wallpaper', (done) => {
        chai.request(app)
            .get('/randomWallpaper')
            .end((err, res) => {
                res.should.have.status(200);
                
                done();
            });
    });
});

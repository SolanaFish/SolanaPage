const rewire = require('rewire');
const chai = require('chai');
const should = chai.should();
const express = require('express');

describe('reddit-wallpapers-module', function() {
    var redditModule;
    var app;
    before(function() {
        app = express();
        redditModule = rewire('../modules/reddit-wallpapers-module/src/reddit.js');
        redditModule(app);
    });
    beforeEach(function() {});
    it('Should have all settings loaded', () => {
        var settings = redditModule.__get__('settings');
        settings.current.should.have.property('subreddits');
        settings.current.should.have.property('refresh');
        settings.current.should.have.property('links');
    });
    it('Should have meaningful values in current settings', () => {
        var settings = redditModule.__get__('settings');
        settings.current.refresh.should.be.above(0);
        settings.current.links.should.be.above(0);
    });
    it('Should be able to send new random wallpaper', () => {
        var getRandomWallpaper = redditModule.__get__('getRandomWallpaper');
        var wallUrl = getRandomWallpaper();
        console.log(wallUrl);
        wallUrl.should.not.be.empty();
    });
});

const rewire = require('rewire');
const express = require('express');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('media-controls-module', () => {
    var mediaModule;
    var app;
    before((done) => {
        app = express();
        mediaModule = rewire('../modules/media-controls-module/src/media.js');
        mediaModule(app).then(() => {
            mediaModule.__set__({
                settingsDir: './mediatestsettings.json'
            });
            done();
        });
    });
    it('Should have all settings loaded', () => {
        var settings = mediaModule.__get__('settings');
        settings.current.should.have.property('controlCommands').and.not.be.empty;
        settings.current.should.have.property('infoCommands').and.not.be.empty;
    });
    it('Should have all control commands loaded', () => {
        var settings = mediaModule.__get__('settings');
        settings.current.controlCommands.should.have.property('play').and.not.be.empty;
        settings.current.controlCommands.should.have.property('next').and.not.be.empty;
        settings.current.controlCommands.should.have.property('prev').and.not.be.empty;
    });
    it('Should have all play commands loaded', () => {
        var settings = mediaModule.__get__('settings');
        settings.current.infoCommands.should.have.property('title').and.not.be.empty;
        settings.current.infoCommands.should.have.property('artist').and.not.be.empty;
        settings.current.infoCommands.should.have.property('url').and.not.be.empty;
    });
    it('Should be able to play media', (done) => {
        var mediaControls = mediaModule.__get__('mediaControls');
        mediaControls.play().then(() => {
            done();
        }).catch((err) => {
            err.should.be.null;
            done();
        });
    });
    it('Should be able to skip tracks', (done) => {
        var mediaControls = mediaModule.__get__('mediaControls');
        mediaControls.next().then(() => {
            done();
        }).catch((err) => {
            err.should.be.null;
            done();
        });
    });
    it('Should be able to go to previus track', (done) => {
        var mediaControls = mediaModule.__get__('mediaControls');
        mediaControls.prev().then(() => {
            done();
        }).catch((err) => {
            err.should.be.null;
            done();
        });
    });
    it('Should be able to return media information', (done) => {
        var getInfo = mediaModule.__get__('getInfo');
        getInfo().then((info) => {
            info.should.have.property('title').and.not.be.empty;
            info.should.have.property('artist').and.not.be.empty;
            info.should.have.property('imgUrl').and.not.be.empty;
            done();
        }).catch((err) => {
            err.should.be.null;
            done();
        });
    });
    it('Should be able to controll media remotely, and return current media information', (done) => {
        chai.request(app)
            .post('/media/controls')
            .set('content-type', 'application/x-www-form-urlencoded')
            .send({
                action: 'play'
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('title').and.not.be.empty;
                done();
            });
    })
});

const rewire = require('rewire');
const express = require('express');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('system-info-module', () => {
    var infoModule;
    var app;
    before(() => {
        app = express();
        infoModule = rewire('../modules/system-info-module/src/system.js');
        infoModule(app).then(() => {
            infoModule.__set__({
                settingsDir: './infotestsettings.json'
            });
            done();
        });
    });
    it('Should have all settings loaded', () => {
        var settings = infoModule.__get__('settings');
        settings.current.should.have.property('elements').and.not.be.empty;
    });
    it('Should be able to render info', ()=> {
        infoModule.getMainView().should.not.be.empty;
    });
});

# SolanaPage

SolanaPage is a small, modular new Tab page.
Built with material design guidelines in mind.

## Features

- Modular
- Material design
- Easy to customize
- Easy to write your own modules
- Wallpapers from you favourite subreddits
- Uses server side rendering for fast loading times on slow machines

## Screenshots
Incoming !

## Modules available

- Bookmarks module
    - webpage preview
    - store bookmarks in categories
    - great organization
- Media controls module
    - controll your music player
    - see album cover (spotify only)
- System info module
    - preview realtime information about your system
    - free memory
    - load average
    - system uptime
- Reddit wallpapers module
    - random wallpapers form subreddits
    - customize waht subreddits to use
    - go to reddit post of current wallpaper

## Requirements

- Basic
    - [Node 6.6+](https://nodejs.org/en/download/package-manager/)
    - [Chrome 54+](https://www.google.com/chrome/browser/desktop/index.html)
    - [Firefox 49+](https://www.mozilla.org/pl/firefox/new/)
    - [Forever](https://github.com/foreverjs/forever) `npm install forever -g`
    - [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- Bookmarks module
    - [GraphicsMagick 1.3+](http://www.graphicsmagick.org/README.html)
- Media controls module
    - [Playerctl (or you can use your own comands)](https://github.com/acrisci/playerctl)

## Usage

### Server
#### Instalation

To use the server first install all required packages, then clone the server:
```bash
git clone https://github.com/SolanaFish/SolanaPage.git
cd SolanaPage
```
#### Usage
- To  launch the server `npm start`
- To stop the server run `npm stop`
- To run server just once (without using forever) `npm run debug`
- To run tests `npm run tests` (WIP :< )
    When the server is running go to [http://127.0.0.1:8081/](http://127.0.0.1:8081/) or set it as your home webside.

### How to add modules

- Add new plugin to load
    - Add new object to modules array in app settings file
        ```JSON
        {
            "name": "module-name",
            "active": true,
            "jsEntry": "name-of-main-js-file"
        }
        ```
    - make module's folder tree
        ```bash
        cd modules
        mkdir module-name
        cd module-name
        mkdir src
        mkdir views
        touch package.json
        ```
        Those are all basic files and folders that you'll need to start working on your module.
- Setup `package.json` file
    This file should have name of module, and path to main js file
    ```json
    {
        "name": "module-name",
        "main": "./src/file.js"
    }
    ```
- Required methods and routes
    - Module constructor
        - Contructor should take `express app` object as an only argument.
        ```JavaScript
        module.exports = (app) => {
        };
        ```
    - Module has to implement `getMainView` and `getSettings` methods that return a promise that resolves to html code of main page and settings of a module (or return null if your module doesn't show anyting on settings or main pages)
    ```JavaScript
    module.exports.getSettings = () => {
        return new Promise((resolve, reject) => {
            resolve('<div>SampleText</div>');
        });
    };

    module.exports.getMainView = () => {
        return new Promise((resolve, reject) => {
            resolve('<div>SampleText</div>');
        });
    }
    ```
    - If you specify a route to `/(module-name)/script.js`, then this script will be loaded and executed when loading the page giving you ready entry point for your client side JavaScript.

## License

This project is licensed under [MIT license](LICENSE).

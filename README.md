# SolanaPage

SolanaPage is a small, modular new Tab page. Built with material design guidelines in mind.

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

    - control your music player
    - see album cover (spotify only)

- System info module

    - preview realtime information about your system
    - free memory
    - load average
    - system uptime

- Reddit wallpapers module

    - random wallpapers form subreddits
    - customize what subreddits to use
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

    - [Playerctl (or you can use your own commands)](https://github.com/acrisci/playerctl)

## Usage

### Server

#### Instalation

To use the server first install all required packages, then clone the server:

```bash
git clone https://github.com/SolanaFish/SolanaPage.git
cd SolanaPage
```

#### Usage

- To launch the server `npm start`
- To stop the server run `npm stop`
- To run server just once (without using forever) `npm run debug`
- To run tests `npm run tests` (WIP :< ) When the server is running go to <http://127.0.0.1:8081/> or set it as your home webside.

### How to add modules

- Add new plugin to load

    - Add new object to modules array in app settings file

    ```json
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

- Setup `package.json` file This file should have name of module, and path to main js file

    ```json
    {
        "name": "module-name",
        "main": "./src/file.js"
    }
    ```

- Required methods and routes

    - Module constructor

        - Constructor should take `express app` object as an only argument, and return a promise that is resolved when the module is loaded.

        ```javascript
        module.exports = (app) => {
            return new Promise((resolve, reject) => {
                // Load module
                settings.load();
                // Setup routes using app object
                app.get('/*', (req, res)=> {
                    res.send('k');
                });
                // Resolve the promise
                resolve()
            });
        };
        ```

    - Module has to export `getMainView` method that returns a promise that resolves to html code of main page content of your module:

    ```javascript
    module.exports.getMainView = () => {
        return new Promise((resolve, reject) => {
            resolve('<div>SampleText</div>');
        });
    }
    ```

    - Module has to export `getSettings` method that returns a promise that resolves to html code of settings page content of your module:

    ```javascript
    module.exports.getSettings = () => {
        return new Promise((resolve, reject) => {
            resolve('<div>SampleText</div>');
        });
    };
    ```

    - Module has to export `getScript` method that returns a promise that resolves to JavaScript code that you want to include on the page:

    ```javascript
    module.exports.getScript = function() {
        return new Promise(function(resolve, reject) {
            fs.readFile(`${__dirname}/script.js`, (err, data) => {
                if(err) {
                    resolve();
                } else {
                    resolve(data);
                }
            });
        });
    };
    ```

    - If you don't need some of these elements just return function that returns null

    ```javascript
        // module that doesn't have settings page
        module.exports.getSettings = () => {
            return null;
        }
    ```

## License

This project is licensed under [MIT license](LICENSE).

# SolanaPage

SolanaPage is a small, modular new tab page designed for chrome. Built with material design guidelines in mind. It uses modules to display only information you need.

## Features

- Modular

  - You can enable / disable modules with 1 click
  - You can reorder modules by simply dragging them around

- Design based on material design
- Easy to customize via themes
- Easy to write your own modules
- Wallpapers from you favourite subreddits
- Uses server side rendering for fast loading times on slow machines

## Screenshots

[Screenshots on imgur](http://imgur.com/a/35Lx4)

## Modules available

- Bookmarks module

  - webpage preview
  - store bookmarks in categories
  - great organization
  - two ways of displaying bookmarks

- Media controls module

  - control your music player
  - display title and artist of current song
  - display album cover (spotify only)

- System info module

  - preview realtime information about your system
  - free memory
  - load average
  - system uptime

- Reddit wallpapers module

  - random wallpapers form subreddits
  - customize what subreddits to use
  - go to reddit post of current wallpaper
  - check images for unavailable ones

- Google calendar module

  - lists users upcoming events
  - display events detailed information
  - you can choose what information to display
  - go to events calendar site

- Spotify control module (WIP)

  - work is stopped until [this issue](https://github.com/spotify/web-api/issues/12) gets resolved
  - lists users playlists and songs
  - shows currently playing song
  - control player

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
- To run tests `npm run tests`

When the server is running go to <http://127.0.0.1:8081/> or set it as your home webside.

#### Calendar module

To use this module you have to get your own google api key.

- To do it visit [this site](https://console.developers.google.com/)
- Add new project.
- Add new login
- Add new credentials
- OAuth client ID
- Choose web application
- In `authorized redirect URIs` type: `http://localhost:8081/calendar/callback`
- Click create
- Download json file of yours new credentials and save them in `/SolanaPage/modules/google-calendar-module/oauth.json`

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

  - Module name

    - Moudle should export `niceName` property, that is going to be used as user frendly name. This name is going to be displayed in gui.

      ```javascript
      module.exports.niceName = function() {
        return 'Awesome module 3000';
      };
      ```

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

  - Module has to export `getCss` method that returns a promise that resolves to Css code that you want to include on the page:

    ```javascript
    module.exports.getCss = function() {
      return new Promise(function(resolve, reject) {
          fs.readFile(`${__dirname}/style.css`, (err, data) => {
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

### How to add themes

- To add new theme you have to create new directory in themes folder.

  - Name of that direcotory will be name of the theme.

- Themes directory has to contain file named `variables.css`

  - All other files aren't mandatory
  - `variables.css` file has to contain folowing variables in `:root` selector:

    ```css
    :root {
          /* Theme variables */
          /* Color of apps background */
          --background-color: black;
          /* Accent colors */
          /* Accent 1 is applied to titles and paper cards */
          --accent1-color: rgba(1, 87, 155, 0.8);
          /* Accent 2 is applied to progress bars*/
          --accent2-color: #D81B60;
          /* Accent 3 is applied to fav's title-bar's toggle-buttons and sliders*/
          --accent3-color: #3f51b5;
          /* Material color is applied to all paper-material elements */
          --material-color: rgba(255, 255, 255, 0.85);
          /* Item color is applied to all paper-item elements */
          --item-color: white;
          /* Color applied to light buttons */
          --button-light-color: rgba(255, 255, 255, 0);
          /* Color applied to dark buttons */
          --button-dark-color: #424242;
          /* Color applied to links (regardlessly of theri state) */
          --link-color: black;
          /* Color applied to paper-drawers */
          --drawer-color: white;
          /* Default color of text */
          --text-color:black;
          /* End of Theme variables */
    }
    ```

- If you want to change more than just colors in your theme you can override any other css file

  - To override main css file just place `style.css` file in your themes directory
  - To override modules css file just place file named after module you are theming in your themes directory

    - For example to override bookmarks-module's css just place `bookmarks-module.css` file in your themes directory

## License

This project is licensed under [MIT license](LICENSE).

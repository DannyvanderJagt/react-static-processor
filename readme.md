# Telescope
Write html, create and use React components and output plain html and css!


## Why did you create this?
I wanted to write plain html and still use React Component for rendering. This adds extra functionality to html without the need of a large javascript library on the client.

## Setup
- Go to your project directory.
- Run: `npm i react telescope --save`.
- Create a `ui` and `pages` directory at the root.
- Run `telescope` (at root)

## Usage
Run `telescope` (at root)

## Config
* Create `telescope.config.js`

Fields: 

* `stylesheets` - Array - Add stylesheets to your page.
* `head` - Array - Add html in string format, this is added to each page in the head tag.
* `server` - Object - Add paths for hosting. Format: {'/assets': 'path/to/assets'}

## Create a page
- Create a directory in the pages directory.
- Add a file with the `.tmpl` extention.
- Write some html and use React Components.

## Create a UI Component / React Component
- Create a directory in the `ui` directory. 
- Add an `index.js` file and write your React Component.
- You can add a `style.scss` file to the directory of your component if you want to use stylesheets.
- Start using the component in a page/pages.

**(Only tested with es2015 style components/code)**

## How does this module work?
Under the hood: 

* Telescope compiles all the UI components with babel and react into Es5 javascript.
* Telescope stores the Es5 code in the `.cache` directory. (This is affecting your relative path urls at the moment.)
* Telescope wraps the content a page into a react component which is used for rendering only.
* Telescope will render the page react component and use `react-dom/server` to render it all into plain html.

## Owner
This module is created and owned by Danny van der Jagt.

## Licence
MIT (Feel free to use this module in every way you want)
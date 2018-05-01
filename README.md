# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Foodle_

## Project: Stage 2

### How to run the project

At this stage we will be fetching data from a [API server](https://github.com/udacity/mws-restaurant-stage-2), please follow the instructions to run the API server [here](https://github.com/udacity/mws-restaurant-stage-2#development-local-api-server).

Then, in roder to run the WebApp:

1. Go to project folder and run `npm install`

2. Then, run `gulp` to start a development server or
	2.1 You can also go to the dist folder `cd dist/` and start up a simple HTTP server, Python is a good option:
	- If you have Python 2.x, spin up the server with python -m SimpleHTTPServer 8000 (or some other port, if port 8000 is already in use.)
	- For Python 3.x, you can use python3 -m http.server 8000.

*Image resizing optimization script*

I've included a npm script to resize and optimize project images you can run this script with:

`npm run build-images`

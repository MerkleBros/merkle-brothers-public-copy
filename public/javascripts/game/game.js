//Aliases
//Used to save some typing for referencing long named PIXI properties
let Application = PIXI.Application,
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle;

let app = new PIXI.Application({
	width: 1200, 
	height: 800,
	antialias: true,
	backgroundColor: 0x5b6294,

});

//Append the app to the html body
document.body.appendChild(app.view);

//View dimensions of renderer
// app.renderer.view.width;
// app.renderer.view.height;

//Change dimensions of renderer
// app.renderer.autoResize = true;
// app.renderer.resize(800,600);

// Make renderer fill window
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.autoResize = true;
app.renderer.resize(window.innerWidth, window.innerHeight);

// //Add texture and make sprite from it
// let texture = PIXI.utils.TextureCache["images/owned/85.jpg"];
// let sprite = new PIXI.Sprite(texture);

//PIXI.LOADER is used to load objects
//Can also .add('name', 'images/owned/blah.jpg') to name a resource
// PIXI.loader
// 	.add('images/owned/158.jpg')
// 	.on('progress', loadProgressHandler)
// 	.load(setup);

//Can add multiple files in array, can use progress handler for each file load
// PIXI.loader
// 	.add([
// 		"images/owned/7.jpg",
// 		"images/owned/200.jpg",
// 		"images/owned/132.jpg"
// 	])
// 	.on('progress', loadProgressHandler)
// 	.load(setup);

//Can also add a texture atlas (generated from Texture Packer as a json and associated image)
PIXI.loader
	.add("images/spritesheets/spritesheet-0.json")
	.add("images/spritesheets/spritesheet-1.json")
	.add("images/spritesheets/spritesheet-2.json")
	.add("images/spritesheets/spritesheet-3.json")
	.add("images/spritesheets/spritesheet-4.json")
	.add("images/spritesheets/spritesheet-5.json")
	.add("images/spritesheets/spritesheet-6.json")
	.add("images/spritesheets/spritesheet-7.json")
	.on('progress', loadProgressHandler)
	.load(setup);

function loadProgressHandler(loader, resource) {

  //Display the file `url` currently being loaded
  console.log("loading: " + resource.url); 

  //Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%"); 

  //If you gave your files names as the first argument 
  //of the `add` method, you can access them like this
  //console.log("loading: " + resource.name);
}

function setup() {

	//To generate all images in atlas and place randomly
	// for (i = 1; i < 216; i++) {
	// 	let texture = TextureCache[i + ".jpg"];
	//     let sprite = new Sprite(texture);

	//     let x = randomInt(0, app.renderer.view.width);
	//     let y = randomInt(0, app.renderer.view.height);

	//     sprite.x = x;
	//     sprite.y = y;

	//     sprite.scale.x = 0.3;
	//     sprite.scale.y = 0.3;

	//     app.stage.addChild(sprite);
	// }

	let texture = TextureCache["183.jpg"];
	let sprite = new Sprite(texture);
    sprite.x = 300;
    sprite.y = 300;

	// Opt-in to interactivity
	sprite.interactive = true;

    //Add hand pointer
    sprite.buttonMode = true;
    
	// Pointers normalize touch and mouse
	sprite.on('pointerdown', onClick);

    function onClick() {
    	sprite.alpha=0.5;
    }

    app.stage.addChild(sprite);
	//Code that runs when loader finishes
	//More efficient to make sprite by referencing the loader than 
	//by referencing the image file
	// let cat = new PIXI.Sprite(PIXI.loader.resources["images/owned/7.jpg"].texture);

	//Position cat (x/y props refer to top right corner of sprite)
	// cat.x = 450;
	// cat.y = 450;

	//Change cat width and height
	// cat.width = 300;
	// cat.height = 100;

	//Or change image proportionally:
	// cat.scale.x = 0.3;
	// cat.scale.y = 0.3;

	//Rotate using sprite.rotation
	// cat.rotation = 0.5;
	//Set rotation anchor inside middle of sprite using
	//cat.anchor.x = 0.5;
	// cat.anchor.y = 0.5;

	//Add to stage, the container for all sprites
	// app.stage.addChild(cat);

	//If we wanted the cat to disappear
	// cat.visible = false;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
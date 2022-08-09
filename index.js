const express = require("express")
const bodyparser = require("body-parser")
const path = require("path")
const session = require("express-session")

//initilalize express app

let app = express()

//set up session middelware

app.use(session({
	resave:true,
	saveUninitialized:true,
	secret: 'keyboard cat',
	cookie: {maxAge:9900000}
}))

//set up bodyparsermiddelware

app.use(bodyparser.urlencoded({extended:false}))
app.use(bodyparser.json())


//set host to allow to access

app.use(function (req, res, next) {
	
	// Website you wish to allow to connect
	res.setHeader('Access-Control-Allow-Origin', '*');
	
	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	
	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	
	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);
	
	// Pass to next layer of middleware
	next();
});

//set up public folder

app.use(express.static(path.join(__dirname,"public")))

//set router

let router = require("./src/routers/index")(app)


//start server 

app.listen(process.env.PORT||3001,function(err){
    if(err) throw err
    console.log(`server start at port ${process.env.PORT || 3001} ...`)
})


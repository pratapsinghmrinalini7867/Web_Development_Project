var express        = require("express"),
    bodyParser     = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose       = require("mongoose"),
    flash          = require("connect-flash"),
    passport       = require("passport"),
    LocalStrategy  = require("passport-local"),
    User           = require("./models/user"),
    query          = require("./models/query"),
    app            = express();

// SENDING MAIL USING NODEMAILER
// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//         service:'gmail',
//         auth: {
//             user: 'xyzgmail.com',
//             pass: '**********'
//         }
// });

// var mailOptions = {
//     from: 'xyz@gmail.com',
//     to: 'xyz@gmail.com',
//     subject: 'Congratulations! You have successfully registered',
//     text: 'Hi! You are now the member of Horticulture family. Here you will get the best info about the crops'
// };

// transporter.sendMail(mailOptions,function(error,info){
//     if(error){
//         console.log(error);
//     } else{
//         console.log('Emial sent: '+ info.response);
//     }
// });

mongoose.connect("mongodb://localhost/hort_crop_app");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
mongoose.Promise = require("bluebird");
app.use(express.static(__dirname + "/public"));
app.use(flash());

//PASSPORT CONFIGRATION
app.use(require("express-session")({
    secret: "I am smart",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// A middleware to pass currentUser in all routes
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//==========
//Routes
//==========

app.get("/", function(req, res){
    res.render("landing");
});

app.get("/index", function(req, res){
    res.render("index");
});

//AUTH ROUTE

//sign up routes
// show sign up form
app.get("/register", function(req, res){
    res.render("register");
});
//handling sign in form
app.post("/register", function(req, res){
    var newUser = new User({username:req.body.username, email: req.body.email});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Horticulture " + user.username + "!");
            res.redirect("/index");
        });
    });
});

//login routes
//show login form
app.get("/login", function(req, res){
    res.render("login");
});

//login logic
app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/index",
        failureRedirect: "/login"
    }), function(req, res){

});

//logout route
app.get("/logout", function(req, res){
    req.flash("success", "Logged you out!");
    req.logout();
    res.redirect("/index");
});

//management route
app.get("/management", isLoggedIn, function(req, res){
    res.render("management");
});

//market route
app.get("/market", isLoggedIn, function(req, res){
    res.render("market");
});

//inquiry form
app.get("/inquiry",isLoggedIn, function(req, res){
    res.render("inquiry");
});
app.post("/inquiry",isLoggedIn, function(req,res){
    var question = req.body.question;
    return res.redirect("/index");
});

//middleware to check if user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
}

app.listen(3000, function(){
    console.log("Horticulture app server has started...");
});
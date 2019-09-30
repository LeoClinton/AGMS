const mysql= require('mysql');
const express=require('express');
const session=require('express-session');
const morgan=require('morgan');
const passport=require('passport');
const path =require('path');
const hbs = require('express-handlebars');
const ejs = require('ejs');
const multer = require('multer');
//const expresssessions = require('express-session');


const cookieParser = require('cookie-parser');
const flash=require('connect-flash');
const LocalStrategy = require('passport-local').Strategy; 

const expressvalidator=require('express-validator'); 
const nodemailer = require('nodemailer');

var app=express();
//require('./passport')(passport)

// const admin = {
//     Adminid = 'admin',
//     Adpassword = 'admin'
// }
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('myImage');

// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// EJS
app.set('view engine', 'ejs');

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('art-upload.ejs', {
                msg: err
            });
        } else {
            if (req.file == undefined) {
                res.render('art-upload.ejs', {
                    msg: 'Error: No File Selected!'
                });
            } else {
                res.render('art-upload.ejs', {
                    msg: 'File Uploaded!',
                    file: `uploads/${req.file.filename}`
                });
            }
        }
    });
});
const TWO_HOURS= 1000 * 60 * 60 * 2

var router=express.Router();

const { 
    PORT = 3000,
    SESS_NAME='sid',
    SESS_SECRET='ssshhhh',
    NODE_ENV = 'development',
    SESS_LIFETIME= TWO_HOURS

} = process.env


const IN_PROD =NODE_ENV === 'production' 

require('./config/passport')(passport);

const bodyparser=require('body-parser');
app.use(express.static('./views'))
app.use(cookieParser());

app.use(morgan('dev'));

//view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts' }));

app.set('view engine', 'hbs');
//for user login
//var authenticateController=require('./user');

//code used to receive decent data.
//app.set('view engine', 'ejs');

//app.engine('html', require('ejs').renderFile);

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}))

app.use(session({ 
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie : {
        maxAge: SESS_LIFETIME,
        sameSite: true, 
        secure: IN_PROD

    }
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());



require('./app/routes.js')(app, passport, hbs, nodemailer);

// require('./nodemail/mail.js')( nodemailer );


app.listen(PORT,()=> console.log("server 3000 port is running . . .")); 


// module.exports= nodemailer;

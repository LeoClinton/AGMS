var LocalStrategy = require("passport-local").Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

module.exports = function(passport) {
 passport.serializeUser(function(user, done){
  done(null, user.userid);
  console.log(user.userid);
  
 });

 passport.serializeUser(function(user, done){
  done(null, user.username);
  console.log(user.username);
  
 });

 passport.deserializeUser(function(userid, done){
  connection.query("SELECT * FROM customer WHERE userid = ? ", [userid],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.deserializeUser(function(userid, done){
  connection.query("SELECT * FROM artist WHERE userid = ? ", [userid],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.deserializeUser(function(username, done){
  connection.query("SELECT * FROM admintable WHERE username = ? ", [username],
   function(err, rows){
    done(err, rows[0]);
   });
 });
 
 

 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
   connection.query("SELECT * FROM customer WHERE c_email = ? ", [email],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));

    return done(null, rows[0]); 
   });
  })
 );

 passport.use(
  'local-adminlogin',
  new LocalStrategy({
   usernameField : 'username',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, username, password, done){
   connection.query("SELECT * FROM admintable WHERE username = ? ", [username],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    if(password != rows[0].password)
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));

    return done(null, rows[0]);
   });
  })
 );
  
 passport.use(
  'local-sellerlogin',
  new LocalStrategy({
   usernameField : 'email',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, email, password, done){
   connection.query("SELECT * FROM artist WHERE a_email = ? ", [email],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));

    return done(null, rows[0]);
   });
  })
 );
};

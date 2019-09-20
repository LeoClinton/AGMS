var bcrypt = require('bcrypt-nodejs');
var mysql = require('mysql');
var dbconfig = require('../config/database');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var async = require('async');
const flash=require('flash');
//var express = require('express');


//var router = express.Router();




var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);



module.exports= (app, passport, hbs) => {

    //app.use(flash());

    //app.set('default', __dirname + '/default');

     app.get('/', (req, res) => {
         res.render('indexmain.hbs');

     });

    app.get('/cust_login', function(req, res){
        res.redirect('/web/index.html')
        //res.render('/web/index.html', {message:req.flash('loginMessage')});
       });

       app.post('/cust_login', passport.authenticate('local-login', {
        successRedirect: '/index-1',
        failureRedirect: '/cust_login',
        failureFlash: true
       }),

       function(req, res){
        if(req.body.remember){
         req.session.cookie.maxAge = 1000 * 60 * 3;
        }else{
         req.session.cookie.expires = false;
        }
        res.redirect('/');
       });

       app.get('/seller_login', (req, res) => {

        res.redirect('web/seller.html');

       })

       app.post('/seller_login', passport.authenticate('local-sellerlogin', {
           successRedirect: '/seller',
           failureRedirect: '/seller_login',
           failureFlash: true
       }),
        function(req, res){
            if(req.body.remember){
            req.session.cookie.maxAge = 1000 * 60 * 3;
            }else{
            req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

        app.get('/seller_login', (req, res) => {

            res.redirect('web/seller.html');

        }

       )

       app.get('/seller', isLoggedIn, (req, res) => {
           
            res.render('artistmain.hbs', {message:req.flash('loginMessage'), name : req.user.a_namef });

            // { name : req.user.a_namef }

           //res.redirect('/artistmain.html');

       })

       app.get('/cust_create', function(req, res){
        //res.render('/web/Reg/web/index.html', {message: req.flash('signupMessage')});
        res.redirect('/web/Reg/web/index.html');

       });

       /*
       app.post('/cust_create', passport.authenticate('local-signup', {
        successRedirect: '/web/index.html',
        failureRedirect: '/cust_create',
        failureFlash: true
       }));
       */
      app.post('/cust_create', (req, res ) => {

        console.log('creating a customer det');

        //console.log(" the name is  "+req.body.first_name);
    
        var custid = req.body.cust_id;
        var fisrtname = req.body.first_name;
        var lastname = req.body.last_name;
        var email = req.body.email;
        var password = req.body.pswd;
        var gender = req.body.selector1;
        var phonenumber = req.body.phone_number;
        var address = req.body.address;
        var code = req.body.zip_code;
        var place = req.body.place;

        var newUserMysql = {
            email : email,
            password : bcrypt.hashSync(password, null, null)
        }
    
        var thequery = "INSERT INTO customer (c_namef, c_namel, c_email, password, c_gender, c_phoneno, c_address, zipcode, c_place) VALUES (?,?,?,?,?,?,?,?,?)";
    
        connection.query(thequery, [fisrtname, lastname, newUserMysql.email , newUserMysql.password , gender, phonenumber, address, code, place], (err, result, fields) => {
    
            if (!err) {
                console.log('Customer Data inserted ');
    
            } else {
                console.log('request failed ' + err);
                res.end();
    
            }
        });
    
        res.redirect('/web/index.html');
      })

      app.post('/artist_create', (req, res ) => {

            console.log('creating artist...');

        var fisrtname=req.body.first_name;
        var lastname=req.body.last_name;
        var email=req.body.email;
        var password=req.body.password;
        
        var phonenumber=req.body.phone_number;
        var address=req.body.address;
        
        var place=req.body.place;

        var newUserMysql = {
            email : email,
            password : bcrypt.hashSync(password, null, null)
        }

        var thequery="INSERT INTO artist (a_namef, a_namel, a_email, password, a_phoneno, a_address, a_place) VALUES (?,?,?,?,?,?,?)";

        connection.query(thequery,[fisrtname, lastname,newUserMysql.email, newUserMysql.password, phonenumber, address, place], (err, result,fields)=>
        {
            if(!err)        
            {
                console.log('Artis Data inserted ');

            }
            else
            {
                console.log('request failed '+err);
                res.end();

            }
            });

            res.redirect('/web/seller.html');
        })

       app.get('/index-1', isLoggedIn, (req, res) => {

        const name = req.user;

         res.render('custmain.hbs', { name : req.user.c_namef });

         console.log('this is the value  '+name);

        //res.redirect('/custmain.html');
       });

       app.get('/logout', function(req,res){
        req.logout();
        res.redirect('/');
       })

       //admin login routes
       app.get('/admin_login', (req, res) => {
           res.redirect('/web/adminlogin.html');

       })

       app.post('/admin_login', passport.authenticate('local-adminlogin', {
            successRedirect: '/admin',
            failureRedirect: '/admin_login',
            failureFlash: true
        }),
        function(req, res){
            if(req.body.remember){
            req.session.cookie.maxAge = 1000 * 60 * 3;
            }else{
            req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

        app.get('/admin', (req, res) => {

            res.render('adminworkspace.hbs');

        })

        //getting artist details that will be displayed to the ADMIN
       app.get('/artist_details', (req, res) => {
        const myquery = "select userid, a_namef, a_phoneno, a_email from artist ";

        connection.query(myquery, (err, result, fields ) => {

            if(!err)
            {
                //console.log('Query result :- '+ result[0]);
                
               // console.log(fields);

                res.render('web/artistdetails.hbs', { data : result });
                //res.render('web/artistdetails.hbs', {data : result })
                
            }
            else
            {
                res.render('adminworkspace.hbs');

            }

        })
           
       })

       app.get('/customer_details', (req, res ) => {

            const myquery = " SELECT userid, c_namef, c_phoneno, c_email FROM customer";

            connection.query(myquery, (err, result, field ) => {
                if(!err)
                {
                    res.render('customerdetails.hbs', { data : result });

                }
                else
                {
                    res.render('adminworkspace.hbs');


                }
            })
       })

       
    //    app.get('/artist_details', (req, res) => {

    //     //sele
    //    })




       // password forgot session

       app.get('/cust_forgot', (req ,res ) => {
           res.redirect('/web/Forgot_Pass/web/custforgot.html');

       })

       app.post('/cust_forgot', (req, res )=> {
           email= req.body.email;

        const myquery = "SELECT c_email FROM customer WHERE c_email = ? ";

        connection.query(myquery, [email], (err, result, field ) => {
            if(!err)
            {
                console.log('data - ' +result[0]);

            }
            else
            {
                res.redirect('/web/Forgot_Pass/web/custforgot.html')
            }

            res.redirect('/web/Forgot_Pass/web/reset_password_cust.html')

        })
       }
       )

       app.post('/artist_forgot', (req, res )=> {
        email= req.body.email;

        const myquery = "SELECT a_email FROM artist WHERE a_email = ? ";

        connection.query(myquery, [email], (err, result, field ) => {
            if(!err)
            {
                console.log('data - ' +result);

            }
            else
            {
                res.redirect('/web/Forgot_Pass/web/artistforgot.html')
            }

            res.redirect('/web/Forgot_Pass/web/reset_password.html')

        })
        }
        )

       
        app.get('/custmain', (req, res )=> {
            res.render('custmain.hbs');

        })

        app.get('/artistmain', (req, res) => {
            res.render('artistmain.hbs')
        })


        app.post('/artistupload', (req, res) => {
            id=req.body.imgid;
            img=req.body.fileupload;

            const myquery="INSERT INTO gallery (g_id, g_images) VALUES (? ,?) ";

            connection.query(myquery, [ id , img ], (err, result, field) => {
                if(!err)
                {
                    console.log('Image insterted');
                    res.redirect('/artist-upload.html');
                }
                else
                {
                    console.log(err);

                }
            })
        })

        
        app.post('/resetcust',(req, res) => {
            email=req.body.email;
            pass=req.body.password;

            myquery="UPDATE customer SET password = ? WHERE c_email= ?";
            
        })

};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/'); 
   }
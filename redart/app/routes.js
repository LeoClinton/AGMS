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



module.exports= (app, passport, hbs,  nodemailer) => {



    //app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + './views/layouts' }));

    app.set('view engine', 'hbs');
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
           
            res.render('artistmain.hbs', { name : req.user.userid });

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
    
         res.render('custmain.hbs', { name : req.user.userid,  });
         //req.session.name=c_namef; 
        

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
        function(req, res)
        {
            if(req.body.remember)
            {
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
           res.render('web/Forgot_Pass/web/custforgot.hbs');

       })

       app.get('/artist_forgot' , (req, res ) => {
        res.render('web/Forgot_Pass/web/artistforgot.hbs');
    })

       app.post('/cust_forgot',(req, res ) => {

        const cemail= req.body.email;

        const myquery = "SELECT c_email FROM customer WHERE c_email = ? ";

        connection.query(myquery, [cemail], (err, result, field ) => {
            let rows;
            if (err) {
                console.log('error --->' + err)

            } else {
                rows = result.length;

                if (rows > 0) {
                    console.log('this is right :- ' + result);

                    res.render('web/Forgot_Pass/web/reset_password_cust.hbs', {message: ' Email verified'});
                } else
                    {
                    res.render('web/Forgot_Pass/web/custforgot.hbs', {fail: ' Email not yet registered '});
                }

            }
            
            // res.redirect('/web/Forgot_Pass/web/reset_password_cust.html')

        })
    })

       app.post('/artist_forgot', function(req, res ) {
        const email= req.body.email;

       let myquery = 'SELECT a_email FROM artist WHERE a_email = ? ';

        connection.query( myquery , [email], (err, result) => {
            let rows;
            if(err)
            {
                throw err;

            }
            else
            {
               rows = result.length;

               if(rows > 0)
               {
                   res.render('web/Forgot_Pass/web/reset_password_art.hbs', {message : ' Email verified'} );
               }
               else
               {
                   res.render('web/Forgot_Pass/web/artistforgot.hbs', { fail : ' User not Registered'});
               }
            }




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
            aid=req.body.aid;
            imgid=req.body.imgid;

            img=req.body.fileupload;
            name=req.body.name;
            date=req.body.date;
            dest=req.body.dest;
            cost=req.body.cost;


            const myquery="INSERT INTO gallery (a_id, g_id, g_images, g_name, g_date, g_des, g_cost) VALUES (?, ?, ?, ?, ?, ?, ?) ";

            connection.query(myquery, [ aid, imgid , img, name, date,  dest, cost ], (err, result, field) => {
                if(!err)
                {
                    if(req.file == undefined)
                    {
                        res.render('artistmain.hbs', {upload : 'File not selected'})
                    }
                    else
                    {

                        console.log('Image insterted');
                        res.render('artistmain.hbs', { upload : 'File uploaded' });
                    }
                }
                else
                {
                    console.log(err);

                }
            })
        })

    app.get('/gallery', (req, res) => {

        const myquery = "SELECT g_images FROM gallery";

        connection.query(myquery,(err , result ) => {
            if(err)
            {
                throw err;
            }
            else
            {
                console.log(result);

                res.render('gallery.hbs',{ view : result });
            }
        })

    })

        //send mails to the particular customer
        app.post('/resetcust',(req, res) => {
            email=req.body.email;
            pass=req.body.password;

            var newUserMysql = {
                email : email,
                password : bcrypt.hashSync(pass, null, null)
            }

            myquery="UPDATE customer SET password = ? WHERE c_email= ?";

            connection.query(myquery,[ newUserMysql.password , newUserMysql.email ], ( err, result, fields) =>
            {
                if(!err)
                {
                    console.log(" The data modified ");
                }    
                else
                {
                     res.redirect('/web/Forgot_Pass/web/custforgot.html')

                }
                res.redirect('/cust_login')    
            })
            
        })

        app.post('/resetartist',(req, res) => {
            email=req.body.email;
            pass=req.body.password;

            var newUserMysql = {
                email : email,
                password : bcrypt.hashSync(pass, null, null)
            }

            myquery="UPDATE artist SET password = ? WHERE a_email= ?";

            connection.query(myquery,[ newUserMysql.password , newUserMysql.email ], ( err, result, fields) =>
            {
                if(!err)
                {
                    console.log(" The data modified ");
                }    
                else
                {
                    res.redirect('/web/Forgot_Pass/web/artistforgot.hbs')
                }
                res.redirect('/seller_login')    
            })
            
        })


        app.get('/cust_delete', (req, res) => {
            res.render('customer_delete.hbs');
            
        } )

    app.post('/cust_delete', (req, res) => {

        let rows;
        const Userid=req.body.id;

        const selq="SELECT * FROM customer WHERE userid = ? ";

        connection.query(selq, [Userid], (err, result) => {
            if(err)
            {
                throw err;

            }
            else
            {
                rows=result.length;

                if(rows > 0)
                {
                    const delquery=" DELETE FROM customer WHERE userid = ?";

                    connection.query(delquery, [Userid], (err, result, field) => {
                        if(err)
                        {
                            throw err;
                        }
                        else
                        {
                            console.log("Deleted customer ");
                            //res.send({delcom : "Customer deleted "});
                            res.redirect('/customer_details');

                        }
                    } )
                }
                else
                {
                    res.render('customer_delete.hbs', { delcom : " User not found "});
                }
            }
        })

    })

    app.get('/art_delete', (req, res)=> {
        res.render('artist_delete.hbs');
    })

    app.post('/art_delete', (req, res) => {
        const Userid=req.body.id;

        const selq = "SELECT * FROM artist WHERE userid = ?";

        connection.query(selq, [Userid], (err, result) =>{
            let rows;
            if(err)
            {
                throw err;
            }
            else
            {
                rows=result.length;
                if(rows > 0)
                {
                    const delquery=" DELETE FROM artist WHERE userid = ?";
                    connection.query(delquery, [Userid], (err, result) => {

                        if(err)
                        {
                            throw err;
                        }
                        else
                        {
                                console.log("Deleted artist "+ result );
                                res.redirect('/artist_details');
                        }
                    } )
                }
                else
                {
                    console.log("Deleted artist "+ result );
                    res.render('artist_delete', { delcom : " User not found "});
                }
            }
        })



    })

    app.get('/imageupload', (req, res ) => {
        res.render('artist-upload.hbs');
    })



};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
     return next();
   
    res.redirect('/'); 
   }
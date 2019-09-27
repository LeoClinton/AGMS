module.exports= (nodemailer) => 
{
    let transport = nodemailer.createTransport({
        host: 'smtp.mailtrapp.io',
        post: 2525,
        auth : {
            user : "leo",
            pass : "leo",
        }
    });

    const message = {
        from : 'leoclinton@gmail.com',
        to : 'leoclinton97@gmail.com',
        subject : 'This is the test mail',
        text : 'If this is successfull then you are the best'
    };

    transport.sendMail(message, (err, info ) => {
        if(!err)
        {
            console.log(info);
        }
        else
        {
            console.log(err);

        }
    })
}
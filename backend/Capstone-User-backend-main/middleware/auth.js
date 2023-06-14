const jwt = require('jsonwebtoken');


SECRET = process.env.SECRET||'qwerty';
const Auth = {
    verifyToken(req, res, next){
        // const {token = req.cookies['JWT']
        const token = req.body.token || req.cookies['JWT']
        if (token) {
            try {
                //jwt verifying 
                const verified = jwt.verify(token,SECRET);
                req.verified = verified;
                console.log("Succesfully Verified!");
                next()
            } catch(err) {
                //handle error if acces denied
                res.status(401).send(err)
                console.log('Invalid Token!');
            }
        } else {
            res.status(403).send({message: 'Youre not authenticated, please login first'})
            console.log('Youre not authenticated');
        }
    }
}

module.exports = Auth;
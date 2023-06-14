const db = require('../database/db.config')
const jwt = require('jsonwebtoken');
// const Auth = require('./auth')
require("dotenv").config();
const bcrypt = require('bcrypt');
SECRET = process.env.SECRET||'qwerty';

const test = async(req,res,next) =>{
    try {
        return res.status(201).send('network complete');
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
const register = async(req, res, next) => {
    const{name,email,password,phone,}= req.body;
    let errors = []
    if (!name || !email || !password || !phone){
        errors.push({ message: "Please enter all fields" });
    }
    if(errors.length > 0) {
        res.status(500).send({ errors });
    }else{
        const hashed_pwd = await bcrypt.hash(password,10)
        const result = await db.query(`SELECT * from student where email=$1;`,[email],(err,results)=>{
            if (results.rows.length > 0) {
                errors.push({ message: 'Email already registered' });
                return res.status(500).send({ errors });
            }else{
                try {
                    db.query(`INSERT INTO student(studentid,name,email,password,phone) VALUES (DEFAULT,$1,$2,$3,$4);`,[name,email,hashed_pwd,phone],function (err, results){
                        if (err) {
                            return res.status(500).json({error: err});
                        }
                        else {
                            return res.status(201).send('data added succesfully!');
                        }
                    })
                } catch (errors) {
                    res.send('Input failure!')
                }
            }
        })
    }
}

const login = async(req, res, next) => {
    const{email,password}= req.body;
    try {
        const user = await db.query(`SELECT * FROM student where email=$1;`,[email])
        //check if user is exist
        if(user.rowCount>0){
            // check password
            const validPass = await bcrypt.compare(password,user.rows[0].password)
            //check if password is match
            if (validPass) {
                // Generate token for jwt sign
                let jwtSecretKey = process.env.SECRET;
                let data = {
                    studentid: user.rows[0].studentid,
                    username: user.rows[0].username,
                    email:user.rows[0].email,
                    password:user.rows[0].password,
                    phone:user.rows[0].phone
                }
                const token = jwt.sign(data, jwtSecretKey);
                // return nilai id, email, username,phone
                res.cookie("JWT", token, {httpOnly: true,sameSite: "strict"}).status(200).json({
                    studentid: user.rows[0].studentid,
                    username: user.rows[0].username,
                    email:user.rows[0].email,
                    phone:user.rows[0].phone,
                    token:token
                    });
            } else {
                return res.status(400).send('wrong pass!')   
            }
        }else{
            return res.status(400).json({
                error: "User is not registered, Sign Up first",
            })
        }
    } catch (error) {
        return res.send('login failed')
        
    }
}

const insertQuiz = async(req, res, next) => {
    const{ quiztypeid, soal, link_video, opsi1, opsi2, opsi3, jawaban}= req.body;
    try {
        db.query(`INSERT INTO quiz (id_quiz, quiztypeid, soal, link_video, opsi1, opsi2, opsi3, jawaban) VALUES (DEFAULT,$1,$2,$3,$4,$5,$6,$7);`,[quiztypeid, soal, link_video, opsi1, opsi2, opsi3, jawaban],function (err, results){
            if (err) {
                return res.status(500).json({error: err});
            }
            else {
                return res.status(201).send('data added succesfully!');
            }
        })
    } catch (error) {
        res.send('Input failure!')
    }
}

const insertQuizType = async(req, res, next) => {
    const{ namaquiz}= req.body;
    try {
        db.query(`INSERT INTO quiztype (quiztypeid, namaquiz) VALUES (DEFAULT,$1);`,[namaquiz],function (err, results){
            if (err) {
                return res.status(500).json({error: err});
            }
            else {
                return res.status(201).send('data added succesfully!');
            }
        })
    } catch (error) {
        res.send('Input failure!')
    }
}
const getquiz = async (req, res, next) => {
    const {namaquiz} = req.body;
    try {
        const quiz = await db.query(
            `SELECT q.ID_quiz, q.Soal, q.link_video, q.opsi1, q.opsi2, q.opsi3, q.jawaban
            FROM Quiz q
            JOIN QuizType ON q.QuizTypeID = QuizType.QuizTypeID
            WHERE QuizType.namaQuiz = $1;`,[namaquiz]
            );
        let data = quiz.rows;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
const getQuizType = async (req, res, next) => {
    try {
        const dict = await db.query(`SELECT * from quiztype;`);
        let data = dict.rows;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const insertDict = async(req, res, next) => {
    const{ name, link}= req.body;
    try {
        db.query(`INSERT INTO dictionary (id_word,name,link ) VALUES (DEFAULT,$1,$2);`,[name,link],function (err, results){
            if (err) {
                return res.status(500).json({error: err});
            }
            else {
                return res.status(201).send('data added succesfully!');
            }
        })
    } catch (error) {
        res.send('Input failure!')
    }
}

const getdict = async (req, res, next) => {
    try {
        const dict = await db.query(`SELECT * FROM dictionary;`);
        let data = dict.rows;
        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};



const logout = async(req, res, next) => {
    try {
        // code clean token from cookies and 
        return res.clearCookie('JWT').send('Logout Succesfull')
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)
    }
}

const verify = async(req, res, next) => {
    try {
        // verifying
        const data = req.verified
        return res.status(200).json(data)
        
    } catch (err) {
        console.log(err.message);
        return res.status(500).send(err)    
    }
}

module.exports = {
    test,
    register,
    login,
    logout,
    verify,
    insertQuiz,
    insertQuizType,
    insertDict,
    getdict,
    getquiz,
    getQuizType
}


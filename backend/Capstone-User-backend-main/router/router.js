const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const Auth = require('../middleware/auth')
const { route } = require('..')

router.get('/', userController.test)

router.get('/get/dict',userController.getdict)

router.get('/get/type',userController.getQuizType)

router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/logout', Auth.verifyToken, userController.logout)

router.post('/verify', Auth.verifyToken, userController.verify)

router.post('/insert/quiz',userController.insertQuiz)

router.post('/insert/quiztype',userController.insertQuizType)

router.post('/insert/dict',userController.insertDict)

router.post('/get/quiz',userController.getquiz)



module.exports = router
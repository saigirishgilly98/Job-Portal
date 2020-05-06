const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = mongoose.model("User")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../keys')
const requireLogin = require('../middleware/requirelogin')

router.get('/protected', requireLogin, (req, res) => {
    res.send("Hello USer")
})

router.post('/signup', (req, res) => {
    const { name, email, password } = req.body
    if (!email || !password || !name) {
        return res.status(422).json({ error: "Please add all the fields" })
    }
    User.findOne({ email: email })
        .then((savedUSer) => {
            if (savedUSer) {
                return res.status(422).json({ error: "User already exists with that email" })
            }
            bcrypt.hash(password, 12)
                .then(hashedpassword => {
                    const user = new User({
                        email,
                        password: hashedpassword,
                        name
                    })

                    user.save()
                        .then(user => {
                            res.json({ message: "Saved Successfully" })
                        })
                        .catch(err => {
                            console.log(err)
                        })
                })

        }).catch(err => {
            console.log(err)
        })
})

router.post('/signin', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        res.status(422).json({ error: "Please provide all fields" })
    }
    User.findOne({ email: email })
        .then(savedUSer => {
            if (!savedUSer) {
                return res.status(422).json({ error: "Invalid email or password" })
            }
            bcrypt.compare(password, savedUSer.password)
                .then(doMatch => {
                    if (doMatch) {
                        // res.json({ message: "Successfully Signed In" })
                        const token = jwt.sign({ _id: savedUSer._id }, JWT_SECRET)
                        res.json({ token })
                    } else {
                        return res.status(422).json({ error: "Invalid email or password" })
                    }
                })
                .catch(err => { console.log(err) })
        })
})

module.exports = router
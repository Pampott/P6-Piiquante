const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.signup = (req, res) => {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash,
        })

        user.save()
        .then(() => res.status(201).json({ message: "Compte créé !"}))
        .catch((error) => res.status(400).json({error}));
    })
    .catch((error) => res.status(500).json({message: error}));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if(!user) {
            return res.status(401).json( {message: "Identifiants incorrects"} )
        } else {
            return res.status(200).json({
                userId: user._id,
                token: user._id + "TOKEN",
            })
        }
    })
    .catch()
}
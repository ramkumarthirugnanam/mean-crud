// routes/auth.routes.js

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const userRoute = express.Router();
const userSchema = require("../models/User");
const empSchema = require("../models/Employee");
const authorize = require("../middlewares/auth");
const { check, validationResult } = require('express-validator');

// Sign-up
userRoute.post("/register-user",
    [
        check('name')
            .not()
            .isEmpty()
            .isLength({ min: 3 })
            .withMessage('Name must be atleast 3 characters long'),
        check('email', 'Email is required')
            .not()
            .isEmpty(),
        check('password', 'Password should be between 5 to 8 characters long')
            .not()
            .isEmpty()
            .isLength({ min: 5, max: 8 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
            return res.status(422).jsonp(errors.array());
        }
        else {
            bcrypt.hash(req.body.password, 10).then((hash) => {
                const user = new userSchema({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash
                });
                user.save().then((response) => {
                    res.status(201).json({
                        message: "User successfully created!",
                        result: response
                    });
                }).catch(error => {
                    res.status(500).json({
                        error: error
                    });
                });
            });
        }
    });


// Sign-in
userRoute.post("/signin", (req, res, next) => {
    let getUser;
    userSchema.findOne({
        email: req.body.email
    }).then(user => {
        if (!user) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        getUser = user;
        return bcrypt.compare(req.body.password, user.password);
    }).then(response => {
        if (!response) {
            return res.status(401).json({
                message: "Authentication failed"
            });
        }
        let jwtToken = jwt.sign({
            email: getUser.email,
            userId: getUser._id
        }, "longer-secret-is-better", {
            expiresIn: "1h"
        });
        res.status(200).json({
            token: jwtToken,
            expiresIn: 3600,
            _id: getUser._id
        });
    }).catch(err => {
        return res.status(401).json({
            message: "Authentication failed"
        });
    });
});

// Get Users
userRoute.route('/users').get((req, res) => {
    userSchema.find((error, response) => {
        if (error) {
            return next(error)
        } else {
            res.status(200).json(response)
        }
    })
})

// Get Single User
userRoute.route('/user-profile/:id').get(authorize, (req, res, next) => {
    userSchema.findById(req.params.id, (error, data) => {
        if (error) {
            return next(error);
        } else {
            res.status(200).json({
                msg: data
            })
        }
    })
})


// Add User
userRoute.route('/create').post((req, res, next) => {
    empSchema.create(req.body, (error, data) => {
    if (error) {
    return next(error)
} else {
    console.log("create .....",data)
    res.json(data)
}

})
});

// Get All User
userRoute.route('/').get((req, res) => {
    empSchema.find((error, data) => {
    if (error) {
    return next(error)
} else {
    res.json(data)
}
})
})

// Get single User
userRoute.route('/read/:id').get((req, res) => {
    empSchema.findById(req.params.id, (error, data) => {
    if (error) {
    return next(error)
} else {
    res.json(data)
}
})
})


// Update User
userRoute.route('/update/:id').put((req, res, next) => {
    empSchema.findByIdAndUpdate(req.params.id, {
    $set: req.body
}, (error, data) => {
    if (error) {
    return next(error);
    console.log(error)
} else {
    res.json(data)
    console.log('Data updated successfully')
}
})
})

// Delete User
userRoute.route('/delete/:id').delete((req, res, next) => {
    empSchema.findOneAndRemove(req.params.id, (error, data) => {
    if (error) {
    return next(error);
} else {
    res.status(200).json({
        msg: data
    })
}
})
})


module.exports = userRoute;

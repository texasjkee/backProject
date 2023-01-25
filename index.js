import express from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { registerValidatior } from './validations/auth.js';

import UserModel from './models/User.js';

const app = express();

const URL = 'mongodb+srv://texas:Mongodb333@cluster0.fjujydy.mongodb.net/BackProject?retryWrites=true&w=majority';
const PORT = 3000;

mongoose
  .connect(URL)
  .then(() => {
    console.log('DB ok')
  })
  .catch((err) => console.log('DB error', err));

app.use(express.json())


app.listen(PORT, (err) => {
  if(!err) {
    return  console.log('Server OK!!!')
  } else console.log(err)
})

app.post('/auth/register', registerValidatior, async (req, res) => {
  try {
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
  
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const doc = new UserModel ({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash 
    })

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret333',
      {
        expiresIn: '30d'
      }
    )

    const {passwordHash, ...userData} = user._doc;

    res.json({
      ...userData,
      token,
    });
      
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Failed to register"
    })
  }
})

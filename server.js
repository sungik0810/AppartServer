const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')

app.use(express.json())
//lib config
dotenv.config()

//env setting
app.set('PORT', process.env.PORT)
app.set('DB_CONNECT', process.env.DB_CONNECT)

mongoose.set('strictQuery', false)
mongoose
  .connect(`${app.get('DB_CONNECT')}`)
  .then(() => {
    console.log('MongoDB Connected.')
    // port Open
    app.listen(app.get('PORT'), () => {
      console.log(`listening on ${app.get('PORT')}`)
    })

    // api
    app.use('/api/auth', require('./routes/api/auth/kakaoSocialLogin'))
    app.use('/api/user', require('./routes/api/user/detail'))
  })
  .catch((err) => {
    console.log(err)
  })

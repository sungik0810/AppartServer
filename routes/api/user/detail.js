const express = require('express')
const router = express.Router()
// const axios = require('axios')
const UserModel = require('../../../models/UserModel')
const { userInfoPublic } = require('../../../controller/commonLoginUtil')

router.post('/detail', async (req, res) => {
  const modifyData = req.body
  const social_id = req.body.socialId
  const address = req.body.address
  const detail_address = req.body.detailAddress
  const building_name = req.body.buildingName
  const building_password = req.body.buildingPassword
  console.log(modifyData)
  let user
  try {
    user = await UserModel.findOneAndUpdate(
      { social_id: social_id },
      {
        $set: {
          address: address,
          detail_address: detail_address,
          building_name: building_name,
          building_password: building_password,
        },
      }
    )
  } catch (e) {
    console.log('error')
  }
  try {
    const modified = await UserModel.findOne({ social_id: social_id })
    console.log('modified', userInfoPublic(modified))
    return res.send(userInfoPublic(modified))
  } catch (e) {}
})
module.exports = router

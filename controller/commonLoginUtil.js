require('dotenv').config()

module.exports = {
  userInfoPublic: (userData) => {
    const userInfo = {
      social_id: userData.social_id,
      email: userData.email,
      nickname: userData.nickname,
      gender: userData.gender,
      age: userData.age,
      address: userData.address,
      detail_address: userData.detail_address,
      building_name: userData.building_name,
      building_password: userData.building_password,
      payment_state: userData.payment_state,
    }
    return userInfo
  },
  userInfoPrivate: (userData) => {
    const userInfo = {
      social_id: userData.social_id,
      email: userData.email,
      nickname: userData.nickname,
      gender: userData.gender,
      age: userData.age,
      address: userData.address,
      detail_address: userData.detail_address,
      building_name: userData.building_name,
      building_password: userData.building_password,
      payment_state: userData.payment_state,
      refresh_token: userData.refresh_token,
    }
    return userInfo
  },
}

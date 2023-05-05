require('dotenv').config()
const qs = require('qs')
const { kakaoOpt } = require('../config/config')

module.exports = {
  kakaoOuthOptions: (code) => {
    const Options = qs.stringify({
      grant_type: 'authorization_code',
      client_id: kakaoOpt.clientId,
      client_secret: kakaoOpt.clientSecret,
      redirect_uri: kakaoOpt.redirectUri,
      code: code,
    })
    return Options
  },
  kakaoOuthRefreshOptions: (refresh_token) => {
    const refreshOptions = qs.stringify({
      grant_type: 'refresh_token',
      client_id: kakaoOpt.clientId,
      client_secret: kakaoOpt.clientSecret,
      refresh_token: refresh_token,
    })
    return refreshOptions
  },
  ACCESS_TOKEN_CHECK: (ACCESS_TOKEN) => {
    const Header = {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    }
    return Header
  },
  kakaoLoginURL: `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoOpt.clientId}&redirect_uri=${kakaoOpt.redirectUri}&response_type=code`,
  requestTokenUrl: 'https://kauth.kakao.com/oauth/token',
  kakaoUserInfoUrl: 'https://kapi.kakao.com/v2/user/me',
  successToken: (ACCESS_TOKEN, userInfoData) => {
    const TokenValue = {
      ACCESS_TOKEN,
      value: userInfoData,
      socialService: 'Kakao',
    }
    return TokenValue
  },
  successRegister: (userInfo) => {
    const value = {
      navigation: 'Register',
      userInfo: userInfo,
    }
    return value
  },
  successLogin: (userInfo) => {
    const value = {
      navigation: 'Main',
      userInfo: userInfo,
    }
    return value
  },
  failValue: () => {
    const value = {
      navigation: 'Error',
      userInfo: null,
    }
    return value
  },
  userDataSetting: (userData, REFRESH_TOKEN = null) => {
    const { id, kakao_account } = userData
    const { profile, email, age_range, gender } = kakao_account
    const KAKAO_ID = `kakao-${id}`
    const userInfoData = {
      social_id: KAKAO_ID,
      email: email,
      nickname: profile.nickname,
      gender: gender,
      age: age_range,
      address: '',
      detail_address: '',
      building_name: '',
      building_password: '',
      payment_state: '',
      refresh_token: REFRESH_TOKEN,
    }
    return userInfoData
  },

  LOADING_SCREEN:
    '<div style="width:100%; height:100%; display:flex; justify-content:center; align-items:center; font-size:36;">Loading...</div>',
}

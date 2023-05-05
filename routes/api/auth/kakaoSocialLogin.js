const express = require('express')
const axios = require('axios')
const router = express.Router()
const UserModel = require('../../../models/UserModel')
const { kakaoOpt } = require('../../../config/config')
const logger = require('../../../logger/logger')
const {
  kakaoOuthOptions,
  kakaoOuthRefreshOptions,
  kakaoLoginURL,
  requestTokenUrl,
  kakaoUserInfoUrl,
  successToken,
  successRegister,
  successLogin,
  failValue,
  LOADING_SCREEN,
  ACCESS_TOKEN_CHECK,
  userDataSetting,
} = require('../../../controller/kakaoLoginUtil')
const {
  userInfoPublic,
  userInfoPrivate,
} = require('../../../controller/commonLoginUtil')

// 카카오 로그인 버튼 클릭시 url 전송
router.get('/kakao', (req, res) => {
  res.send(kakaoLoginURL)
})

// 코드 받아서 ACCESS_TOKEN 발급, redirectUri에서 유저 정보 및 네비게이션 위치 받아서 프론트로 전달
router.post('/kakao/requestToken', async (req, res) => {
  const code = req.body.code

  const options = kakaoOuthOptions(code)
  const tokenResponse = await axios.post(requestTokenUrl, options)
  const ACCESS_TOKEN = tokenResponse.data.access_token
  const REFRESH_TOKEN = tokenResponse.data.refresh_token

  const body = {
    ACCESS_TOKEN,
    REFRESH_TOKEN,
  }

  const response = await axios.post(kakaoOpt.redirectUri, body)
  const userInfoData = response.data

  return res.send(successToken(ACCESS_TOKEN, userInfoData))
})

// /kakao/requestToken 통신시 redirectUri를 POST로 접근. 유저 정보를 확인 후 가입 및 로그인 실행.
router.post('/kakao/callback', async (req, res) => {
  const ACCESS_TOKEN = req.body.ACCESS_TOKEN
  const REFRESH_TOKEN = req.body.REFRESH_TOKEN

  // 카카오 유저 서버에서 유저 정보 가져오기
  let userData
  try {
    userData = await axios.get(
      kakaoUserInfoUrl,
      ACCESS_TOKEN_CHECK(ACCESS_TOKEN)
    )
  } catch (e) {
    const response = { result: 'fail', error: 'token Error' }
    return res.send(response)
  }

  // 카카오 유저 서버에서 가져온 유저 정보 가공하기
  const userInfoData = userDataSetting(userData.data, REFRESH_TOKEN)
  const KAKAO_ID = userInfoData.social_id
  const KAKAO_EMAIL = userInfoData.email
  const KAKAO_NICKNAME = userInfoData.nickname

  // 카카오 유저 서버에서 가져온 유저 정보로 내 DB에서 존재하는지 확인하기
  let userMatch
  let userMatchExist
  try {
    userMatch = await UserModel.findOne({ social_id: KAKAO_ID })

    if (userMatch === null) {
      userMatchExist = false
    } else {
      userMatchExist = true
    }
  } catch (e) {
    logger.error(`POST | /kakao/callback | ${KAKAO_ID} MongoDB findOne Error`)
    return res.send(failValue())
  }
  // 존재하면 로그인, 존재하지 않으면 회원가입
  if (userMatchExist) {
    const USER_DB_DATA = await UserModel.findOneAndUpdate(
      {
        social_id: KAKAO_ID,
      },
      { $set: { refresh_token: REFRESH_TOKEN } }
    )
    logger.info(
      `${KAKAO_EMAIL} | ${KAKAO_NICKNAME}님이 카카오로 로그인 하셨습니다.`
    )

    return res.send(successLogin(userInfoPublic(USER_DB_DATA)))
  } else {
    const newUser = new UserModel(userInfoPrivate(userInfoData))
      .save()
      .then(() => {
        logger.info(
          `${KAKAO_EMAIL} | ${KAKAO_NICKNAME}님이 카카오로 회원가입 하셨습니다.`
        )
        return res.send(successRegister(userInfoPublic(userInfoData)))
      })
  }
})

// 엑세스 토큰 인증 실패시 기능
async function ACCESS_TOKEN_INVALID(errorCode, userSocialId, res) {
  // ACCESS_TOKEN이 만료 됐을 경우
  // { msg: 'this access token does not exist', code: -401 }
  if (errorCode === -401) {
    // DB에서 refresh_token 확인
    let userInfoData
    try {
      userInfoData = await UserModel.findOne({ social_id: userSocialId })
    } catch (e) {
      return logger.error(`${userSocialId} userInfoData DB CONNET ERROR`)
    }
    const refresh_token = userInfoData.refresh_token
    const refreshOptions = kakaoOuthRefreshOptions(refresh_token)
    try {
      // 카카오 토큰 서버에서 refresh_token 검사
      const response = await axios.post(requestTokenUrl, refreshOptions)
      const NEW_ACCESS_TOKEN = response.data.access_token
      return res.send({
        state: 'ACCESS_TOKEN_REISSUE',
        NEW_ACCESS_TOKEN: NEW_ACCESS_TOKEN,
      })
    } catch (e) {
      // refresh_token이 만료 또는 변조됐을 경우
      return res.send({ state: 'REFRESH_TOKEN_INVALID' })
    }
  } else {
    logger.error(
      `${userSocialId} ACCESS_TOKEN_INVALID ERROR | code : ${errorCode}`
    )
    return res.send('ACCESS_TOKEN_INVALID ERROR')
  }
}

router.post('/kakao/accessTokenState', async (req, res) => {
  const { ACCESS_TOKEN, userSocialId } = req.body

  // 카카오 서버에서 엑세스 토큰 유효한지 확인하기
  let userData
  try {
    userData = await axios.get(
      kakaoUserInfoUrl,
      ACCESS_TOKEN_CHECK(ACCESS_TOKEN)
    )

    return res.send({
      state: 'ACCESS_TOKEN_VALID',
    })
  } catch (e) {
    const errorCode = e.response.data.code
    ACCESS_TOKEN_INVALID(errorCode, userSocialId, res)
  }
})

router.get('/kakao/refreshTokenState', async (req, res) => {})

// 카카오 이용 동의시 자동으로 리다이렉트 되는 화면. LOADING_SCREEN으로 사용.
router.get('/kakao/callback', async (req, res) => {
  res.send(LOADING_SCREEN)
})
module.exports = router

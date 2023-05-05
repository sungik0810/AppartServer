require('dotenv').config()

function required(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue
  if (value === null) {
    throw new Error(`Key ${key} is undefined`)
  }
  return value
}

module.exports = {
  kakaoOpt: {
    clientId: required('KAKAO_OPT_CLIENT_ID'),
    clientSecret: required('KAKAO_OPT_CLIENT_SECRET'),
    redirectUri: required('KAKAO_OPT_REDIRECT_URI'),
  },
  sens: {
    accessKey: required('SENS_ACCESS_KEY'),
    secretKey: required('SENS_SECRET_KEY'),
    serviceId: required('SENS_SERVICEID'),
    callNumber: required('SENS_CALLNUMBER'),
  },
  jwtConfig: {
    JWT_PRIVATE_KEY: required('JWT_PRIVATE_KEY'),
  },
}

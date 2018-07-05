var mongoose = require('mongoose')

// 암호화 Module
var crypto = require('crypto')

// schema
var userSchema = mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User id is required!'],
    match: [/^.{4,12}$/, 'Should be 4-12 characters!'],
    trim: true,
    unique: true
  },
  encrypted_password: {
    type: String,
    required: [true, 'Password is required!']
  },
  name: {
    type: String,
    required: [true, 'Name is required!'],
    match: [/^.{4,12}$/, 'Should be 4-12 characters!'],
    trim: true
  },
  eMail: {
    type: String,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Should be a vaild email address!'],
    required: [true, 'E-Mail is required!'],
    trim: true,
    unique: true
  },
  create_at: {
    type: Date,
    index: {unique: false},
    'default': Date.now()
  },
  updated_at: {
    type: Date,
    index: {unique: false},
    'default': Date.now()
  }
}, {
  toObject: {virtuals: true}
})

// 회원가입시 입력된 password를 암호화하여 Database에 저장하는 Method
userSchema
  .virtual('password') // password라는 속성을 사용
  .set(function (password) { // 가상으로 정의한 password라는 실제 data가 넘어옴
    this.pwd = password

    var cipher = crypto.createCipher('aes192', 'oneway')
    cipher.update(password, 'utf8', 'base64')
    this.encrypted_password = cipher.final('base64')

    console.log('Virtual password is stored : ' + this.encrypted_password)
  })
  .get(function () {
    return this.pwd
  })

// 입력된 password와 Database 상의 암호화된 Password가 일치하는지
// 확인하는 Method
userSchema.method('passwordMatch', function (password, encryptedPassword) {
  console.log('passwordMatch method is called')

  var decipheringPassword = this.deciphering(encryptedPassword, function (err, decipheredPassword) {
    if (err) {
      console.log('An error occur during decipher encryptedPassword to decipheredPassword')
    }
  })

  if (password === decipheringPassword) {
    return true
  } else {
    return false
  }
})

// eMail을 이용해서 User Information을 찾는 Method
userSchema.static('findUserId', function (eMail, callback) {
  return this.find({'eMail': eMail}, callback)
})

// id와 eMail을 이용해서 User Password를 찾는 Method
userSchema.static('findUserPassword', function (id, eMail, callback) {
  return this.find({'userId': id, 'eMail': eMail}, callback)
})

// User ID를 이용해서 User Information을 찾는 Method
userSchema.static('findByUserId', function (id, callback) {
  return this.find({'userId': id}, callback)
})

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!'
/*
userSchema.path('password').validate(function (v) {
  var user = this

  // create user
  if (user.isNew) {
    if (!user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation is required!')
    }
    if (!passwordRegex.test(user.password)) {
      user.invalidate('password', passwordRegexErrorMessage)
    } else if (user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!')
    }
  }

  // update user
  if (!user.isNew) {
    if (!user.currentPassword) {
      user.invalidate('currentPassword', 'Current Password is required!')
    }
    if (user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
      user.invalidate('currentPassword', 'Current Password is invalid!')
    }
    if (user.newPassword && !passwordRegex.test(user.newPassword)) {
      user.invalidate('newPassword', passwordRegexErrorMessage)
    } else if (user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!')
    }
  }
}) */

// userSchema와 user를 연결해서 userModel에 assign 후 model을 export
var userModel = mongoose.model('user', userSchema)

module.exports = userModel

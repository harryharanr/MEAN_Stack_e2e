const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');


let emailLengthChecker = (email) => {
    if(!email) {
        return false;
    } else {
        if(email.length < 5 || email.length > 30) {
            return false;
        } else {
            return true;
        }
    }
};

let emailValidChecker = (email) => {
    if(!email){
        return false;
    } else {
        const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email); // Return regular expression test results (true or false) 
    }
};

const emailValidators = [
    {
        validator : emailLengthChecker,
        message : 'E-mail must be at least 5 characters but no more than 30'
    },
    {
        validator : emailValidChecker,
        message : 'Must be a valid E-mail'
    }
];

let usernameLengthChecker = (username) => {
    if(!username){
        return false;
    } else {
        if(username.length < 3 || username.length > 15) {
            return false;
        } else {
            return true;
        }
    }
};

let validUsername = (username) => {
    if(!username){
        return false;
    } else {
        const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
        return regExp.test(username); // Return regular expression test result (true or false)
    }
}

const usernameValidators = [
  // First Username validator
  {
    validator: usernameLengthChecker,
    message: 'Username must be at least 3 characters but no more than 15'
  },
  // Second username validator
  {
    validator: validUsername,
    message: 'Username must not have any special characters'
  }
];

let passwordLengthChecker = (password) => {
    if(!password){
        return false;
    } else {
        if(password.length < 8 || password.length > 35) {
            return false;
        } else {
            return true;
        }
    }
};

let validPassword = (password) => {
    if(!password) {
        return false;
    } else {
        const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
        return regExp.test(password); // Return regular expression test result (true or false)
    }
};

const passwordValidators = [
  // First password validator
  {
    validator: passwordLengthChecker,
    message: 'Password must be at least 8 characters but no more than 35'
  },
  // Second password validator
  {
    validator: validPassword,
    message: 'Must have at least one uppercase, lowercase, special character, and number'
  }
];


const userSchema = new Schema({
  email : {type:String , required:true , unique:true , lowercase:true , validate: emailValidators},
  username : {type:String , required:true , unique:true , lowercase:true , validate: usernameValidators},
  password : {type:String , required:true , validate: passwordValidators}
});

// Middleware for encrypting the password
userSchema.pre('save',function (next)  {
    if(!this.isModified('password')) // If the password field is not modified , wo don't need to run this middleware
        return next();

    bcrypt.hash(this.password , null , null , (err , hash) => {
        if(err) return next(err);
        this.password = hash;
        next();
    });
});

userSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password , this.password); 
    //password - the password user uses to login
    //this.password - the password which was save in database while registering
}

module.exports = mongoose.model('User' , userSchema);
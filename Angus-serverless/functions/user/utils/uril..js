const secret = "I am zc";

const bcrypt = require("bcryptjs");

const bcryptPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

const confirmPassword = (password, hash) => {
    const flag = bcrypt.compareSync(password, hash);
    return flag;
};

module.exports = {
    bcryptPassword,
    confirmPassword,
    secret
};

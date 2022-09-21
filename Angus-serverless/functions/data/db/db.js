const cloudbase = require('@cloudbase/node-sdk')

const app = cloudbase.init({
    env: "angus-server-6g36j4y8db4fbe91",
    secretId: "AKIDdMrIURAetuhIemfJsIVouvkJcfS0IK6u",
    secretKey: "e4FCvObYFkyxgAPO8MK4Y9WgcJo46uTn",
});
const db = app.database();

module.exports = {
    db,
    app
}
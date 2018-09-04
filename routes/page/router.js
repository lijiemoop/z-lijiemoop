const express = require('express');
const router = express.Router();
const config = require('../../config.json');
const lang = require('../../language/'+config.defaultLanguage+'.json');
/* GET home page. */
router.get('/', function(req, res) {
    res.render('index',{});
});

router.get('/admin/login', function(req, res) {
    res.render('manage/login',{lang : lang,title:lang.manage + lang.system + lang.login});
});

module.exports = router;
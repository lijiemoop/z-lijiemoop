const express = require('express');
const router = express.Router();
const config = require('../../config.json');
const lang = require('../../language/'+config.defaultLanguage+'.json');

router.get('/config', function(req, res) {
    res.sned({config : config});
});

router.get('/lang', function(req, res) {
    res.send({lang : lang});
});

module.exports = router;
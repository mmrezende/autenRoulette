"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.send('Admin Home Page');
});
exports.default = router;
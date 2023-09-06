import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import usermodel from '../mongodb/models/userModel.js';
import fetchuser from '../middleware/fetchUser.js';
import cors from 'cors';

const router = express.Router();
router.use(cors());

// Create a user using POST: /api/auth/createuser
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a password').isLength({ min: 8 }),
], async (req, res) => {
    try {
        let success = false;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success, errors: errors.array() });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(req.body.password, salt);

        const existingUser = await usermodel.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "User with this email already exists" });
        }

        const userinfo = await usermodel.create({
            name: req.body.name,
            email: req.body.email,
            password: hashPass,
            reqlimit: 2,
        });

        const data = {
            info: {
                id: userinfo.id
            }
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);
        console.log({ authToken });
        success = true;
        res.json({ success: true, authToken });
    } catch (error) {
        console.error(error);
    }
});

router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await usermodel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, error: "Enter correct login credentials" });
        }

        const passwordcomp = await bcrypt.compare(password, user.password);
        if (!passwordcomp) {
            return res.status(400).json({ success: false, error: "Enter correct login details" });
        }

        const data = {
            info: {
                id: user.id
            }
        };

        const authToken = jwt.sign(data, process.env.JWT_SECRET);
        console.log({ authToken });
        res.json({ success: true, authToken });

    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal Server Error");
    }
});

// Get user details using POST: /api/auth/getuser
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const user = await usermodel.findById(req.user.id).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

export default router;

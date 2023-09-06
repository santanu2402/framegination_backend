import express from 'express';
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';
import UserModel from '../mongodb/models/userModel.js';
import fetchuser from '../middleware/fetchUser.js';
dotenv.config();
const router = express.Router();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY })

const openai = new OpenAIApi(configuration);


router.route('/').post(fetchuser, async (req, res) => {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (user.reqlimit <= 0) {
        res.status(410).json({ success: false, message: 'Request Limit Over' });
        return;
    }

    try {
        const { prompt } = req.body;

        const aiResponse = await openai.createImage({
            prompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json',
        });

        const image = aiResponse.data.data[0].b64_json;
        res.status(200).json({ success: true,photo: image });
    }
    catch (e) {
        console.log(e + " from dalle");
        res.status(500).send(e.response.data.error.message || 'Something went wrong')
    }
})



export default router;
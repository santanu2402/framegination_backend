import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary'
import Post from '../mongodb/models/postModel.js'
import fetchuser from '../middleware/fetchUser.js';
import UserModel from '../mongodb/models/userModel.js';
dotenv.config();

const router = express.Router();

router.use(express.json({ limit: '50mb' }));
router.use(express.urlencoded({ limit: '50mb', extended: true }));
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

//get post

router.route('/').get(fetchuser, async (req, res) => {
    try {
        const posts = await Post.find({ user: req.user.id });
        res.status(200).json({ success: true, data: posts })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'fetching posts failed ,please try again' })

    }
})
//create post

router.route('/').post(fetchuser, async (req, res) => {
    const user = await UserModel.findById(req.user.id).select("-password");
    if (user.reqlimit <= 0) {
        res.status(410).json({ success: false, message: 'Request Limit Over' });
        return;
    }

    try {
        const { prompt, photo } = req.body;
        const photoUrl = await cloudinary.uploader.upload(photo);

        const newPost = await Post.create({
            user: req.user.id,
            prompt,
            photo: photoUrl.url,
        });

        await UserModel.updateOne({ _id: req.user.id }, { $inc: { reqlimit: -1 } });
        res.status(200).json({ success: true, data: newPost });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Unable to create a post, please try again' });
    }
});

export default router;

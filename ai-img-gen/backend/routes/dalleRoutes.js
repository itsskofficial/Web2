import express from 'express'
import * as dotenv from 'dotenv'
import {OpenAI} from 'openai'

dotenv.config()

const router = express.Router()

const configuration = {
    apiKey: process.env.OPENAI_API_KEY
}

router.route('/').get((req, res) => {
    res.status(200).json({ message: 'Hello from DALL-E!' });
})


const openai = new OpenAI(configuration)
router.route('/').post(async (req, res) => {
    try {
        const { prompt } = req.body
        const response = await openai.images.generate(
            {
                prompt: prompt,
                n: 1,
                size: '1024x1024',
                response_format: 'b64_json'
            }
        )
        console.log(response)
        const image = response.data.data[0].b64_json
        res.status(200).json({photo : image})
    }
    catch (err) {
        console.log(err)
        res.status(500).send(response.data.error.message)
    }
})

export default router

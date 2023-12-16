import Prompt from "@models/prompt"
import { connectToDB } from "@utils/database"

export const GET = async (request, {params}) => {
    try {
        await connectToDB()
        const prompts = await Prompt.find({ creator : params.id}).populate('creator')
        return new Response(JSON.stringify(prompts), {satatus : 200})
    }
    catch (error) {
        return new Response("Failed to fetch", {satatus : 500})
    }
}
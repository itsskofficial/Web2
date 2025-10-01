import { Anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { prompts } from "@/prompts";
import { Id } from "@/convex/_generated/dataModel";

export const maxDuration = 30; // 30 seconds

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const projectId = formData.get("projectId") as Id<"projects">;

    if (!imageFile || !projectId) {
      return new Response("Missing image or project ID", { status: 400 });
    }

    // 1. Fetch the project's style guide from Convex
    const project = await fetchQuery(api.projects.getProjectById, { projectId });
    if (!project || !project.styleGuide) {
      return new Response("Style guide not found for this project.", { status: 404 });
    }
    const styleGuide = project.styleGuide;
    
    // 2. Fetch inspiration images for the project
    const inspirationImages = await fetchQuery(api.files.getInspirationImagesForProject, { projectId });
    const imageUrls = inspirationImages.map(img => img.url);

    // 3. Convert wireframe image to base64
    const imageBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // 4. Construct the prompt
    const systemPrompt = prompts.generativeUi.system;

    let userPrompt = `Generate HTML based on this wireframe.`;

    // Add style guide context
    userPrompt += `\n\nSTYLE GUIDE:\nColors: ${JSON.stringify(styleGuide.colorSections)}\nTypography: ${JSON.stringify(styleGuide.typographySections)}`;

    // Add inspiration images context
    if (imageUrls.length > 0) {
        userPrompt += `\n\nINSPIRATION IMAGES:\nUse these images for mood and style inspiration: ${imageUrls.join(", ")}`;
    }

    const anthropic = new Anthropic();

    const result = await streamText({
      model: anthropic("claude-3-haiku-20240307"),
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt,
            },
            {
              type: "image",
              image: Buffer.from(base64Image, 'base64'),
            },
          ],
        },
      ],
    });

    // Convert the AI stream to a streaming response
    return result.toAIStreamResponse();

  } catch (error) {
    console.error("[GENERATE_API_ERROR]", error);
    return new Response("Failed to generate UI", { status: 500 });
  }
}
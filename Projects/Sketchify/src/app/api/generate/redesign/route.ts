import { Anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { internal } from "@/convex/_generated/api";

export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    currentHTML,
    userMessage,
    projectId,
    wireframeSnapshot, // base64 image of the original wireframe
  }: {
    currentHTML: string;
    userMessage: string;
    projectId: Id<"projects">;
    wireframeSnapshot: string;
  } = await req.json();

  if (!currentHTML || !userMessage || !projectId) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    // Consume a credit before proceeding
    // Note: In a real app, you'd get the userId from auth, not assume it.
    // This is a simplified version.
    // await fetchMutation(internal.subscriptions.consumeCredit, { userId: "..." });

    const project = await fetchQuery(api.projects.getProjectById, { projectId });
    if (!project || !project.styleGuide) {
      return new Response("Style guide not found.", { status: 404 });
    }
    const styleGuide = project.styleGuide;

    let prompt = `Please redesign this UI based on my request: "${userMessage}"`;
    prompt += `\n\nHere is the current HTML to modify:\n${currentHTML}`;
    prompt += `\n\nUse the following style guide for all design decisions:\nColors: ${JSON.stringify(styleGuide.colorSections)}\nTypography: ${JSON.stringify(styleGuide.typographySections)}`;
    
    if (wireframeSnapshot) {
        prompt += `\n\nAlso, use the original wireframe image as context for the layout and structure.`;
    }

    const anthropic = new Anthropic();

    const result = await streamText({
        model: anthropic("claude-3-haiku-20240307"),
        system: "You are an expert design engineer. Your task is to modify the given HTML based on the user's request, while strictly adhering to the provided style guide. Return only the full, updated HTML code.",
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: prompt },
                ...(wireframeSnapshot ? [{ type: 'image', image: Buffer.from(wireframeSnapshot, 'base64') } as const] : [])
            ]
        }]
    });

    return result.toAIStreamResponse();

  } catch (error: any) {
    console.error("[REDESIGN_API_ERROR]", error);
    return new Response(error.message || "Failed to redesign UI", { status: 500 });
  }
}
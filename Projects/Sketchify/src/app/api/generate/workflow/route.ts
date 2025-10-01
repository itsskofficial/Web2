import { Anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export const maxDuration = 60; // Increased duration for multi-page generation

export async function POST(req: Request) {
    const {
        mainPageHtml,
        projectId,
        pageType, // e.g., "Dashboard", "Settings"
    }: {
        mainPageHtml: string;
        projectId: Id<"projects">;
        pageType: string;
    } = await req.json();

    if (!mainPageHtml || !projectId || !pageType) {
        return new Response("Missing required fields", { status: 400 });
    }

    try {
        const project = await fetchQuery(api.projects.getProjectById, { projectId });
        if (!project || !project.styleGuide) {
            return new Response("Style guide not found.", { status: 404 });
        }
        const styleGuide = project.styleGuide;

        let prompt = `You are tasked with creating a new "${pageType}" page that is visually and functionally consistent with a provided main page design.

        MAIN PAGE HTML (for design reference):
        ${mainPageHtml.substring(0, 4000)}... 
        
        NEW PAGE TO GENERATE:
        Create a "${pageType}" page that logically complements the main page.
        
        REQUIREMENTS:
        1.  **Analyze the main page's design** to understand its style, components, and layout.
        2.  **Generate a complete, production-ready "${pageType}" page** that feels like a natural part of the same application.
        3.  **Maintain PERFECT design consistency:** Use the exact same color scheme, typography, component styling (buttons, cards, etc.), spacing, and layout patterns as the main page.
        4.  **Use the provided style guide** for all visual decisions.
        
        STYLE GUIDE:
        Colors: ${JSON.stringify(styleGuide.colorSections)}
        Typography: ${JSON.stringify(styleGuide.typographySections)}
        
        Return ONLY the full, new HTML code for the "${pageType}" page.`;

        const anthropic = new Anthropic();

        const result = await streamText({
            model: anthropic("claude-3-haiku-20240307"),
            system: "You are an expert design engineer that creates new application pages that are perfectly consistent with an existing design.",
            messages: [{ role: 'user', content: prompt }]
        });

        return result.toAIStreamResponse();

    } catch (error: any) {
        console.error("[WORKFLOW_API_ERROR]", error);
        return new Response(error.message || "Failed to generate workflow page", { status: 500 });
    }
}
//style
const userPrompt = `Analyze these ${imageUrls.length} mood board images and generate a design system:
    Extract colors that work harmoniously together and create typography that matches the aesthetic. Return ONLY the JSON object matching the exact schema structure above.`;

//redesign
let userPrompt = `Please redesign this UI based on my request: "${userMessage}"`;

userPrompt += `\n\nWireframe Context: I'm providing a wireframe image that shows the EXACT original design layout and structure that this UI was generated from. This wireframe represents the specific frame that was used to create the current design. Please use this as visual context to understand the intended layout, structure, and design elements when making improvements. The wireframe shows the original wireframe/mockup that the user drew or created.`;

userPrompt += `\n\nCurrent HTML for reference:\n${currentHTML.substring(
  0,
  1000
)}...`;

//workflow
let userPrompt = `You are tasked with creating a workflow page that complements the provided main page design. 

MAIN PAGE REFERENCE (for design consistency):
${currentHTML.substring(0, 2000)}...

WORKFLOW PAGE TO GENERATE:
Create a "${selectedPageType}" that would logically complement the main page shown above.

DYNAMIC PAGE REQUIREMENTS:
1. Analyze the main page design and determine what type of application this appears to be
2. Based on that analysis, create a fitting ${selectedPageType} that would make sense in this application context
3. The page should feel like a natural extension of the main page's functionality
4. Use your best judgment to determine appropriate content, features, and layout for this page type

DESIGN CONSISTENCY REQUIREMENTS:
1. Use the EXACT same visual style, color scheme, and typography as the main page
2. Maintain identical component styling (buttons, cards, forms, navigation, etc.)
3. Keep the same overall layout structure and spacing patterns  
4. Use similar UI patterns and component hierarchy
5. Ensure the page feels like it belongs to the same application - perfect visual consistency

TECHNICAL REQUIREMENTS:
1. Generate clean, semantic HTML with Tailwind CSS classes matching the main page
2. Use similar shadcn/ui component patterns as shown in the main page
3. Include responsive design considerations
4. Add proper accessibility attributes (aria-labels, semantic HTML)
5. Create a functional, production-ready page layout
6. Include realistic content and data that fits the page type and application context

CONTENT GUIDELINES:
- Generate realistic, contextually appropriate content (don't use Lorem Ipsum)
- Create functional UI elements appropriate for the page type
- Include proper navigation elements if they exist in the main page
- Add interactive elements like buttons, forms, tables, etc. as appropriate for the page type

Please generate a complete, professional HTML page that serves as a ${selectedPageType} while maintaining perfect visual and functional consistency with the main design.`;

if (colors.length > 0) {
  userPrompt += `\n\nStyle Guide Colors:\n${(
    colors as Array<{
      swatches: Array<{
        name: string;
        hexColor: string;
        description: string;
      }>;
    }>
  )
    .map((color) =>
      color.swatches
        .map(
          (swatch) =>
            `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`
        )
        .join(", ")
    )
    .join(", ")}`;
}

if (typography.length > 0) {
  userPrompt += `\n\nTypography:\n${(
    typography as Array<{
      styles: Array<{
        name: string;
        description: string;
        fontFamily: string;
        fontWeight: string;
        fontSize: string;
        lineHeight: string;
      }>;
    }>
  )
    .map((typo) =>
      typo.styles
        .map(
          (style) =>
            `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`
        )
        .join(", ")
    )
    .join(", ")}`;
}

if (imageUrls.length > 0) {
  userPrompt += `\n\nInspiration Images Available: ${imageUrls.length} reference images for visual style and inspiration.`;
}

userPrompt += `\n\nPlease generate a professional ${selectedPageType} that maintains complete design consistency with the main page while serving its specific functional purpose. Be creative and contextually appropriate!`;

//generate
const userPrompt = `Use the user-provided styleGuide for all visual decisions: map its colors, typography scale, spacing, and radii directly to Tailwind v4 utilities (use arbitrary color classes like text-[#RRGGBB] / bg-[#RRGGBB] when hexes are given), enforce WCAG AA contrast (≥4.5:1 body, ≥3:1 large text), and if any token is missing fall back to neutral light defaults. Never invent new tokens; keep usage consistent across components.

Inspiration images (URLs):

You will receive up to 6 image URLs in images[].

Use them only for interpretation (mood/keywords/subject matter) to bias choices within the existing styleGuide tokens (e.g., which primary/secondary to emphasize, where accent appears, light vs. dark sections).

Do not derive new colors or fonts from images; do not create tokens that aren’t in styleGuide.

Do not echo the URLs in the output JSON; use them purely as inspiration.

If an image URL is unreachable/invalid, ignore it without degrading output quality.

If images imply low-contrast contexts, adjust class pairings (e.g., text-[#FFFFFF] on bg-[#0A0A0A], stronger border/ring from tokens) to maintain accessibility while staying inside the styleGuide.

For any required illustrative slots, use a public placeholder image (deterministic seed) only if the schema requires an image field; otherwise don’t include images in the JSON.

On conflicts: the styleGuide always wins over image cues.
    colors: ${colors
      .map((color: any) =>
        color.swatches
          .map((swatch: any) => {
            return `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`;
          })
          .join(", ")
      )
      .join(", ")}
    typography: ${typography
      .map((typography: any) =>
        typography.styles
          .map((style: any) => {
            return `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`;
          })
          .join(", ")
      )
      .join(", ")}
    `;

//workflow redesign
let userPrompt = `CRITICAL: You are redesigning a SPECIFIC WORKFLOW PAGE, not creating a new page from scratch.

    
USER REQUEST: "${userMessage}"

CURRENT WORKFLOW PAGE HTML TO REDESIGN:
${currentHTML}

WORKFLOW REDESIGN REQUIREMENTS:
1. MODIFY THE PROVIDED HTML ABOVE - do not create a completely new page
2. Apply the user's requested changes to the existing workflow page design
3. Keep the same page type and core functionality (Dashboard, Settings, Profile, or Listing)
4. Maintain the existing layout structure and component hierarchy
5. Preserve all functional elements while applying visual/content changes
6. Keep the same general organization and workflow purpose

MODIFICATION GUIDELINES:
1. Start with the provided HTML structure as your base
2. Apply the requested changes (colors, layout, content, styling, etc.)
3. Keep all existing IDs and semantic structure intact
4. Maintain shadcn/ui component patterns and classes
5. Preserve responsive design and accessibility features
6. Update content, styling, or layout as requested but keep core structure

IMPORTANT: 
- DO NOT generate a completely different page
- DO NOT revert to any "original" or "main" page design
- DO redesign the specific workflow page shown in the HTML above
- DO apply the user's changes to that specific page

    colors: ${styleGuideData.colorSections
      .map((color: any) =>
        color.swatches
          .map((swatch: any) => {
            return `${swatch.name}: ${swatch.hexColor}, ${swatch.description}`;
          })
          .join(", ")
      )
      .join(", ")}
    typography: ${styleGuideData.typographySections
      .map((typography: any) =>
        typography.styles
          .map((style: any) => {
            return `${style.name}: ${style.description}, ${style.fontFamily}, ${style.fontWeight}, ${style.fontSize}, ${style.lineHeight}`;
          })
          .join(", ")
      )
      .join(", ")}

Please generate the modified version of the provided workflow page HTML with the requested changes applied.`;

userPrompt += `\n\nPlease generate a professional redesigned workflow page that incorporates the requested changes while maintaining the core functionality and design consistency.`;

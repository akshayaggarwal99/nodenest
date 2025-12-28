# NodeNest: Detailed Product Specification Document

## 1. Introduction

### 1.1 Project Overview
NodeNest is an AI-powered visual learning platform that converts topics, URLs, text, or PDFs into interactive knowledge graphs. Built on React Flow, it enables users to explore concepts visually through expandable nodes, deepen understanding via chat interactions, and persist learning sessions for later access. The core goal is to facilitate the easiest and most effective human learning flow by leveraging visual relationships, progressive detail revelation, and natural language queries—outperforming traditional linear text-based learning.

This specification document outlines the functional requirements, user interface (UI) design, user experience (UX) principles, and technical guidelines to ensure an intuitive, engaging, and efficient learning journey. Emphasis is placed on human-centered design: minimizing friction, promoting curiosity-driven exploration, and adapting to diverse learning styles (visual, interactive, and conversational).

### 1.2 Objectives
- **Ease of Learning**: Provide a flow that starts simple (high-level overview) and allows effortless deepening without overwhelming the user.
- **Virality and Engagement**: Intuitive UI/UX to encourage sharing sessions or graphs on social media.
- **Accessibility**: Ensure broad usability for beginners to experts, across devices.
- **Scalability**: Design for future expansions like collaboration or integrations.

### 1.3 Scope
- In-Scope: Core features as described, UI/UX flows, basic tech stack implementation.
- Out-of-Scope: Advanced analytics, multi-user collaboration, native mobile apps (focus on responsive web).

## 2. Target Users and Personas
To optimize for human learning flow, consider these personas:
- **Student Learner (e.g., College Student)**: Needs quick overviews for exams; values expandable depth and chat for clarifications.
- **Professional Researcher (e.g., Engineer)**: Inputs URLs/PDFs for complex topics; prioritizes session saving and precise node expansion.
- **Casual Explorer (e.g., Hobbyist)**: Types simple topics; seeks fun, visual engagement without steep learning curves.
- **Educator (e.g., Teacher)**: Builds graphs for lessons; appreciates export/share features.

Assumptions: Users are tech-savvy but not developers; ages 18+; diverse backgrounds.

## 3. Key Functional Requirements
Based on the project description, with enhancements for optimal learning UX.

### 3.1 Input Handling
- Support multi-input: Text topic, URL, pasted text, PDF upload.
- Validation: Auto-detect input type; provide error feedback (e.g., "Invalid URL—try again?").

### 3.2 Graph Generation and Interaction
- AI-driven: Use LLM (OpenAI/Claude) to generate initial 5-7 root nodes from input.
- Expandable Nodes: Single-click expands to 3-4 child nodes with deeper details.
- Draggable/Pan/Zoom: Full React Flow interactivity for intuitive exploration.

### 3.3 Chat Interface
- Contextual: Tied to selected node; queries generate answers and optional new branches.
- Natural Language: Support follow-ups like "Explain simply" or "Add examples."

### 3.4 Session Management
- Auto-save: Every significant change (e.g., expansion, chat addition).
- History Sidebar: List sessions as clickable rows (title, date, thumbnail preview).

### 3.5 Additional Features for Learning Flow
- Search Within Graph: Quick-find nodes to avoid manual panning.
- Export/Share: PNG/SVG export or shareable links for virality.
- Undo/Redo: Stack for node expansions/changes to reduce fear of exploration.
- Tutorials/Onboarding: Guided tour on first use.

## 4. User Flows
Detailed step-by-step flows optimized for easiest learning: Progressive, feedback-rich, and minimal steps. Flows assume a responsive web app (desktop-first, mobile-adapted).

### 4.1 Onboarding Flow (First-Time User)
1. Landing Page: Clean hero section with tagline ("Nest Your Knowledge: Visual Graphs for Smarter Learning"), input field, and "Get Started" button. Subtle animation shows a sample graph expanding.
2. Quick Tutorial: Modal popover guides: "Enter a topic → Explore nodes → Chat for depth → Save your nest."
3. Account Creation (Optional): Simple email/sign-in for session persistence; guest mode for quick trials.

### 4.2 Core Learning Flow: Starting a New Session
1. **Input Entry**: Top-center input bar (multi-line textarea) with placeholders: "Type a topic like 'Quantum Computing', paste a URL, or upload PDF." Icons for input types (text/URL/file). Auto-suggest topics based on trends (via LLM).
2. **Graph Generation**: Submit → Loading spinner with tip ("Building your knowledge nest..."). Generate root graph in 5-10s; display in central canvas.
3. **Initial Exploration**: High-level view (zoomed out). Nodes as rounded rectangles with bold labels; edges show relationships. Hover tooltips for quick previews.
4. **Node Expansion**: Click node → Subtle animation (node "nests" open); add child nodes. Limit depth to prevent overload—prompt "Expand further?" for deep levels.
5. **Chat Interaction**: Right-side chat panel activates on node select. Type query → AI response in bubble; option to "Add as Branch" (creates new node/edge).
6. **Session Management**: Auto-save indicator (green check). Left sidebar shows "My Nests" list; click to load with fade-in transition.
7. **Exit and Return**: Close tab → Sessions persist. Reopen → Sidebar prompts "Resume last nest?".

### 4.3 Advanced Flow: Deep Dive and Customization
1. Select Node → Chat: "Give real-world example" → Response + "Branch It?" button.
2. Search: Top search bar filters nodes (e.g., fuzzy match).
3. Customize: Right-click node for options (color-code, collapse, delete).
4. Export: Button in top nav → Download graph as image or JSON.

### 4.4 Error/Recovery Flow
- Input Error: Gentle alert ("Couldn't process—try rephrasing?") with retry button.
- AI Delay: Progress bar with cancel option.
- Offline: Graceful degradation (view saved sessions; queue inputs).

Flows prioritize **progressive disclosure**: Start broad, reveal details on demand. **Feedback Loops**: Visual cues (animations, toasts) confirm actions, encouraging continued engagement.

## 5. UI Layout and Components
Responsive design using Tailwind CSS. Overall Layout: 
- **Header**: Logo (NodeNest—bird nest icon with graph nodes), input bar, user menu.
- **Left Sidebar**: Session history (collapsible; rows with title, date, delete icon).
- **Central Canvas**: React Flow graph (80% width; infinite scroll if needed).
- **Right Panel**: Chat interface (resizable; collapses on mobile).
- **Footer**: Quick links (help, feedback).

### 5.1 Key UI Components
- **Nodes**: Custom React Flow nodes—expandable with + icon. Styles: Primary (bold, large), Child (subtle, smaller). Colors: Gradient based on depth (e.g., blue for root, green for leaves).
- **Edges**: Curved lines with labels (e.g., "relates to"); dashed for optional branches.
- **Chat Bubbles**: User (right-aligned, blue), AI (left, gray). Include "Thinking..." loader.
- **Input Field**: Auto-complete suggestions for common queries.
- **Buttons/Icons**: Minimalist (e.g., feather icons); tooltips on hover.
- **Modals**: For onboarding, exports—non-intrusive, escapable.

### 5.2 Visual Design
- Theme: Light/dark mode toggle. Clean, sans-serif fonts (e.g., Inter).
- Colors: Primary (#4CAF50 green for growth), Accent (#2196F3 blue for interactivity).
- Animations: Smooth transitions (e.g., node expand via Framer Motion) to mimic natural learning "aha" moments.
- Mobile Adaptations: Stack layout (canvas full-screen, sidebars as drawers).

## 6. UX Design Principles
Focused on **easiest human learning flow**:
- **Intuitiveness**: Mirror mind-mapping (e.g., like Miro but AI-automated). No complex menus—actions via clicks/chats.
- **Cognitive Load Reduction**: Limit initial nodes; use visual hierarchy (size/color for importance).
- **Personalization**: Adapt graph density based on user prefs (e.g., "Simple Mode" for beginners).
- **Engagement**: Gamify with badges (e.g., "Deep Diver: Explored 10 levels").
- **Accessibility**: WCAG compliance—keyboard nav, screen reader support (ARIA labels on nodes), high contrast.
- **Performance**: Lazy-load expansions; ensure <2s response times.
- **User Testing Metrics**: Aim for 90% task completion in <5min for core flow; high NPS via feedback loops.

## 7. Technical Specifications
- **Frontend**: React (v18+), React Flow (for graph), Tailwind CSS (styling), Zustand (state management—lightweight for graph/session data).
- **Backend**: Next.js API routes (for LLM calls, session CRUD); or Express if separate.
- **AI Integration**: OpenAI/Claude API—prompt engineering for graph gen (e.g., "Generate hierarchical JSON: {nodes: [], edges: []}").
- **Storage**: Supabase/PostgreSQL—store sessions as JSON blobs (graph state, user ID).
- **Security**: Auth for sessions; rate-limit AI calls.
- **Deployment**: Vercel for Next.js; monitor with Sentry.

### 7.1 Data Models
- Session: {id, title, createdAt, graphJSON, userId}
- Graph: React Flow compatible {nodes: [{id, label, position, children?}], edges: []}

## 8. Testing and Iteration
- **Unit/Integration**: Test graph rendering, AI responses.
- **Usability Testing**: A/B test flows (e.g., chat vs. click expansion).
- **Metrics**: Session duration, expansion depth, retention.

## 9. Potential Enhancements
- Collaboration: Real-time multi-user editing.
- Integrations: Browser extension for URL capture; export to Notion/Obsidian.
- AI Upgrades: Multimodal (image nodes from PDFs).

This spec provides a blueprint for building NodeNest with a laser focus on seamless, joyful learning. Total estimated dev time: 4-6 weeks for MVP. For wireframes, I recommend tools like Figma—let me know if you need textual ASCII mocks!
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# TriPrompt: Multi-Persona Prompt Intelligence

**Write Better. Prompt Smarter. Think Deeper.**

TriPrompt is a cognitive assistant designed to solve the "One-Dimensional AI" problem. Most AI outputs are shallow because single-shot prompts lack the expert review, skepticism, and stress-testing required for high-stakes professional work. 

TriPrompt reimagines the workflow by simulating a custom council of relevant perspectives to analyze your goal, resolve hidden trade-offs, and deliver a "Publish-Ready" final answer alongside a "High-IQ" reusable prompt.

---

## 🧠 The Philosophy: Beyond the Single Shot

The fundamental flaw in current LLM usage is the **Single-Shot Bias**. When we ask an AI for help, we often don't know what we don't know. We lack the "Cognitive Friction" necessary to uncover blind spots.

TriPrompt is built on three core design principles:

1. **Semantic Red-Teaming**: Before generating a solution, the system identifies the exact expert roles (e.g., a skeptical CFO, a technical lead, a frustrated end-user) that would naturally challenge or improve the specific goal.
2. **Synthesis over Averaging**: Most multi-agent systems simply average out responses. TriPrompt explicitly identifies **trade-offs** between perspectives and forces the model to make a reasoned decision on how to resolve them.
3. **Artifact vs. Blueprint**: Every run produces two distinct values:
   - **The Artifact**: A polished, ready-to-use version of your goal.
   - **The Blueprint**: A generalizable, high-intelligence prompt you can save to your personal Toolbox for future use.

## 🚀 How it Works: The Cognitive Workflow

1. **Semantic Analysis**: You enter a goal. TriPrompt uses the Gemini 2.5 Flash model to perform real-time semantic analysis, suggesting three distinct personas tailored to your specific context.
2. **Perspective Simulation**: Three independent experts "review" your request in parallel, generating drafts and identifying unique risks/opportunities.
3. **Reasoning & Synthesis**: The Gemini 3 Pro reasoning engine ingests these conflicting drafts. It synthesizes a final master version that incorporates the best insights while explicitly noting which trade-offs were resolved.
4. **Toolbox Integration**: Save the resulting "Improved Prompt" to your local browser storage, building a library of custom high-performance instruction sets.

## ✨ Key Features

- **Dynamic Persona Generation**: No fixed categories. The system generates personas contextually based on your goal.
- **Trade-off Resolution**: View the "Logic Trace" of how the AI navigated conflicting expert feedback.
- **Prompt Intelligence**: Every result includes a "Generalizable Insight"—a lesson on prompt engineering learned from that specific run.
- **Private-First Storage**: Your Toolbox and Run History are stored entirely in your browser's Local Storage. No external databases, no tracking.
- **Adaptive UI**: A split-screen layout designed for high-density information management and rapid iteration.

## 🛠️ Technical Stack

- **Engine**: Google Gemini 3 Pro & Gemini 2.5 Flash API
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (with custom brand system)
- **State Management**: React Hooks + Local Storage Persistence
- **Animation**: Tailwind transitions for smooth cognitive state changes

## 🚦 Getting Started

### Prerequisites
- A Google Gemini API Key.
- A modern web browser.

### Installation
1. Clone the repository.
2. Ensure `process.env.API_KEY` is configured (TriPrompt uses a secure environment-injected key in the web context).
3. Open `index.html` via a local dev server (e.g., Vite or Live Server).

---

*TriPrompt is an experiment in moving from "Prompting as a Task" to "Prompting as a Design Process."*




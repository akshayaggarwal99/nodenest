<p align="center">
  <img src="public/globe.svg" alt="NodeNest" width="100"/>
</p>
<h1 align="center">NodeNest</h1>
<p align="center"><strong>Stop chatting. Start mapping.</strong></p>
<p align="center">
  <em>100% open-source • Next-Gen AI Tutor • Visual Learning</em>
</p>

<p align="center">
  <a href="https://github.com/akshayaggarwal99/nodenest"><img src="https://img.shields.io/github/stars/akshayaggarwal99/nodenest?style=for-the-badge&color=FFD700" /></a>
  <a href="https://github.com/akshayaggarwal99/nodenest/fork"><img src="https://img.shields.io/github/forks/akshayaggarwal99/nodenest?style=for-the-badge&color=0066FF" /></a>
</p>

<p align="center">
  <img src="src/demo/photosynthesis.png" alt="NodeNest Demo" width="100%" style="border-radius: 10px; border: 1px solid #333;" />
</p>

---

## The Problem

We've all been there: You ask ChatGPT to explain a complex topic, and it gives you a perfect 500-word essay. You read it, nod, and feel smart.

**Two days later? You remember nothing.**

Why? Because **reading isn't learning**. True understanding happens when you connect concepts, see relationships, and build a mental model. Linear chat windows destroy that. They turn knowledge into an infinite, scrolling receipt.

## The Solution

I built **NodeNest** to fix how we learn from AI.

It forces the conversation out of the timeline and onto a canvas. When you learn something new, it doesn't just scroll away—it becomes a permanent node in your map. 

- **It's Socratic:** The AI is prompted to guide you, not lecture you.
- **It's Visual:** Your knowledge grows like a tree. You can literally *see* what you know.
- **It's Semantic:** Concepts are linked by logic, not just time.

---

## NodeNest vs Standard Chat

| | **NodeNest** | Standard Chatbots |
|---|:---:|:---:|
| 🧠 Mental Model | **Visual Knowledge Graph** | Infinite Wall of Text |
| 🎓 Teaching Style | **Socratic (Asks questions)** | Lecture Mode |
| 🌳 Structure | **Breadth-First Tree** | Linear Rabbit Hole |
| 🖼️ Visuals | **Context-Aware Diagrams** | Generic Stock Images |
| 🕵️ Tracking | **None** | Yes |

---

## Quick setup (2 minutes)

1.  **Clone it:**
    ```bash
    git clone https://github.com/akshayaggarwal99/nodenest.git
    cd nodenest
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Get a Gemini Key (Free):**
    - Go to [Google AI Studio](https://aistudio.google.com/)
    - Get an API key (it's free for 1M tokens/day)
    - Create `.env.local`:
      ```env
      GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
      ```

4.  **Run it:**
    ```bash
    npm run dev
    ```

That's it. Open `http://localhost:3000` and start mapping.

---

## Under the Hood

Built with the absolute bleeding edge stack because it's fun:

- **Next.js 16 (Turbopack)** - Fast as lightning.
- **Google Gemini 3 Flash Preview** - The smartest, fastest model I could find.
- **React Flow + Dagre** - Auto-layout magic that just works.
- **Zustand** - State management.
- **Tailwind v4** - Styling for the future.

---

## Wanna help?

Every star helps more learners find a better way to study.

<p align="center">
  <a href="https://github.com/akshayaggarwal99/nodenest/stargazers">
    <img src="https://img.shields.io/github/stars/akshayaggarwal99/nodenest?style=social" />
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/akshayaggarwal99/nodenest/fork">
    <img src="https://img.shields.io/github/forks/akshayaggarwal99/nodenest?style=social" />
  </a>
  &nbsp;&nbsp;
  <a href="https://twitter.com/intent/tweet?text=Finally%20a%20visual%20AI%20tutor%20that%20doesn't%20just%20lecture.%20Check%20out%20NodeNest.&url=https://github.com/akshayaggarwal99/nodenest">
    <img src="https://img.shields.io/twitter/url?style=social&url=https://github.com/akshayaggarwal99/nodenest" />
  </a>
</p>

Or just use it to master a hard topic. That's enough for me.

---

<p align="center">
  Built with caffeine and spite by <strong><a href="https://github.com/akshayaggarwal99">Akshay</a></strong>
</p>

<p align="center">
  <em>Open source isn't about beating giants.<br/>It's about making sure knowledge stays free.</em>
</p>

<p align="center">
  <sub>MIT License — do whatever you want with it.</sub>
</p>

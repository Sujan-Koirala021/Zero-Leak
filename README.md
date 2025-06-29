# 🚨 ZeroLeaks

**ZeroLeaks** is a security-focused tool designed to scan public GitHub repositories for exposed API keys and other critical vulnerabilities. Simply provide a GitHub URL, and ZeroLeaks will locate and report any sensitive information leaks—helping you secure your code before attackers can exploit it.

---

## 💡 How It Started

While casually scrolling through social media, we stumbled upon a video showcasing how exposed API keys on GitHub could be exploited. Out of curiosity, we tested the method and shockingly discovered **three valid API keys**. That moment sparked the creation of **ZeroLeaks**—a tool to help developers identify and fix such vulnerabilities in their own projects.

---

## 🎥 Demo

> _Coming Soon!_

---


## **Usage**

### **Running the Agent Backend**

1. **Navigate to agent**
   ```bash
   cd agent
   ```
   
1. **Create a virtual environment:**

   ```bash
   python -m venv venv
   ```

2. **Activate the virtual environment:**

   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install the required dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server:**
   ```bash
   uvicorn server:app --reload
   ```

### **Running the UI**

1. **Navigate to the UI directory:**

   ```bash
   cd ../frontend
   ```

2. **Install UI dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server for the UI:**
   ```bash
   npm run dev
   ```

## **Langraph Details**

For an in-depth explanation of the **Langraph** used in **ZeroLeaks**, navigate to the notebook located at:

```
api_detector_and_security.ipynb
```

This notebook provides detailed insights into how the Langraph is structured and how it detects api and other vulnerability in **ZeroLeaks**.


## **Environmental Variables**

### For Frontend

```bash
OPENAI_API_KEY=your-nagai-api-key
OPENAI_BASE_URL=https://api.naga.ac/v1
REMOTE_ACTION_BASE_URL=http://127.0.0.1:8000
```

### For Backend

```
PORT=8000
OPENAI_API_KEY=your-nagaai-api-key
OPENAI_BASE_URL=https://api.naga.ac/v1/
GITHUB_TOKEN=your-github-access-token
Gemini_API_KEY=your-gemini-api-key

```

## **Features**

- 🔗 GitHub integration

- 🛡️ In-depth security vulnerability detection

- 💡 Recommendations for fixing issues

- 📄 Auto-generated vulnerability reports

## **License**

Distributed under the MIT License. See `LICENSE` for more information.

## **Technology**
- NextJs
- CopilotKit
- Typescript
- Langraph
- FastAPI
- Uvicorn
- Tailwind

## **Event**

This project was developed for 100 Agents Hackathon.
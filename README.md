<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00d4ff,50:7c3aed,100:4000ff&height=220&section=header&text=Kyrexi%20AI&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=⚡%20Agentic%20Pro%20Ecosystem&descAlignY=55&descSize=18" width="100%"/>

<br/>

[![Node.js](https://img.shields.io/badge/Node.js-≥22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![Vercel](https://img.shields.io/badge/Vercel-Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

[![Version](https://img.shields.io/badge/Version-3.5.0--agentic--pro-7c3aed?style=for-the-badge&logoColor=white)](https://github.com/udmodz0)
[![License](https://img.shields.io/badge/License-Apache--2.0-00d4ff?style=for-the-badge&logoColor=white)](https://github.com/udmodz0)
[![Status](https://img.shields.io/badge/Status-Active-00ff88?style=for-the-badge&logoColor=white)](https://github.com/udmodz0)

<br/>


</div>

---

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## <img src="https://media.giphy.com/media/iY8CRBdQXODJSCERIr/giphy.gif" width="30"> &nbsp;About

> **Kyrexi** is a high-performance, autonomous agentic AI ecosystem designed for developers. It bridges the gap between high-level reasoning and low-level execution, providing a unified platform across CLI and Web. Built with a "Security-First" architecture, Kyrexi empowers users with real-time file system interaction, automated coding, and a stunning "Agentic Pro" visual interface.



<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">



## <img src="https://media2.giphy.com/media/QssGEmpkyEOhBCb7e1/giphy.gif" width="30"> &nbsp;CLI Commands

<div align="center">

| Command | Action |
|:---|:---|
| `/chats` | List all active agent sessions |
| `/delete` | Remove the current or a specific chat session |
| `/agent` | Toggle **Autonomous Mode** on/off |
| `/fix` | Auto-fix an error using tools (e.g. `/fix <error>`) |
| `/clear` | Wipe terminal history and reset the branding |
| `/login` | Force a secure re-authentication flow |
| `/exit` | Gracefully terminate the Kyrexi session |

</div>

<br/>

> 💡 **Pro Tip:** Use the `--agentic` or `-a` flag when starting Kyrexi to enable Autonomous Mode by default!

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N6Z2V6eW96N3N6Z2V6eW96N3N6Z2V6eW96N3N6Z2V6eW96JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKVUn7iM8FMEU24/giphy.gif" width="30"> &nbsp;Autonomous Toolbox

Kyrexi v3.5 Pro comes equipped with a suite of professional-grade tools:

- **📂 File System**: `list_dir`, `read_file`, `write_file`, `edit_file`, `multi_edit_file`
- **💻 Execution**: `run_command`, `run_background_command`, `get_command_status`
- **🔍 Research**: `search_files` (grep), `search_web` (DuckDuckGo), `read_url`
- **🎨 Creativity**: `generate_image` (AI-powered visuals)
- **🧠 Reasoning**: Built-in visual `<thinking>` process for transparency

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🛠️ Autonomous Auto-Fix

Kyrexi v3.5 introduces a dedicated **Fixer** mode. Instead of just analyzing an error, Kyrexi will autonomously navigate your codebase to resolve it.

### The 4-Step Mission Protocol:
1.  **🔍 Locate**: Scans your project directory to find the failing code.
2.  **🧠 Diagnose**: Analyzes the logic and identifies the root cause.
3.  **🛠️ Fix**: Applies precise code modifications using `edit_file`.
4.  **✅ Verify**: Runs your build/test commands to ensure the fix is successful.

**Usage:**
```bash
kyrexi fix "Your error message here"
```
*Or use `/fix` inside the interactive CLI.*

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3N6Z2V6eW96N3N6Z2V6eW96N3N6Z2V6eW96N3N6Z2V6eW96JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/l41lTfuxvFvA9vKzm/giphy.gif" width="30"> &nbsp;Advanced Intelligence

Powered by the latest Kyrexi Ø Edition, the CLI now supports:
- **Vision Intelligence**: Analyze images and visual data directly.
- **Video Generation**: Create stunning AI videos without limits.
- **Privacy First**: End-to-end encryption with no data selling.
- **Mobile Integration**: Sync your work with the [Kyrexi Android App](https://kyrexi.udmodz.site/Kyrexi-Mobile-V3.apk).

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 Kyrexi SDK (Beta)

Integrate Kyrexi's intelligence directly into your own applications! Use the Kyrexi SDK for **Autonomous Self-Healing**—automatically detecting, diagnosing, and fixing production errors in real-time.

```javascript
import { Kyrexi } from 'kyrexi';

const kyrexi = new Kyrexi('YOUR_API_KEY');

try {
  
  throw new Error("Critical database failure");
} catch (err) {
  
  const report = await kyrexi.fix(err, { env: 'production' });
  console.log("Kyrexi Auto-Fix Report:", report);
}
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🛠️ Project Scaffolding & Global Self-Healing (`kyrexi init`)

Kyrexi v1.3.9 introduces **Interactive Scaffolding** to boost your developer velocity. You can bootstrap a production-ready application pre-configured with Kyrexi's autonomous self-healing engines in seconds!

### Scaffolding Wizard

Run the scaffolder via the CLI command:
```bash
kyrexi init
```
*Or use `/init` or `/create` inside the interactive terminal session.*

The wizard will guide you through:
1. 📂 **Project Naming** (custom project folder creation)
2. 🗂️ **Template Selection**:
   * 🚀 **Node.js / Express Server**: A ready-to-run Express server setup.
   * 📜 **Basic Script**: A clean template for automation scripts.
3. 🤖 **Kyrexi Self-Healing Integration**: Automates key generation from your active session, writes the `.env` file, and hooks global error interceptors!

---

### Global Error Interceptors

When Self-Healing is enabled, the scaffolder registers full crash-prevention listeners to intercept unhandled exceptions and autonomously invoke healing diagnostics:

```javascript
import { Kyrexi } from 'kyrexi';
import dotenv from 'dotenv';
dotenv.config();

const kyrexi = new Kyrexi(process.env.KYREXI_API_KEY);


process.on('uncaughtException', async (error) => {
  console.error('\n❌ [CRASH DETECTED]:', error.message);
  console.log('🤖 Kyrexi Pro is executing autonomous self-healing diagnostics...');
  try {
    const report = await kyrexi.fix(error, { filePath: import.meta.url });
    console.log('🤖 Kyrexi Healing Report:', report);
  } catch (e) {
    console.error('❌ Kyrexi self-healing invocation failed:', e.message);
  }
  process.exit(1);
});
```

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">

## 🚀 Installation


<summary><b>📦 1. Global Install via NPM</b></summary>
<br/>

```bash
# Install globally
npm install -g kyrexi

# Start the agent (Standard)
kyrexi

# Start the agent (Agentic Pro)
kyrexi --agentic

# Auto-fix an error
kyrexi fix "Error: Cannot find module './utils'"
```



<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif" width="100%">



<div align="center">

## 👨‍💻 Creator

<a href="https://github.com/udmodz0">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=28&duration=2500&pause=800&color=7C3AED&center=true&vCenter=true&repeat=true&width=300&height=50&lines=UDMODZ" alt="UDMODZ" />
</a>

<br/>

<a href="https://github.com/udmodz0">
  <img src="https://img.shields.io/badge/GitHub-udmodz-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
</a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=shark&color=0:00d4ff,50:7c3aed,100:4000ff&height=40&section=footer" width="100%"/>


<br/>


</div>

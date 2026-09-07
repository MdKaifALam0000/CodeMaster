# 📂 CodeMaster: Complete Project Structure & Dependency Flow

This document details the complete code structure, file hierarchy, and module dependency workflows for the **CodeMaster** application. It serves as a visual and descriptive guide to understanding how files, components, state management slices, and backend endpoints relate to one another.

---

## 🗺️ 1. Global Structure Flow Diagram

Below is the architectural dependency tree, illustrating how requests navigate from the client interface down to the database and external compiling sandboxes.

```mermaid
graph TD
    %% Global Nodes
    subgraph Client ["Frontend Client Application (React 19 + Vite)"]
        A["main.jsx / index.css"] --> B["App.jsx Router"]
        
        %% Pages
        subgraph Pages ["Pages Layer (/src/pages)"]
            Home["Homepage.jsx"]
            DashPage["DashboardPage.jsx"]
            ProbPage["ProblemPage.jsx"]
            TeamLobby["TeamCodingLobby.jsx"]
            TeamRoom["TeamCodingPage.jsx"]
            AdminPage["Admin.jsx"]
        end
        
        %% Components
        subgraph Components ["Components Layer (/src/components)"]
            Monaco["Monaco Editor (IDE)"]
            ChatAI["ChatAI.jsx (Doubt Panel)"]
            CodeRev["CodeReview.jsx (AI Reviewer)"]
            Anim["AlgorithmAnimator/ (Visualizer)"]
            DashComp["Dashboard/ (Profile & Stats)"]
        end
        
        %% Store
        subgraph StateStore ["Redux Store (/src/store)"]
            Store["store.js (Global Redux Store)"]
            AuthSlice["authSlice.js (Auth state)"]
            TeamSlice["teamCodingSlice.js (Collab state)"]
            DashSlice["dashboardSlice.js (Dashboard state)"]
        end

        Hook["useTeamSocket.js (Socket hook)"]
        Axios["axiosClient.js (Axios connection API)"]
    end

    %% Backend Server
    subgraph Server ["Backend Server (Node.js + Express.js)"]
        ServerEntry["src/index.js (Entry Server)"]
        
        subgraph Config ["Database Config (/src/config)"]
            MDB["db.js (MongoDB Atlas Connect)"]
            RDB["redis.js (Redis Client Config)"]
        end

        subgraph Routes ["Routes (/src/routes)"]
            UAuthR["userAuth.js (Auth routing)"]
            ProbR["problemCreator.js (Problem CRUD)"]
            SubR["submit.js (Run/Submit code)"]
            AIR["aiChatting.js (Gemini AI features)"]
            DashR["userProfile.js (Dashboard endpoints)"]
            TeamR["teamCoding.js (Collaboration rooms)"]
        end

        subgraph Controllers ["Controllers (/src/controllers)"]
            UAuthC["userAuthenticate.js"]
            ProbC["userProblem.js"]
            SubC["userSubmission.js"]
            AIC["solveDoubt.js / codeReview.js / algorithmAnimation.js"]
            DashC["userProfile.js / progressAnalysis.js"]
            TeamC["teamCoding.js"]
        end

        subgraph Models ["Models (/src/models)"]
            MUser["user.js"]
            MProblem["problem.js"]
            MSub["submission.js"]
            MTeam["teamRoom.js"]
            MOTP["OTP.js"]
        end

        SocketS["src/socket/teamCodingSocket.js (Socket Server Handler)"]
    end

    %% External APIs
    subgraph ExternalAPIs ["External APIs & Services"]
        Judge0["Judge0 API (Sandbox Compiler)"]
        Gemini["Google Gemini 2.5 Flash"]
        Cloudinary["Cloudinary Media CDN"]
    end

    %% Flows
    B --> Pages
    Pages --> Components
    Pages --> Hook
    Pages --> StateStore
    StateStore --> Store
    Hook --> StateStore
    Axios --> Routes
    Hook <==>|WebSockets| SocketS
    
    ServerEntry --> Config
    ServerEntry --> Routes
    ServerEntry --> SocketS
    Routes --> Controllers
    Controllers --> Models
    Controllers --> Config

    Controllers -->|Batch compile| Judge0
    Controllers -->|Socratic prompt| Gemini
    Controllers -->|Signature & image| Cloudinary
```

---

## 📂 2. File & Folder Explanation

### A. Frontend Layer (`frontend/`)

1.  **`main.jsx` & `App.jsx`**:
    *   `main.jsx` initializes React, binds standard styling sheets, and mounts the Redux Store wrapper.
    *   `App.jsx` declares client-side endpoints and renders protective route wraps based on authentication state.
2.  **`pages/`**:
    *   **[Homepage.jsx](file:///c:/Users/alamk/OneDrive/Desktop/CodeMaster/frontend/src/pages/Homepage.jsx)**: Lists problem sets, holds filtering parameters (tag selectors, difficulty chips), and serves video lectures.
    *   **[ProblemPage.jsx](file:///c:/Users/alamk/OneDrive/Desktop/CodeMaster/frontend/src/pages/ProblemPage.jsx)**: Splits views into instructions, compiler consoles, AI reviews, and doubt-solver chats.
    *   **[TeamCodingLobby.jsx](file:///c:/Users/alamk/OneDrive/Desktop/CodeMaster/frontend/src/pages/TeamCodingLobby.jsx)** & **[TeamCodingPage.jsx](file:///c:/Users/alamk/OneDrive/Desktop/CodeMaster/frontend/src/pages/TeamCodingPage.jsx)**: Manages team lobby entries and mounts the collaborative Monaco editor workspace.
3.  **`components/`**:
    *   **`AlgorithmAnimator/`**: Manages step-by-step visual animation rendering and quiz validation.
    *   **`Dashboard/`**: Renders profile metrics, responsive stats widgets, and customized settings forms.
4.  **`store/`**:
    *   Provides centralized global states:
        *   `authSlice.js` $\rightarrow$ checks session validity.
        *   `teamCodingSlice.js` $\rightarrow$ handles live client state syncs.
        *   `dashboardSlice.js` $\rightarrow$ retrieves user data.
5.  **`hooks/useTeamSocket.js`**:
    *   Registers listeners for Socket.IO events and emits debounced user code updates.
6.  **`utils/axiosClient.js`**:
    *   Configures Axios with default configurations and intercepts outbound requests to attach credentials automatically.

---

### B. Backend Layer (`Backend/`)

1.  **`index.js`**:
    *   Initializes the Express server, binds security middlewares (CORS settings, Cookie Parser, rate limiters), registers API routers, and connects to databases.
2.  **`config/`**:
    *   `db.js` $\rightarrow$ Sets up MongoDB connection pools.
    *   `redis.js` $\rightarrow$ Initiates connections to Redis Cloud instances.
3.  **`routes/` & `controllers/`**:
    *   **`userAuth.js` / `userAuthenticate.js`**: Coordinates OTP creation, password resets, registration audits, and login handlers.
    *   **`submit.js` / `userSubmission.js`**: Batches user test cases and evaluates them via Judge0 compile containers.
    *   **`aiChatting.js` / `solveDoubt.js` / `codeReview.js` / `algorithmAnimation.js`**: Interfaces with Google Gemini 2.5 Flash SDKs.
4.  **`models/`**:
    *   Stores structural criteria:
        *   `user.js` $\rightarrow$ Bio data, solved sets, details.
        *   `problem.js` $\rightarrow$ Starter code strings, test descriptions.
        *   `submission.js` $\rightarrow$ Historical logs, runtime details.
        *   `teamRoom.js` $\rightarrow$ Chat buffers, collab states.
        *   `OTP.js` $\rightarrow$ Transient code verifications.
5.  **`socket/teamCodingSocket.js`**:
    *   Authorizes inbound socket handshakes via verified JWTs and broadcasts real-time events.

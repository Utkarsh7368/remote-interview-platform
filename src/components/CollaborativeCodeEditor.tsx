import { useQuery, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { api } from "../../convex/_generated/api";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { label: "JavaScript", value: "javascript", version: "18.15.0" },
  { label: "Python", value: "python", version: "3.10.0" },
  { label: "Java", value: "java", version: "15.0.2" },
  { label: "C++", value: "cpp", version: "10.2.0" },
  { label: "C#", value: "csharp", version: "6.12.0" },
  { label: "Go", value: "go", version: "1.20.2" },
  { label: "Ruby", value: "ruby", version: "3.0.0" },
  { label: "PHP", value: "php", version: "8.2.3" },
  { label: "Rust", value: "rust", version: "1.68.2" },
  { label: "TypeScript", value: "typescript", version: "5.0.3" },
];

function useDebouncedCallback(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  return (...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  };
}

export function CollaborativeCodeEditor({ meetingId, language: initialLanguage }: { meetingId: string, language: string }) {
  const codeDoc = useQuery(api.codes.getCode, { meetingId }) ?? "";
  const updateCode = useMutation(api.codes.updateCode);
  const outputDoc = useQuery(api.codes.getOutput, { meetingId }) ?? "";
  const updateOutput = useMutation(api.codes.updateOutput);
  const languageDoc = useQuery(api.codes.getLanguage, { meetingId }) ?? "javascript";
  const updateLanguage = useMutation(api.codes.updateLanguage);
  const [localCode, setLocalCode] = useState(codeDoc);
  const [language, setLanguage] = useState(initialLanguage || "javascript");
  const [version, setVersion] = useState(LANGUAGES.find(l => l.value === (initialLanguage || "javascript"))?.version || "");
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setLocalCode(codeDoc);
  }, [codeDoc]);

  // Only update localCode from codeDoc if it changed from another user
  useEffect(() => {
    if (codeDoc !== localCode) {
      setLocalCode(codeDoc);
    }
  }, [codeDoc]);

  // Debounced update
  const debouncedUpdate = useDebouncedCallback((newCode: string) => {
    if (newCode !== codeDoc) {
      updateCode({ meetingId, code: newCode, language });
    }
  }, 200); // 200ms debounce

  useEffect(() => {
    debouncedUpdate(localCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCode, meetingId, language]);

  useEffect(() => {
    const lang = LANGUAGES.find(l => l.value === language);
    setVersion(lang?.version || "");
  }, [language]);

  useEffect(() => {
    setOutput(outputDoc);
  }, [outputDoc]);

  // Sync language with Convex
  useEffect(() => {
    if (languageDoc !== language) {
      setLanguage(languageDoc);
    }
  }, [languageDoc]);

  // Run code using Piston API
  async function runCode() {
    setIsRunning(true);
    setOutput("");
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          version,
          files: [{ name: `Main.${language}`, content: localCode }],
        }),
      });
      const data = await response.json();
      // Show output and files (if present)
      let result = "";
      if (data.run) {
        result += data.run.stdout ? data.run.stdout : "";
        if (data.run.stderr) {
          result += "\n[stderr]:\n" + data.run.stderr;
        }
        result += `\n[exit code]: ${data.run.code}`;
      } else if (data.output || data.message) {
        result += data.output || data.message;
      } else {
        result += JSON.stringify(data);
      }
      if (data.files && Array.isArray(data.files)) {
        result += "\n\nFiles:\n" + data.files.map((f: any) => `${f.name}:\n${f.content}`).join("\n\n");
      }
      setOutput(result || JSON.stringify(data));
      await updateOutput({ meetingId, output: result || JSON.stringify(data) });
    } catch (err: any) {
      setOutput("Error: " + err.message);
      await updateOutput({ meetingId, output: "Error: " + err.message });
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#101014", borderRadius: 12, boxShadow: "0 2px 16px #0004", padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <select
          value={language}
          onChange={e => {
            setLanguage(e.target.value);
            updateLanguage({ meetingId, language: e.target.value });
          }}
          style={{
            padding: "8px 16px",
            fontSize: 16,
            borderRadius: 6,
            border: "1px solid #333",
            background: "#18181c",
            color: "#fff",
            outline: "none",
            minWidth: 160,
            boxShadow: "0 1px 4px #0002"
          }}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label} ({l.version})</option>
          ))}
        </select>
        <button
          onClick={runCode}
          disabled={isRunning}
          style={{
            padding: "8px 28px",
            fontSize: 16,
            background: isRunning ? "#444" : "#2d72d9",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            letterSpacing: 1,
            cursor: isRunning ? "not-allowed" : "pointer",
            boxShadow: "0 1px 4px #0002",
            transition: "background 0.2s"
          }}
        >
          {isRunning ? "Running..." : "Run"}
        </button>
      </div>
      <div style={{ borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 8px #0002", marginBottom: 16 }}>
        <Editor
          height={"60vh"}
          defaultLanguage={language}
          language={language}
          theme="vs-dark"
          value={localCode}
          onChange={(value) => setLocalCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 18,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            wordWrap: "on",
            wrappingIndent: "indent",
          }}
        />
      </div>
      <div style={{ marginTop: 0, background: "#181818", color: "#fff", padding: 18, borderRadius: 8, minHeight: 60, fontFamily: "monospace", whiteSpace: "pre-wrap", boxShadow: "0 1px 8px #0002", fontSize: 15 }}>
        <b style={{ color: "#2d72d9" }}>Output:</b>
        <div>{output}</div>
      </div>
    </div>
  );
}

import fs from "fs";
import path from "path";

const README_PATH = path.resolve(process.cwd(), "README.md");

async function main() {
  const input = await new Promise((resolve) => {
    let data = "";
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
  });

  const hookData = JSON.parse(input);
  const todos = hookData.tool_response?.newTodos ?? [];

  const lines = [
    "## Tasks",
    "",
    ...todos.map((t) => {
      const checkbox = t.status === "completed" ? "[x]" : "[ ]";
      const priority = t.priority ? ` _(${t.priority})_` : "";
      return `- ${checkbox} ${t.content}${priority}`;
    }),
    "",
  ];

  const marker_start = "<!-- todo-hook:start -->";
  const marker_end = "<!-- todo-hook:end -->";
  const block = `${marker_start}\n${lines.join("\n")}\n${marker_end}`;

  let readme = fs.existsSync(README_PATH)
    ? fs.readFileSync(README_PATH, "utf8")
    : "";

  if (readme.includes(marker_start)) {
    readme = readme.replace(
      new RegExp(`${marker_start}[\\s\\S]*?${marker_end}`),
      block
    );
  } else {
    readme = readme.trimEnd() + "\n\n" + block + "\n";
  }

  fs.writeFileSync(README_PATH, readme);
}

main().catch((err) => {
  console.error(`todo_hook error: ${err.message}`);
  process.exit(1);
});

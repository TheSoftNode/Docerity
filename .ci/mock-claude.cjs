// A stand-in for the Claude Messages API: answers with a record_grade tool call.
// "BAD" in the work → low marks; "UNSURE" → asks for a teacher; otherwise full marks (999, which must be clamped).
const http = require("http");
const fs = require("fs");
http
  .createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const body = JSON.parse(raw || "{}");
      const text = body.messages?.[0]?.content ?? "";
      const n = Number(/\((\d+) entries\)/.exec(body.tools?.[0]?.input_schema?.properties?.criteria?.description ?? "")?.[1] ?? 1);
      const work = text.split("<student_work>")[1] ?? "";
      const unsure = work.includes("UNSURE");
      const bad = work.includes("BAD");
      const input = {
        criteria: Array.from({ length: n }, (_, i) => ({ points: bad ? 5 : unsure ? 8 : 999, comment: bad ? "This line isn't met yet." : `Line ${i + 1} looks right.` })),
        feedback: bad ? "A start, but the function doesn't return the right amount yet. Add the tip before dividing." : "Clear, working code. Nice handling of zero people.",
        needs_human: unsure,
      };
      fs.appendFileSync("ci-shots/mock.txt", `${req.method} ${req.url} key=${req.headers["x-api-key"]} model=${body.model} tool_choice=${body.tool_choice?.name} bad=${bad} unsure=${unsure}\n`);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ content: [{ type: "tool_use", id: "t1", name: "record_grade", input }] }));
    });
  })
  .listen(4010);

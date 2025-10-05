import React, { useState, useEffect } from "react";

// 6x6 Multiplication Sprint — Custom time limit, factor range, and no-duplicates mode
// Avoids exact repeats (but allows mirrored problems) until all combos are used.

export default function MultiplicationSprint6x6() {
  const [timeLimit, setTimeLimit] = useState(() => parseInt(localStorage.getItem("sprintTimeLimit")) || 10);
  const [minFactor, setMinFactor] = useState(() => parseInt(localStorage.getItem("sprintMinFactor")) || 1);
  const [maxFactor, setMaxFactor] = useState(() => parseInt(localStorage.getItem("sprintMaxFactor")) || 6);
  const [noDuplicates, setNoDuplicates] = useState(() => {
    const stored = localStorage.getItem("sprintNoDuplicates");
    return stored ? stored === "true" : true; // on by default
  });

  const [secondsLeft, setSecondsLeft] = useState(timeLimit * 60);
  const [running, setRunning] = useState(false);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [input, setInput] = useState("");
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const [usedProblems, setUsedProblems] = useState([]);

  useEffect(() => {
    localStorage.setItem("sprintTimeLimit", timeLimit);
    localStorage.setItem("sprintMinFactor", minFactor);
    localStorage.setItem("sprintMaxFactor", maxFactor);
    localStorage.setItem("sprintNoDuplicates", noDuplicates);
  }, [timeLimit, minFactor, maxFactor, noDuplicates]);

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function nextProblem(prevUsed = usedProblems) {
    let possiblePairs = [];
    for (let i = minFactor; i <= maxFactor; i++) {
      for (let j = minFactor; j <= maxFactor; j++) {
        possiblePairs.push(`${i}-${j}`);
      }
    }

    if (noDuplicates) {
      const remaining = possiblePairs.filter(p => !prevUsed.includes(p));
      if (remaining.length === 0) {
        // All problems used, reset pool quietly
        setUsedProblems([]);
        return nextProblem([]);
      }
      const pick = remaining[randInt(0, remaining.length - 1)];
      const [ai, bj] = pick.split('-').map(Number);
      setA(ai);
      setB(bj);
      setUsedProblems(prev => [...prev, pick]);
    } else {
      const ai = randInt(minFactor, maxFactor);
      const bj = randInt(minFactor, maxFactor);
      setA(ai);
      setB(bj);
    }
    setInput("");
  }

  function start() {
    setRunning(true);
    setDone(false);
    setSecondsLeft(timeLimit * 60);
    setCorrect(0);
    setAttempts(0);
    setHistory([]);
    setUsedProblems([]);
    nextProblem([]);
  }

  function reset() {
    setRunning(false);
    setDone(false);
    setSecondsLeft(timeLimit * 60);
    setHistory([]);
    setCorrect(0);
    setAttempts(0);
    setUsedProblems([]);
    setInput("");
  }

  useEffect(() => {
    let timer;
    if (running && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timer);
            setRunning(false);
            setDone(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [running, secondsLeft]);

  function submitAnswer(e) {
    e.preventDefault();
    if (!running) return;
    const ans = parseInt(input, 10);
    const correctAns = a * b;
    const isCorrect = ans === correctAns;
    setAttempts((n) => n + 1);
    if (isCorrect) setCorrect((n) => n + 1);
    setHistory((h) => [...h, { a, b, ans, correct: isCorrect }]);
    nextProblem();
  }

  function printReport() {
    const newWin = window.open("", "report");
    newWin.document.write("<html><head><title>Multiplication Sprint Report</title></head><body>");
    newWin.document.write(`<h2>Multiplication Sprint Report</h2>`);
    newWin.document.write(`<p>Time Limit: ${timeLimit} minutes</p>`);
    newWin.document.write(`<p>Factor Range: ${minFactor} – ${maxFactor}</p>`);
    newWin.document.write(`<p>No Duplicates: ${noDuplicates ? 'Yes' : 'No'}</p>`);
    newWin.document.write(`<p>Total Attempts: ${attempts}</p>`);
    newWin.document.write(`<p>Correct Answers: ${correct}</p>`);
    newWin.document.write(`<p>Accuracy: ${attempts ? ((correct / attempts) * 100).toFixed(1) : 0}%</p>`);
    newWin.document.write("<ul>");
    history.forEach((h) => {
      newWin.document.write(`<li>${h.a} × ${h.b} = ${h.a * h.b}, You: ${h.ans} (${h.correct ? '✔️' : '❌'})</li>`);
    });
    newWin.document.write("</ul></body></html>");
    newWin.document.close();
    newWin.print();
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Multiplication Sprint</h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <label className="text-sm text-slate-400">Time Limit (minutes):</label>
          <input
            type="number"
            value={timeLimit}
            min="1"
            max="60"
            disabled={running}
            onChange={(e) => setTimeLimit(Number(e.target.value))}
            className="w-20 px-2 py-1 bg-slate-800 text-white rounded border border-slate-700"
          />

          <label className="text-sm text-slate-400">Min Factor:</label>
          <input
            type="number"
            value={minFactor}
            min="0"
            max="12"
            disabled={running}
            onChange={(e) => setMinFactor(Number(e.target.value))}
            className="w-20 px-2 py-1 bg-slate-800 text-white rounded border border-slate-700"
          />

          <label className="text-sm text-slate-400">Max Factor:</label>
          <input
            type="number"
            value={maxFactor}
            min="1"
            max="12"
            disabled={running}
            onChange={(e) => setMaxFactor(Number(e.target.value))}
            className="w-20 px-2 py-1 bg-slate-800 text-white rounded border border-slate-700"
          />

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={noDuplicates}
              disabled={running}
              onChange={(e) => setNoDuplicates(e.target.checked)}
            />
            No Duplicates
          </label>
        </div>

        <div className="text-3xl font-mono mb-4">
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </div>

        {!done ? (
          <>
            {running && (
              <form onSubmit={submitAnswer} className="mb-4">
                <div className="text-5xl font-bold mb-4">
                  {a} × {b} = ?
                </div>
                <input
                  type="number"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="text-3xl p-2 rounded bg-slate-800 text-white border border-slate-700 w-32 text-center"
                  autoFocus
                />
              </form>
            )}

            <div className="flex gap-4">
              {!running && <button onClick={start} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Start</button>}
              {running && <button onClick={reset} className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium">Reset</button>}
            </div>
          </>
        ) : (
          <div className="mt-6 bg-slate-800 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">Session Complete</h2>
            <p>Total Attempts: {attempts}</p>
            <p>Correct: {correct}</p>
            <p>Accuracy: {attempts ? ((correct / attempts) * 100).toFixed(1) : 0}%</p>
            <p>Factor Range: {minFactor} – {maxFactor}</p>
            <p>No Duplicates: {noDuplicates ? 'Yes' : 'No'}</p>
            <button onClick={printReport} className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium">Print Report</button>
          </div>
        )}
      </div>
    </div>
  );
}

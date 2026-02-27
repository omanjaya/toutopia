import type { GeneratedQuestion } from "./ai-provider.service";

interface ParseResult {
  questions: GeneratedQuestion[];
  errors: { index: number; message: string }[];
}

// --- JSON Parser ---

interface JsonQuestionInput {
  content?: string;
  type?: string;
  difficulty?: string;
  explanation?: string;
  source?: string;
  options?: {
    label?: string;
    content?: string;
    isCorrect?: boolean;
    order?: number;
  }[];
}

export function parseJsonFile(text: string): ParseResult {
  const questions: GeneratedQuestion[] = [];
  const errors: { index: number; message: string }[] = [];

  let data: { questions?: JsonQuestionInput[] } | JsonQuestionInput[];

  try {
    data = JSON.parse(text) as typeof data;
  } catch {
    return { questions: [], errors: [{ index: 0, message: "File JSON tidak valid" }] };
  }

  const items: JsonQuestionInput[] = Array.isArray(data)
    ? data
    : Array.isArray(data.questions)
      ? data.questions
      : [];

  if (items.length === 0) {
    return {
      questions: [],
      errors: [{ index: 0, message: "Tidak ada soal ditemukan dalam file JSON" }],
    };
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    if (!item.content || item.content.length < 10) {
      errors.push({ index: i, message: `Soal #${i + 1}: Konten terlalu pendek (minimal 10 karakter)` });
      continue;
    }

    if (!Array.isArray(item.options) || item.options.length < 2) {
      errors.push({ index: i, message: `Soal #${i + 1}: Minimal 2 opsi jawaban` });
      continue;
    }

    const options = item.options.map((opt, idx) => ({
      label: opt.label ?? String.fromCharCode(65 + idx),
      content: opt.content ?? "",
      isCorrect: Boolean(opt.isCorrect),
      order: opt.order ?? idx,
    }));

    const hasCorrect = options.some((o) => o.isCorrect);
    if (!hasCorrect) {
      errors.push({ index: i, message: `Soal #${i + 1}: Tidak ada jawaban benar` });
      continue;
    }

    const validTypes = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE", "NUMERIC"];
    const validDifficulties = ["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"];

    questions.push({
      content: item.content,
      explanation: item.explanation ?? "",
      difficulty: validDifficulties.includes(item.difficulty ?? "") ? item.difficulty! : "MEDIUM",
      type: validTypes.includes(item.type ?? "") ? item.type! : "SINGLE_CHOICE",
      options,
    });
  }

  return { questions, errors };
}

// --- Markdown Parser ---

export function parseMarkdownFile(text: string): ParseResult {
  const questions: GeneratedQuestion[] = [];
  const errors: { index: number; message: string }[] = [];

  // Split by --- separator or ## Soal headers
  const blocks = text
    .split(/(?:^---$|^## (?:Soal|Question)\s*\d*)/m)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    try {
      const parsed = parseMdBlock(block);
      if (parsed) {
        questions.push(parsed);
      } else {
        errors.push({ index: i, message: `Blok #${i + 1}: Format tidak valid` });
      }
    } catch (err) {
      errors.push({
        index: i,
        message: `Blok #${i + 1}: ${err instanceof Error ? err.message : "Parse error"}`,
      });
    }
  }

  return { questions, errors };
}

function parseMdBlock(block: string): GeneratedQuestion | null {
  const lines = block.split("\n").map((l) => l.trim());

  // Extract options (lines starting with - A., - B., etc. or A., B., etc.)
  const optionLines: { label: string; content: string; marked: boolean }[] = [];
  const contentLines: string[] = [];
  let explanation = "";
  let difficulty = "MEDIUM";
  let answer = "";
  let inContent = true;

  for (const line of lines) {
    // Check for option pattern: "- A. text" or "A. text" or "- A) text"
    const optionMatch = line.match(
      /^[-*]?\s*([A-Fa-f])[.)]\s*(.+?)(?:\s*\(\*\)\s*)?$/
    );
    if (optionMatch) {
      inContent = false;
      const isMarked = line.includes("(*)");
      optionLines.push({
        label: optionMatch[1].toUpperCase(),
        content: optionMatch[2].trim(),
        marked: isMarked,
      });
      continue;
    }

    // Check for metadata lines
    const answerMatch = line.match(/^\*{0,2}(?:Jawaban|Answer)\*{0,2}:\*{0,2}\s*([A-Fa-f])/i);
    if (answerMatch) {
      answer = answerMatch[1].toUpperCase();
      continue;
    }

    const explanationMatch = line.match(
      /^\*{0,2}(?:Pembahasan|Explanation|Penjelasan)\*{0,2}:\*{0,2}\s*(.+)/i
    );
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
      continue;
    }

    const difficultyMatch = line.match(
      /^\*{0,2}(?:Kesulitan|Difficulty|Tingkat)\*{0,2}:\*{0,2}\s*(\w+)/i
    );
    if (difficultyMatch) {
      const d = difficultyMatch[1].toUpperCase();
      const validDifficulties = ["VERY_EASY", "EASY", "MEDIUM", "HARD", "VERY_HARD"];
      if (validDifficulties.includes(d)) {
        difficulty = d;
      }
      continue;
    }

    // Skip empty lines and headers
    if (line === "" || line.startsWith("#")) continue;

    if (inContent) {
      contentLines.push(line);
    }
  }

  const content = contentLines.join("\n").trim();
  if (!content || content.length < 10) return null;
  if (optionLines.length < 2) return null;

  // Determine correct answer
  const options = optionLines.map((opt, idx) => {
    let isCorrect = opt.marked;
    if (!isCorrect && answer && opt.label === answer) {
      isCorrect = true;
    }
    return {
      label: opt.label,
      content: opt.content,
      isCorrect,
      order: idx,
    };
  });

  const hasCorrect = options.some((o) => o.isCorrect);
  if (!hasCorrect) return null;

  return {
    content,
    explanation,
    difficulty,
    type: "SINGLE_CHOICE",
    options,
  };
}

export function parseImportFile(
  text: string,
  fileType: "json" | "md"
): ParseResult {
  if (fileType === "json") {
    return parseJsonFile(text);
  }
  return parseMarkdownFile(text);
}

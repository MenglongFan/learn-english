// localStorage 数据层：生词收藏 + SRS 固定间隔箱（1/3/7/14/30 天，答错重置）
// Key 约定：le:collection / le:srs，导出 JSON 时合并为一份

const INTERVALS = [1, 3, 7, 14, 30]; // box 0..4 的天数，答对 box+1

const K_COLLECTION = 'le:collection';
const K_SRS = 'le:srs';

type Collected = { meaning: string; lessonId: string; added: string };
type SrsItem = { box: number; due: string; added: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function read<T>(key: string): T {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') as T;
  } catch {
    return {} as T;
  }
}

function write(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

export const store = {
  isCollected(en: string): boolean {
    return en in read<Record<string, Collected>>(K_COLLECTION);
  },

  collect(en: string, meaning: string, lessonId: string) {
    const c = read<Record<string, Collected>>(K_COLLECTION);
    if (en in c) return;
    c[en] = { meaning, lessonId, added: today() };
    write(K_COLLECTION, c);
  },

  enqueue(en: string) {
    const s = read<Record<string, SrsItem>>(K_SRS);
    if (en in s) return;
    s[en] = { box: 0, due: today(), added: today() };
    write(K_SRS, s);
  },

  // 小测答错：标记弱项，明天到期（box 重置）
  markWeak(en: string) {
    const s = read<Record<string, SrsItem>>(K_SRS);
    if (!s[en]) s[en] = { box: 0, due: today(), added: today() };
    else s[en] = { ...s[en], box: 0, due: plusDays(1) };
    write(K_SRS, s);
  },

  dueItems(): Array<[string, SrsItem, string]> {
    const s = read<Record<string, SrsItem>>(K_SRS);
    const c = read<Record<string, Collected>>(K_COLLECTION);
    const t = today();
    return Object.entries(s)
      .filter(([, v]) => v.due <= t)
      .map(([en, v]) => [en, v, c[en]?.meaning || ''] as [string, SrsItem, string]);
  },

  // 复习判定：记住→升箱（毕业即移出），忘了→重置 1 天
  review(en: string, remembered: boolean) {
    const s = read<Record<string, SrsItem>>(K_SRS);
    const item = s[en];
    if (!item) return;
    if (remembered) {
      const next = item.box + 1;
      if (next >= INTERVALS.length) {
        delete s[en]; // 毕业：30 天箱通过，移出队列
      } else {
        s[en] = { ...item, box: next, due: plusDays(INTERVALS[next]) };
      }
    } else {
      s[en] = { ...item, box: 0, due: plusDays(INTERVALS[0]) };
    }
    write(K_SRS, s);
  },

  collectedList(): Array<[string, Collected]> {
    return Object.entries(read<Record<string, Collected>>(K_COLLECTION));
  },

  stats(): { collected: number; srs: number; due: number } {
    const c = Object.keys(read<Record<string, Collected>>(K_COLLECTION)).length;
    const s = read<Record<string, SrsItem>>(K_SRS);
    const t = today();
    const due = Object.values(s).filter((v) => v.due <= t).length;
    return { collected: c, srs: Object.keys(s).length, due };
  },

  exportAll(): string {
    return JSON.stringify(
      { exportedAt: new Date().toISOString(), collection: read(K_COLLECTION), srs: read(K_SRS) },
      null,
      2,
    );
  },

  importAll(json: string): boolean {
    try {
      const data = JSON.parse(json);
      if (data.collection) write(K_COLLECTION, data.collection);
      if (data.srs) write(K_SRS, data.srs);
      return true;
    } catch {
      return false;
    }
  },
};

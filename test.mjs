import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

// Exercise the browser-independent guide against clinical scenarios and every
// reachable choice path. No UI, network, or third-party test dependency is used.
const source = await readFile(new URL('./src/guide.js', import.meta.url), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(source, context, { filename: 'guide.js', timeout: 1000 });
const guide = context.window.StatGuide;
assert.ok(guide, 'The guide must expose its public API on window.StatGuide');

const plain = (value) => JSON.parse(JSON.stringify(value));
const allText = (value) => JSON.stringify(value);
const canonical = (state) => JSON.stringify(Object.fromEntries(Object.entries(state).sort(([a], [b]) => a.localeCompare(b))));
const failures = [];
let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
  } catch (error) {
    failures.push({ name, message: error.message });
  }
}
function resolve(state, expectedId, requiredConcepts = [], requiredSources = []) {
  const before = canonical(state);
  const result = guide.resolve(state);
  assert.ok(result, `No result for ${before}`);
  assert.equal(result.id, expectedId, before);
  assert.equal(canonical(state), before, 'Resolution must not mutate the supplied state');
  for (const concept of requiredConcepts) assert.match(allText(result), concept, `${expectedId}: missing ${concept}`);
  for (const id of requiredSources) assert.ok(result.sources.includes(id), `${expectedId}: missing source ${id}`);
  return result;
}
const compare = (data, design, aim) => ({ goal: 'compare', data, design, ...(aim ? { aim } : {}) });

// These scenarios are an independent specification of important distinctions,
// including paired data, categorical outcomes and the quantity being compared.
test('01 Independent continuous means: Welch, without a fixed n cutoff', () => {
  resolve(compare('continuous', 'ind2', 'mean'), 'welch-t', [/平均/, /分散/, /外れ値/], ['ttest']);
});
test('02 Independent means in three or more groups: Welch ANOVA', () => {
  resolve(compare('continuous', 'indmany', 'mean'), 'welch-anova', [/多重/, /分布/], ['anova']);
});
test('03 Independent rank comparisons preserve the estimand distinction', () => {
  resolve(compare('continuous', 'ind2', 'rank'), 'mann-whitney', [/中央値/, /条件/, /平均差/], ['rank-meaning']);
  resolve(compare('ordinal', 'indmany'), 'kruskal-wallis', [/近似/, /多重/], ['kruskal']);
});
test('04 Paired means use the within-person difference', () => {
  resolve(compare('continuous', 'pair2', 'mean'), 'paired-t', [/変化量の分布/, /独立性/], ['paired']);
});
test('05 Signed ranks explain symmetry, zero differences and ties', () => {
  resolve(compare('continuous', 'pair2', 'rank'), 'wilcoxon-signed', [/対称性/, /差0/, /同順位/], ['wilcoxon']);
});
test('06 Pure ordinal paired responses do not default to signed ranks', () => {
  resolve(compare('ordinal', 'pair2'), 'sign-test', [/方向/, /変化なし/], ['sign']);
});
test('07 Repeated numerical responses retain within-person structure', () => {
  resolve(compare('continuous', 'pairmany', 'mean'), 'repeated-anova', [/球面性/, /欠測/, /個人内/], ['repeated']);
  resolve(compare('ordinal', 'pairmany'), 'friedman', [/対象内の順位/, /欠測/], ['friedman']);
  resolve(compare('continuous', 'mixed'), 'clustered-continuous-mixed', [/群間の変化の差/, /相関/], ['repeated']);
});
test('08 Independent binary proportions depend on expected cell counts', () => {
  resolve(compare('binary', 'ind2'), 'chi-fisher', [/期待度数/, /Fisher/, /振り分けません/], ['chi-square', 'fisher']);
});
test('09 Paired binary results use McNemar and discordant pairs', () => {
  resolve(compare('binary', 'pair2'), 'mcnemar', [/不一致ペア/, /正確法/], ['mcnemar']);
});
test('10 Repeated binary results with three or more conditions use Cochran Q', () => {
  resolve(compare('binary', 'pairmany'), 'cochran-q', [/近似/, /欠測/], ['cochran']);
});
test('11 Multicategory responses are not silently treated as binary', () => {
  resolve(compare('nominal', 'ind2'), 'chi-square-table', [/分割表/, /正確法/], ['chi-square']);
  resolve(compare('nominal', 'pair2'), 'stuart-maxwell', [/共通のカテゴリー/, /周辺分布/], ['stuart']);
  resolve(compare('nominal', 'pairmany'), 'clustered-nominal-repeated', [/相関/], ['gee']);
});
test('12 Correlation describes paired variables and respects clustering', () => {
  resolve({ goal: 'association', pattern: 'linear', structure: 'independent' }, 'pearson', [/直線/, /2つの値/, /散布図/], ['pearson']);
  resolve({ goal: 'association', pattern: 'rank', structure: 'independent' }, 'spearman', [/単調/, /同順位/], ['spearman']);
  for (const pattern of ['linear', 'rank', 'unsure']) {
    resolve({ goal: 'association', pattern, structure: 'clustered' }, 'clustered-other-association', [/相関/], ['gee']);
  }
});
test('13 Adjusted continuous outcomes check model residuals', () => {
  resolve({ goal: 'adjust', outcome: 'continuous', structure: 'independent', intent: 'effect' }, 'linear-effect', [/残差/, /全説明変数の正規性が必要なわけではありません/, /因果/], ['residuals']);
});
test('14 Logistic models distinguish effect estimation from prediction', () => {
  resolve({ goal: 'adjust', outcome: 'binary', structure: 'independent', intent: 'effect' }, 'logistic-effect', [/オッズ比/, /完全分離/, /係数/], ['events']);
  resolve({ goal: 'adjust', outcome: 'binary', structure: 'independent', intent: 'prediction' }, 'logistic-prediction', [/候補パラメータ/, /校正/, /内部検証/], ['prediction-size']);
});
test('15 Survival description and curve comparison remain separate', () => {
  resolve({ goal: 'survival', task: 'describe' }, 'kaplan-meier', [/曲線そのものは検定ではありません/, /打ち切り/, /リスク集合/], ['surv-data', 'km']);
  resolve({ goal: 'survival', task: 'compare' }, 'log-rank', [/時間/, /打ち切り/, /曲線の交差/], ['surv-data', 'logrank']);
});
test('16 Cox candidates require time/status and proportional hazards checks', () => {
  resolve({ goal: 'survival', task: 'adjust' }, 'cox-effect', [/時間と状態/, /比例ハザード性/, /打ち切り/], ['cox', 'cox-ph', 'survival-size']);
  resolve({ goal: 'adjust', outcome: 'time', structure: 'clustered', intent: 'prediction' }, 'cox-clustered-prediction', [/集団内の相関/, /指定した時点/, /校正/], ['cox-ph', 'prediction-size']);
});
test('17 ROC estimation and paired/unpaired AUC comparisons remain separate', () => {
  resolve({ goal: 'diagnostic', task: 'estimate' }, 'roc-auc', [/基準となる状態/, /感度/, /特異度/, /校正とは別/], ['roc']);
  resolve({ goal: 'diagnostic', task: 'compare', pairing: 'paired' }, 'roc-compare-paired', [/同じ対象/, /相関/], ['roc-test']);
  resolve({ goal: 'diagnostic', task: 'compare', pairing: 'independent' }, 'roc-compare-independent', [/独立した対象/, /対象集団の違い/], ['roc-test']);
});
test('18 An undecided estimand returns choices instead of inventing a decision', () => {
  for (const design of ['ind2', 'indmany', 'pair2', 'pairmany']) {
    const result = resolve(compare('continuous', design, 'unsure'), `mean-or-rank-${design}`, [/平均/, /順位/, /機械的に切り替えない/]);
    assert.equal(result.candidates.length, 2);
  }
  const r = resolve({ goal: 'association', pattern: 'unsure', structure: 'independent' }, 'correlation-choice', [/2群/, /散布図/]);
  assert.equal(r.candidates.length, 2);
});

const leaves = [];
const partials = [];
const questionsSeen = new Map();
function visit(state, depth = 0) {
  assert.ok(depth <= 3, 'The guide must need at most three questions after the purpose');
  const qs = guide.questionsFor(state);
  assert.ok(qs.length > 0 && qs.length <= 3);
  assert.equal(new Set(qs.map((q) => q.key)).size, qs.length, 'Question keys must not repeat');
  for (const q of qs) {
    assert.ok(q.key && q.title && q.help);
    assert.ok(q.options.length >= 2);
    assert.equal(new Set(q.options.map((o) => o.value)).size, q.options.length);
    for (const o of q.options) assert.ok(o.value && o.label && o.detail);
    questionsSeen.set(`${state.goal}:${q.key}`, q);
  }
  const next = qs.find((q) => !q.options.some((o) => o.value === state[q.key]));
  if (next) {
    assert.equal(guide.resolve(state), null, 'An incomplete path must not return a finished recommendation');
    partials.push(plain(state));
    for (const o of next.options) visit({ ...state, [next.key]: o.value }, depth + 1);
  } else {
    const result = guide.resolve(state);
    assert.ok(result, `Dead end: ${canonical(state)}`);
    leaves.push({ state: plain(state), result: plain(result), depth });
  }
}
test('All 56 valid paths terminate, with a purpose plus at most three questions', () => {
  assert.equal(guide.goals.length, 5);
  assert.equal(new Set(guide.goals.map((g) => g.id)).size, 5);
  for (const goal of guide.goals) visit({ goal: goal.id });
  assert.equal(leaves.length, 56);
  const byGoal = Object.fromEntries(guide.goals.map((g) => [g.id, leaves.filter((x) => x.state.goal === g.id).length]));
  assert.deepEqual(byGoal, { compare: 28, association: 6, adjust: 16, survival: 3, diagnostic: 3 });
  assert.equal(new Set(leaves.map((x) => canonical(x.state))).size, 56);
});

test('Incomplete, malformed and invalid answers do not produce recommendations', () => {
  for (const value of [undefined, null, false, true, 0, 23, '', 'compare', [], {}, { goal: 'unknown' }]) {
    assert.equal(guide.resolve(value), null);
    assert.ok(Array.isArray(guide.questionsFor(value)));
  }
  for (const { state } of leaves) {
    for (const q of guide.questionsFor(state)) {
      for (const bad of [undefined, null, '', 'unknown', '__proto__', 0, true, [], {}]) {
        assert.equal(guide.resolve({ ...state, [q.key]: bad }), null, `Invalid ${q.key} was accepted`);
      }
    }
  }
});

test('Every result is complete, readable and linked to declared sources', () => {
  const sourceIds = new Set(guide.sources.map((s) => s.id));
  assert.equal(sourceIds.size, guide.sources.length);
  for (const { result } of leaves) {
    for (const field of ['id', 'title', 'english', 'reason', 'sample', 'report']) {
      assert.equal(typeof result[field], 'string');
      assert.ok(result[field].trim(), `${result.id}: empty ${field}`);
    }
    assert.equal(result.checks.length, 3, `${result.id}: keep three concise checks`);
    for (const check of result.checks) assert.ok(check.label && check.text);
    assert.ok(result.sources.length > 0);
    assert.equal(new Set(result.sources).size, result.sources.length);
    for (const id of result.sources) assert.ok(sourceIds.has(id), `${result.id}: undeclared source ${id}`);
  }
  const allowedHosts = new Set(['stat.ethz.ch', 'www.stat.ethz.ch', 'search.r-project.org', 'www.itl.nist.gov', 'pmc.ncbi.nlm.nih.gov', 'docs.scipy.org', 'www.statsmodels.org', 'support.sas.com', 'link.springer.com', 'www.bmj.com', 'pubmed.ncbi.nlm.nih.gov']);
  for (const item of guide.sources) {
    assert.ok(item.title && item.note);
    const url = new URL(item.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(allowedHosts.has(url.hostname), `Unexpected source host: ${url.hostname}`);
    assert.equal(url.username + url.password, '');
  }
});

test('The 18 quick-reference rows and five examples resolve to intended methods', () => {
  const quickIds = ['welch-t', 'welch-anova', 'paired-t', 'repeated-anova', 'mann-whitney', 'kruskal-wallis', 'wilcoxon-signed', 'friedman', 'chi-fisher', 'mcnemar', 'pearson', 'spearman', 'linear-effect', 'logistic-effect', 'kaplan-meier', 'log-rank', 'cox-effect', 'roc-auc'];
  const exampleIds = ['paired-t', 'chi-fisher', 'linear-effect', 'log-rank', 'roc-auc'];
  assert.equal(guide.quickRows.length, 18);
  assert.equal(guide.examples.length, 5);
  const reachable = new Set(leaves.map(({ state }) => canonical(state)));
  guide.quickRows.forEach((row, i) => {
    for (const field of ['method', 'purpose', 'setting', 'check']) assert.ok(row[field]);
    assert.ok(reachable.has(canonical(row.state)), `Unreachable quick row ${i}`);
    resolve(row.state, quickIds[i]);
  });
  guide.examples.forEach((example, i) => {
    assert.ok(example.label);
    assert.ok(reachable.has(canonical(example.state)), `Unreachable example ${i}`);
    resolve(example.state, exampleIds[i]);
  });
});

test('Sample counts and normality p values cannot switch the selected method', () => {
  const variants = [
    { n: 14, groupN: 19, events: 9, normalityP: 0.001 },
    { n: 15, groupN: 20, events: 10, normalityP: 0.049 },
    { n: 29, groupN: 29, events: 11, normalityP: 0.05 },
    { n: 30, groupN: 30, events: 100, normalityP: 0.051 },
    { n: 1000, groupN: 500, events: 2, normalityP: 0.9 }
  ];
  for (const { state, result } of leaves) {
    for (const extra of variants) assert.deepEqual(plain(guide.resolve({ ...state, ...extra })), result);
  }
});

test('Changing purpose cannot retain a recommendation from the previous purpose', () => {
  const previous = compare('binary', 'pair2');
  assert.equal(guide.resolve({ ...previous, goal: 'association' }), null);
  resolve({ ...previous, goal: 'association', pattern: 'linear', structure: 'independent' }, 'pearson');
  assert.equal(guide.resolve({ goal: 'diagnostic', task: 'describe' }), null);
  assert.equal(guide.resolve({ goal: 'diagnostic', task: 'compare' }), null);
  resolve({ goal: 'survival', task: 'compare', pairing: 'paired', data: 'binary', design: 'pair2' }, 'log-rank');
  resolve({ goal: 'compare', data: 'ordinal', design: 'pair2', aim: 'mean' }, 'sign-test');
});

const summary = {
  passed,
  failed: failures.length,
  reachablePaths: leaves.length,
  distinctResults: new Set(leaves.map(({ result }) => result.id)).size,
  maximumQuestionsAfterPurpose: Math.max(0, ...leaves.map(({ depth }) => depth)),
  quickReferencePresets: guide.quickRows.length,
  examplePresets: guide.examples.length,
  sourceEntries: guide.sources.length,
  guideSha256: createHash('sha256').update(source).digest('hex')
};
console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
}

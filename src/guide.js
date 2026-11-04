(function () {
  'use strict';

  const goals = [
    { id: 'compare', label: '群・前後の差', detail: '群の違いや、治療前後の変化を調べる', icon: 'compare' },
    { id: 'association', label: '2変数の関連', detail: '2つの値がどのように関係するか調べる', icon: 'association' },
    { id: 'adjust', label: '背景因子を調整', detail: '年齢・性別などを考慮した関連を調べる', icon: 'adjust' },
    { id: 'survival', label: 'イベントまでの時間', detail: '発症・再発・死亡までの経過を調べる', icon: 'survival' },
    { id: 'diagnostic', label: '検査の判別能', detail: '病気あり・なしを見分ける力を調べる', icon: 'diagnostic' }
  ];

  const sources = [
    { id: 'ttest', title: 'R：t検定・Welchの方法', url: 'https://stat.ethz.ch/R-manual/R-devel/library/stats/html/t.test.html', note: '独立した2群、対応のあるデータ、等分散を仮定しない方法。' },
    { id: 'anova', title: 'R：一元配置の平均比較', url: 'https://stat.ethz.ch/R-manual/R-devel/library/stats/html/oneway.test.html', note: '通常の分散分析とWelchの分散分析。' },
    { id: 'residuals', title: 'NIST：モデルの残差と仮定', url: 'https://www.itl.nist.gov/div898/handbook/pri/section2/pri24.htm', note: '残差の分布、独立性、分散の確認。' },
    { id: 'normal-plot', title: 'NIST：正規Q–Qプロットの見方', url: 'https://www.itl.nist.gov/div898/handbook/eda/section3/normprpl.htm', note: '点の並び方から、正規分布からのずれを確認する。' },
    { id: 'shapiro-reading', title: 'SciPy：Shapiro–Wilk検定の読み方', url: 'https://docs.scipy.org/doc/scipy/tutorial/stats/hypothesis_shapiro.html', note: '小さくないp値は、正規性を証明する結果ではない。' },
    { id: 'paired', title: 'NIST：対応のある観測の解析', url: 'https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm', note: '対応のあるt検定では対象内の差を扱う。' },
    { id: 'rank-meaning', title: 'Fay & Proschan：順位検定が答える問い', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2857732/', note: 'Mann–Whitneyとt検定の仮定・解釈を整理した論文。' },
    { id: 'wilcoxon', title: 'R：Wilcoxonの順位検定', url: 'https://search.r-project.org/R/refmans/stats/html/wilcox.test.html', note: '符号順位検定、順位和検定、差の対称性と計算法。' },
    { id: 'kruskal', title: 'SciPy：Kruskal–Wallis検定', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kruskal.html', note: '独立した群の順位比較と小標本での近似への注意。' },
    { id: 'friedman', title: 'R：Friedman検定', url: 'https://stat.ethz.ch/R-manual/R-devel/library/stats/html/friedman.test.html', note: '対応する条件がそろった反復測定の順位比較。' },
    { id: 'sign', title: 'NIST：符号検定', url: 'https://www.itl.nist.gov/div898/software/dataplot/refman1/auxillar/signtest.htm', note: '対応する値の増減方向を用いる方法。順序尺度にも適用できる。' },
    { id: 'chi-square', title: 'R：カイ二乗検定', url: 'https://www.stat.ethz.ch/R-manual/R-patched/library/stats/html/chisq.test.html', note: '分割表、期待度数、近似とシミュレーション。' },
    { id: 'fisher', title: 'R：Fisherの正確検定', url: 'https://www.stat.ethz.ch/R-manual/R-devel/library/stats/html/fisher.test.html', note: '疎な分割表などで用いる正確法。総数20未満に限定されない。' },
    { id: 'mcnemar', title: 'statsmodels：McNemar検定', url: 'https://www.statsmodels.org/stable/generated/statsmodels.stats.contingency_tables.mcnemar.html', note: '対応のある二値データ。不一致ペアと正確法。' },
    { id: 'cochran', title: 'statsmodels：CochranのQ検定', url: 'https://www.statsmodels.org/stable/generated/statsmodels.stats.contingency_tables.cochrans_q.html', note: '対応のある二値データを3条件以上で比較する方法。' },
    { id: 'stuart', title: 'statsmodels：周辺分布の同等性', url: 'https://www.statsmodels.org/stable/generated/statsmodels.stats.contingency_tables.SquareTable.homogeneity.html', note: '同じカテゴリーによる前後比較。Stuart–Maxwell検定など。' },
    { id: 'pearson', title: 'SciPy：Pearsonの相関係数', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html', note: '直線的関連、検定、信頼区間。' },
    { id: 'spearman', title: 'SciPy：Spearmanの順位相関', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html', note: '順位による単調な関連と小標本での推論。' },
    { id: 'repeated', title: 'SAS：反復測定と混合モデル', url: 'https://support.sas.com/documentation/cdl/en/statug/68162/HTML/default/statug_glm_details46.htm', note: '個人内相関、球面性、群と時点、欠測を含む設計。' },
    { id: 'gee', title: 'statsmodels：GEEと集団内相関', url: 'https://www.statsmodels.org/stable/gee.html', note: '連続・二値・順序・名義データの反復測定やクラスタを扱う。' },
    { id: 'ordinal-model', title: 'statsmodels：順序尺度の回帰モデル', url: 'https://www.statsmodels.org/stable/generated/statsmodels.miscmodels.ordinal_model.OrderedModel.html', note: '順序はあるが数値の間隔には意味を置かないアウトカム。' },
    { id: 'surv-data', title: 'R：生存時間データの定義', url: 'https://search.r-project.org/CRAN/refmans/survival/html/Surv.html', note: '追跡時間とイベント・打ち切りの状態を組み合わせる。' },
    { id: 'km', title: 'R：生存曲線の推定', url: 'https://www.stat.ethz.ch/R-manual/R-devel/library/survival/html/survfit.html', note: 'Kaplan–Meier法などによる曲線の推定。' },
    { id: 'logrank', title: 'R：生存曲線の比較', url: 'https://stat.ethz.ch/R-manual/R-devel/library/survival/html/survdiff.html', note: 'Log-rank検定と複数の生存曲線の比較。' },
    { id: 'cox', title: 'R：Cox比例ハザードモデル', url: 'https://search.r-project.org/CRAN/refmans/survival/html/coxph.html', note: '共変量、時間依存効果、クラスタを考慮する拡張。' },
    { id: 'cox-ph', title: 'R：比例ハザード性の確認', url: 'https://search.r-project.org/CRAN/refmans/survival/html/cox.zph.html', note: 'Coxモデルの比例ハザード性と残差の図示。' },
    { id: 'events', title: 'van Smedenら：10イベント則の限界', url: 'https://link.springer.com/article/10.1186/s12874-016-0267-3', note: 'イベント数だけではロジスティック回帰の精度を判断できない。' },
    { id: 'prediction-size', title: 'Rileyら：予測モデルの症例数設計', url: 'https://www.bmj.com/content/368/bmj.m441', note: '候補パラメータ数、総例数、イベント割合、予測性能に応じた設計。' },
    { id: 'survival-size', title: 'Schoenfeld：生存時間解析の症例数', url: 'https://pubmed.ncbi.nlm.nih.gov/6354290/', note: '効果や検出力に応じて必要イベント数を考える。' },
    { id: 'roc', title: 'pROC：ROC曲線とAUC', url: 'https://search.r-project.org/CRAN/refmans/pROC/html/roc.html', note: '二値の基準状態と検査値から判別能を評価する。' },
    { id: 'roc-test', title: 'pROC：2つのROC曲線の比較', url: 'https://search.r-project.org/CRAN/refmans/pROC/html/roc.test.html', note: '対応あり・なしを区別したAUC比較。DeLong法やブートストラップ。' }
  ];

  const option = (value, label, detail) => ({ value, label, detail });
  const question = (key, title, help, options) => ({ key, title, help, options });

  const dataQuestion = question('data', '比べる値の種類は？', '例に近いものを選んでください。', [
    option('continuous', '連続値', 'LDL-C、血圧、体重など'),
    option('ordinal', '順序のある値', '重症度や段階評価など'),
    option('binary', '二値', 'あり・なし、成功・失敗'),
    option('nominal', '3カテゴリー以上', '血液型など、順序のない分類')
  ]);
  const designQuestion = question('design', 'どのように比較しますか？', '「同じ人」には、対応づけたペアも含みます。', [
    option('ind2', '別々の人の2群', '治療群と対照群など'),
    option('indmany', '別々の人の3群以上', '3種類の治療法など'),
    option('pair2', '同じ人の2時点・2条件', '治療前と治療後など'),
    option('pairmany', '同じ人の3時点・3条件以上', '開始時・1か月・3か月など'),
    option('mixed', '群と時点を同時に比較', '治療群・対照群それぞれの前後など')
  ]);
  const aimQuestion = question('aim', '何の違いを調べたいですか？', '正規性検定のp値だけで、この選択を決める必要はありません。', [
    option('mean', '平均値・平均変化量', '平均でどれくらい違うか'),
    option('rank', '順位による大小関係', 'どちらが全体として高い傾向か'),
    option('unsure', 'まだ決めていない', '候補と、それぞれの問いを比べる')
  ]);
  const patternQuestion = question('pattern', 'どのような関連を調べたいですか？', 'まず散布図で関係の形を見ると選びやすくなります。', [
    option('linear', '直線的な関連', '一方が増えると、もう一方が直線的に変わる'),
    option('rank', '順位・単調な関連', '高い順・低い順がどれくらい一致するか'),
    option('unsure', 'まだ決めていない', 'PearsonとSpearmanを比べる')
  ]);
  const structureQuestion = question('structure', '観測のまとまりはありますか？', '同じ人の繰り返しや、施設・家族などの集まりは別に扱います。', [
    option('independent', '対象ごとに独立', '基本的に1人から1組の値'),
    option('clustered', '反復・集団内の相関がある', '同じ人の繰り返し、施設・家族など')
  ]);
  const outcomeQuestion = question('outcome', 'アウトカムの種類は？', '説明する側の因子ではなく、結果として調べたい値です。', [
    option('continuous', '連続値', 'LDL-C、血圧、体重など'),
    option('binary', '二値', '発症あり・なしなど'),
    option('time', 'イベントまでの時間', '再発・死亡までの期間など'),
    option('other', 'その他', '順序尺度、3分類以上、回数など')
  ]);
  const intentQuestion = question('intent', '解析の目的は？', '関連の推定と、個人の予測では評価する内容が変わります。', [
    option('effect', '関連・効果の大きさを推定', '背景因子を考慮した差や比を知りたい'),
    option('prediction', '個人の結果を予測', '複数の因子から値やリスクを予測したい')
  ]);
  const survivalQuestion = question('task', '時間の情報をどう使いたいですか？', '発生・打ち切りまでの時間と、イベントの有無が必要です。', [
    option('describe', '経過を示す', '生存確率やイベントなしの確率を描く'),
    option('compare', '群間を比較', '生存曲線の違いを調べる'),
    option('adjust', '背景因子を調整', '年齢・性別などを考慮する')
  ]);
  const diagnosticQuestion = question('task', 'どのように評価しますか？', '検査値・スコアと、基準となる病気あり・なしの情報を使います。', [
    option('estimate', '1つの検査・スコアを評価', 'ROC曲線、AUC、感度・特異度を調べる'),
    option('compare', '2つの検査・スコアを比較', 'AUCの差などを調べる')
  ]);
  const pairingQuestion = question('pairing', '2つの検査を誰に行いましたか？', '同じ人から得た検査結果には対応があります。', [
    option('paired', '同じ対象に両方を実施', '対応のあるROC比較'),
    option('independent', '別々の独立した対象', '対応のないROC比較')
  ]);

  function validAnswer(state, q) {
    return q.options.some((o) => o.value === state[q.key]);
  }

  function questionsFor(input) {
    const state = input && typeof input === 'object' ? input : {};
    if (state.goal === 'compare') {
      const qs = [dataQuestion];
      if (validAnswer(state, dataQuestion)) qs.push(designQuestion);
      if (state.data === 'continuous' && validAnswer(state, designQuestion) && state.design !== 'mixed') qs.push(aimQuestion);
      return qs;
    }
    if (state.goal === 'association') {
      return validAnswer(state, patternQuestion) ? [patternQuestion, structureQuestion] : [patternQuestion];
    }
    if (state.goal === 'adjust') {
      const qs = [outcomeQuestion];
      if (validAnswer(state, outcomeQuestion)) qs.push(structureQuestion);
      if (validAnswer(state, outcomeQuestion) && validAnswer(state, structureQuestion)) qs.push(intentQuestion);
      return qs;
    }
    if (state.goal === 'survival') return [survivalQuestion];
    if (state.goal === 'diagnostic') {
      return state.task === 'compare' ? [diagnosticQuestion, pairingQuestion] : [diagnosticQuestion];
    }
    return [];
  }

  const generalSample = '「30例以上」などの固定基準では選びません。効果の大きさ、ばらつき、必要な検出力・信頼区間の幅から症例数を考えます。';
  const rankSample = '小標本では正確法・置換法の可否や、同順位の扱いを確認します。順位法でも、十分な検出力や精度があるとは限りません。';
  const regressionSample = '「1因子10イベント／15例」だけでは判断しません。推定する係数の数、総例数、アウトカムに応じたイベント数、求める精度を検討します。';
  const predictionSample = '候補パラメータ数、総例数、アウトカムの分布・イベント割合、期待する予測性能から設計します。最終的に残った変数数だけで十分性を判断しません。';
  const survivalSample = '「イベント10件以上」という固定基準では判断しません。検出したい効果、群の割合、検出力、追跡期間から必要な情報量を考えます。';

  function result(id, title, english, reason, checks, sample, report, sourceIds, extra) {
    return Object.assign({
      id, title, english, reason,
      checks: checks.map((entry) => ({ label: entry[0], text: entry[1] })),
      sample, report, sources: sourceIds
    }, extra || {});
  }

  function meanResult(design) {
    if (design === 'ind2') return result('welch-t', 'Welchのt検定', 'Welch’s two-sample t-test', '独立した2群の平均値の差を調べます。2群の分散が同じであるとは仮定しません。', [
      ['独立性', '別々の対象から得た値か確認します。反復測定を独立な値として並べないようにします。'],
      ['分布と外れ値', '群ごとの分布図を見ます。Welchでも強い歪みや極端な外れ値は自動的には解決しません。'],
      ['比べたい量', '平均差が研究の問いに合うかを確認します。']
    ], generalSample, '群ごとの人数・平均・標準偏差、平均差と95%信頼区間、p値。', ['ttest', 'residuals'], {
      alternative: { title: '条件によっては', text: '等分散を合理的に仮定できる場合はStudentのt検定。強い歪みがある場合は変換や別のモデルを検討します。' },
      details: [{ label: '正規性の確認', text: '正規性検定のp値だけで選びません。分布の形、外れ値、例数を合わせて考えます。' }]
    });
    if (design === 'indmany') return result('welch-anova', 'Welchの一元配置分散分析', 'Welch’s one-way ANOVA', '独立した3群以上の平均値に違いがあるかを調べます。等分散を仮定しない方法です。', [
      ['独立性', '各対象が独立していることを確認します。'],
      ['群ごとの状態', '分布、外れ値、分散、人数の偏りを確認します。'],
      ['個別の比較', 'どの群の差を知りたいかを決めます。複数の比較には多重性への対応が必要です。']
    ], generalSample, '各群の要約値、全体の比較結果、必要な群間差と信頼区間、多重比較の方法。', ['anova', 'residuals'], {
      alternative: { title: '等分散を仮定できる場合', text: '通常の一元配置分散分析も候補です。背景因子を調整したい場合は回帰モデルを検討します。' }
    });
    if (design === 'pair2') return result('paired-t', '対応のあるt検定', 'Paired t-test', '同じ対象の2時点・2条件について、平均変化量が0と異なるかを調べます。', [
      ['正しい対応', '同じ対象の値同士を組にします。対応が崩れていないか確認します。'],
      ['変化量の分布', '各時点を別々に見るだけでなく、「後−前」などの差の分布と外れ値を確認します。'],
      ['対象間の独立性', '対象同士は独立しているか、施設や家族などのまとまりがないか確認します。']
    ], generalSample, '解析した組数、前後の要約値、平均変化量と95%信頼区間、p値。', ['paired', 'ttest'], {
      alternative: { title: '順位で変化を調べる場合', text: '差の分布の対称性などが妥当ならWilcoxon符号順位検定。変化の方向だけを扱うなら符号検定を検討します。' }
    });
    return result('repeated-anova', '反復測定分散分析', 'Repeated-measures ANOVA', '同じ対象を3時点・3条件以上で測定した連続値の平均を比較します。', [
      ['個人内の相関', '同じ対象から得た測定値に対応があることを解析に反映します。'],
      ['球面性と残差', '各時点間の差の分散に関する仮定と、残差・外れ値を確認します。'],
      ['欠測と比較', '測定がそろっているか、どの時点間の差を調べたいかを確認します。']
    ], generalSample, '時点別の要約、時点の効果、必要な比較の差と信頼区間、球面性補正や欠測の扱い。', ['repeated', 'residuals'], {
      alternative: { title: '測定のそろい方が複雑な場合', text: '線形混合モデルも候補です。球面性が合わない場合は補正を検討します。欠測の理由や仮定も確認します。' }
    });
  }

  function rankResult(design, ordinal) {
    if (design === 'ind2') return result('mann-whitney', 'Mann–WhitneyのU検定', 'Mann–Whitney U test', '独立した2群を順位に基づいて比較します。平均差を直接調べる検定ではありません。', [
      ['独立性', '別々の対象から得た2群か確認します。'],
      ['順位と解釈', '値の大小を順位で扱えますか。中央値の差と解釈するには分布形などの条件が必要です。'],
      ['同順位と計算法', '同じ値が多いか、小標本かを確認し、正確法・近似法などを選びます。']
    ], rankSample, '各群の人数と分布の要約、順位比較の結果、可能なら大小関係の効果指標と信頼区間。', ['rank-meaning', 'wilcoxon'], {
      details: [{ label: '中央値を比べる検定？', text: '一般には、中央値差の検定と同じではありません。同じ分布形で位置だけが異なる場合などに、位置の差として解釈できます。' }]
    });
    if (design === 'indmany') return result('kruskal-wallis', 'Kruskal–Wallis検定', 'Kruskal–Wallis test', '独立した3群以上を順位に基づいて比較します。', [
      ['独立性', '対象が別々で、各観測が独立しているか確認します。'],
      ['問いと分布', '順位比較が目的に合うか確認します。中央値差と解釈するには追加の条件が必要です。'],
      ['近似と個別比較', '少数例や同順位に注意します。どの群が違うかを調べる際は多重性に対応します。']
    ], rankSample, '各群の分布と人数、全体の順位比較の結果、必要な個別比較と補正方法。', ['kruskal', 'rank-meaning'], {
      alternative: { title: '平均差が研究目的の場合', text: 'Welchの分散分析や、目的に合う回帰モデルを検討します。順位法への変更で問いまで変わらないか確認します。' }
    });
    if (design === 'pair2' && ordinal) return result('sign-test', '符号検定', 'Paired sign test', '同じ対象で値が上がったか、下がったかを比べます。段階の間隔を数値的に解釈しなくても使える方法です。', [
      ['正しい対応', '同じ対象の2時点・2条件を組にします。'],
      ['変化の方向', '上がる・下がるの意味が共通しているか確認します。'],
      ['変化なしの扱い', '同じ値の組をどう扱うか確認します。通常は変化なしを除いた組で推論します。']
    ], '変化した組数が情報量になります。小標本ではp値が離散的になり、十分な検出力を得られないことがあります。', '上昇・低下・変化なしの組数、検定の方法とp値、変化の分布。', ['sign', 'wilcoxon'], {
      alternative: { title: '差の大きさも意味を持つ場合', text: '尺度の差を数量として扱え、差の分布の対称性が妥当なら、Wilcoxon符号順位検定も候補です。' }
    });
    if (design === 'pair2') return result('wilcoxon-signed', 'Wilcoxon符号順位検定', 'Wilcoxon signed-rank test', '同じ対象の差を、符号と差の大きさの順位に基づいて調べます。', [
      ['対応と尺度', '対象の対応が正しく、差の大きさを意味のある量として扱えるか確認します。'],
      ['差の対称性', '位置の変化を解釈するために、差の分布の対称性を確認します。'],
      ['差0・同順位', '変化なしや同じ大きさの差に注意し、正確法・近似法などの扱いを確認します。']
    ], rankSample, '組数、変化量の分布、検定結果、差0や同順位・計算法の扱い。', ['wilcoxon'], {
      alternative: { title: '方向だけを調べる場合', text: '符号検定が候補です。平均変化量が目的なら、対応のあるt検定や平均を扱うモデルを検討します。' }
    });
    return result('friedman', 'Friedman検定', 'Friedman test', '同じ対象を3時点・3条件以上で測定した値を、対象内の順位で比較します。', [
      ['同じ対象', '各条件を同じ対象で測定しているか確認します。'],
      ['測定のそろい方', '各対象で条件がそろっているか、欠測による除外が生じるか確認します。'],
      ['計算法と比較', '小標本・同順位、どの条件間を比較するか、多重性への対応を確認します。']
    ], rankSample, '対象数、条件別の分布、全体の順位比較、必要な個別比較と補正方法。', ['friedman'], {
      alternative: { title: '欠測・調整因子を含む場合', text: 'データの尺度に合う反復測定モデルを検討します。Friedman検定だけでは複雑な調整はできません。' }
    });
  }

  function undecidedMeanRank(design) {
    const mean = meanResult(design);
    const rank = rankResult(design, false);
    return result('mean-or-rank-' + design, '比較する対象で候補が変わります', 'Mean or rank-based comparison', '平均の違いを知りたいのか、順位による大小関係を知りたいのかで方法が変わります。', [
      ['知りたい量', '平均差、典型的な値、大小関係のうち、研究で答えたい問いを決めます。'],
      ['データを見る', '分布図や外れ値を確認します。対応があれば変化量も見ます。'],
      ['選択の根拠', '正規性検定のp値や症例数だけで機械的に切り替えないようにします。']
    ], generalSample, '選んだ方法が何を比較するかを説明し、その量の推定値・信頼区間を示します。', Array.from(new Set(mean.sources.concat(rank.sources))), {
      candidates: [
        { title: mean.title, text: '平均値・平均変化量が研究の問いなら候補です。' },
        { title: rank.title, text: '順位に基づく比較が研究の問いなら候補です。平均差と同じ検定ではありません。' }
      ]
    });
  }

  function clusteredResult(kind, context) {
    const titles = {
      continuous: ['線形混合モデルなど', 'Linear mixed-effects model'],
      binary: ['二値データの反復測定モデル', 'Generalized mixed model / GEE'],
      ordinal: ['順序尺度の反復測定モデル', 'Ordinal model for repeated observations'],
      nominal: ['多カテゴリの反復測定モデル', 'Multinomial model for repeated observations'],
      other: ['集団内相関を考慮したモデル', 'Model for clustered observations']
    };
    const selected = titles[kind] || titles.other;
    const mixed = context === 'mixed';
    return result('clustered-' + kind + '-' + context, selected[0], selected[1], mixed ? '群の違いと、同じ対象の時点間の変化を、一緒にモデル化します。' : '同じ対象や同じ集団の観測には相関があります。その構造を含めて解析します。', [
      ['データの階層', '対象、時点、施設・家族などのまとまりを明確にします。'],
      ['アウトカムと問い', '値の尺度に合うモデルを選び、どの群間差・変化を比較するか決めます。'],
      ['欠測と情報量', '欠測の理由、対象・集団の数、相関構造の仮定を確認します。']
    ], '測定回数を増やしても、独立した対象が増えたことにはなりません。対象数、集団数、反復回数と相関を考慮して設計します。', 'モデルの種類、対象数と測定数、調整した差・比と信頼区間、相関・欠測の扱い。', kind === 'continuous' ? ['repeated', 'residuals'] : ['gee'], {
      alternative: { title: 'モデルの選び方', text: kind === 'continuous' ? '反復測定ANOVA、線形混合モデル、GEEなどから、設計と推定したい効果に合うものを選びます。' : '二値・順序・名義などの尺度に合う混合モデルやGEEを検討します。' },
      details: [{ label: mixed ? '群ごとの前後検定との違い' : '単純な相関・検定との違い', text: mixed ? '各群で前後の有意差を別々に調べても、群間の変化の差を評価したことにはなりません。目的の群間差を直接比較します。' : '繰り返し測定を独立した観測として扱うと、不確実性を適切に評価できないことがあります。' }]
    });
  }

  function categoricalResult(state) {
    const { data, design } = state;
    if (design === 'mixed') return clusteredResult(data, 'mixed');
    if (design === 'ind2' || design === 'indmany') {
      const twoByTwo = data === 'binary' && design === 'ind2';
      return result(twoByTwo ? 'chi-fisher' : 'chi-square-table', twoByTwo ? 'カイ二乗検定／Fisherの正確検定' : 'カイ二乗検定', twoByTwo ? 'Chi-squared test / Fisher’s exact test' : 'Chi-squared test of a contingency table', '群とカテゴリーの分割表を作り、割合・分布の違いを調べます。', [
        ['独立性と定義', '対象が独立し、各群でカテゴリーの定義が共通しているか確認します。'],
        ['期待度数', '総人数だけでなく、帰無仮説の下で各セルに期待される人数を確認します。'],
        ['差の大きさ', '検定のp値に加え、割合の差や適切な比、信頼区間を示します。']
      ], '「総数20以上」で振り分けません。期待度数、表の大きさ、検出したい割合差と精度を確認します。', '各セルの人数・割合、適切な差や比と95%信頼区間、検定と計算法。', ['chi-square', 'fisher'], {
        alternative: { title: '期待度数が小さい場合', text: twoByTwo ? '疎な2×2表ではFisherの正確検定などを検討します。期待度数5は目安であり、総人数とは異なります。' : '表に合う正確法やモンテカルロ法を検討します。群間の個別比較を増やす場合は多重性にも対応します。' }
      });
    }
    if (data === 'binary' && design === 'pair2') return result('mcnemar', 'McNemar検定', 'McNemar’s test', '同じ対象の二値結果について、前後・条件間の割合の変化を調べます。', [
      ['対応', '同じ対象の結果を2×2表にまとめます。'],
      ['二値の定義', '前後・条件間で「あり・なし」などの定義が同じか確認します。'],
      ['不一致ペア', 'ありからなし、なしからありに変わった組の数を確認します。']
    ], '総人数より、不一致ペア数が検定の情報量に関係します。不一致が少ない場合は正確法を検討します。', '対応する2×2表、不一致ペア数、変化の大きさ、正確法・近似法の別とp値。', ['mcnemar'], {
      alternative: { title: '3条件以上なら', text: '対応のある二値データを3条件以上で比較する場合はCochranのQ検定や反復測定モデルを検討します。' }
    });
    if (data === 'binary' && design === 'pairmany') return result('cochran-q', 'CochranのQ検定', 'Cochran’s Q test', '同じ対象の二値結果を、3時点・3条件以上で比較します。', [
      ['同じ対象', '各条件で同じ対象を測定しているか確認します。'],
      ['二値と欠測', '結果の定義が共通し、条件がそろっているか確認します。'],
      ['近似と個別比較', '少数例での近似、同じ反応が続く対象の多さ、複数比較の扱いを確認します。']
    ], '少数例では通常のカイ二乗近似が十分でないことがあります。実際の反応パターンと必要な検出力から検討します。', '条件別の人数・割合、反応の組合せ、全体の検定と必要な個別比較。', ['cochran'], {
      alternative: { title: '調整・欠測を含む場合', text: '二値データに合う混合モデルやGEEなど、反復測定のモデルを検討します。' }
    });
    if (data === 'nominal' && design === 'pair2') return result('stuart-maxwell', 'Stuart–Maxwell検定', 'Stuart–Maxwell test of marginal homogeneity', '同じ対象の前後で、3カテゴリー以上の割合の分布が変化したかを調べます。', [
      ['同じ対象', '同じ対象の前後を正しく対応づけます。'],
      ['共通のカテゴリー', '前後でカテゴリーの種類と意味が同じか確認します。'],
      ['分割表と問い', '前後の周辺分布の変化が問いに合うか、セルが疎でないか確認します。']
    ], '移動したカテゴリーの組合せが情報量になります。疎な表では通常の近似の妥当性を検討します。', '前後を対応づけた分割表、カテゴリー別の割合の変化、検定方法と結果。', ['stuart'], {
      alternative: { title: 'より複雑な変化を扱う場合', text: '調整因子を含める場合や複数時点がある場合は、多カテゴリの対応を扱うモデルを検討します。' }
    });
    return clusteredResult('nominal', 'repeated');
  }

  function compareResult(state) {
    if (state.design === 'mixed') return clusteredResult(state.data, 'mixed');
    if (state.data === 'binary' || state.data === 'nominal') return categoricalResult(state);
    if (state.data === 'ordinal') return rankResult(state.design, true);
    if (state.aim === 'mean') return meanResult(state.design);
    if (state.aim === 'rank') return rankResult(state.design, false);
    return undecidedMeanRank(state.design);
  }

  function associationResult(state) {
    if (state.structure === 'clustered') return clusteredResult('other', 'association');
    if (state.pattern === 'unsure') return result('correlation-choice', '関係の形から候補を選びます', 'Pearson or Spearman correlation', '散布図で関係を確認し、直線的な関連か、順位による単調な関連かを選びます。', [
      ['2変数の組', '同じ対象から得た2つの値を組にします。「2群」の比較ではありません。'],
      ['散布図', '直線性、単調性、外れ値、曲線的な関係を確認します。'],
      ['調べたいこと', '関連の強さと、2つの測定法の一致性は別の問いです。']
    ], '30組という一律の最低条件はありません。関連の大きさと信頼区間の精度、小標本での計算法を検討します。', '散布図、解析した組数、選んだ相関係数と信頼区間、推論の方法。', ['pearson', 'spearman'], {
      candidates: [
        { title: 'Pearsonの相関係数', text: '連続した2変数の直線的な関連を評価します。' },
        { title: 'Spearmanの順位相関係数', text: '順位による単調な関連を評価します。順序尺度も扱えます。' }
      ]
    });
    const rank = state.pattern === 'rank';
    return result(rank ? 'spearman' : 'pearson', rank ? 'Spearmanの順位相関係数' : 'Pearsonの相関係数', rank ? 'Spearman’s rank correlation' : 'Pearson’s correlation', rank ? '2変数が、順位の上でどれくらい単調に関係するかを評価します。' : '連続した2変数の直線的な関連の強さを評価します。', [
      ['2変数と対象', '同じ対象から得た2つの値を組にし、対象同士は独立しているか確認します。'],
      ['関係の形', rank ? '散布図で単調な関係かを確認します。単調でない曲線関係は十分に表せないことがあります。' : '散布図で直線性と外れ値を確認します。相関が小さくても、別の形の関係があることがあります。'],
      ['推論の方法', rank ? '同順位と小標本に注意し、必要なら置換法などを検討します。' : '通常のp値・信頼区間に必要な分布の仮定などを確認します。']
    ], '「30組以上」で合否を決めません。相関の大きさ、信頼区間の幅、小標本での推論を確認します。', '散布図、組数、相関係数と95%信頼区間、必要に応じてp値と計算法。', rank ? ['spearman'] : ['pearson'], {
      alternative: { title: '目的が別の場合', text: '背景因子を調整したい場合は回帰モデルへ。測定法の一致性を知りたい場合は、一致性の評価方法を別に検討します。' }
    });
  }

  function coxResult(intent, clustered) {
    const prediction = intent === 'prediction';
    return result('cox-' + (clustered ? 'clustered-' : '') + (prediction ? 'prediction' : 'effect'), clustered ? 'クラスタを考慮したCoxモデルなど' : 'Cox比例ハザードモデル', clustered ? 'Cox model with clustering' : 'Cox proportional hazards model', prediction ? '説明変数とイベントまでの時間の関係をモデル化し、指定した時点のリスク予測に使います。' : '背景因子を考慮して、イベント発生のハザード比などを推定します。', [
      ['時間と状態', '追跡の起点、イベント、打ち切りを定義し、時間と状態の両方を準備します。'],
      ['比例ハザード性', '効果が時間で変化しないとみなせるか、残差の図や検定などで確認します。'],
      [clustered ? '集団内の相関' : 'モデルの設計', clustered ? '施設・家族・反復などをモデルや分散推定に反映します。集団数も確認します。' : '説明変数の関係の形、打ち切りの仮定、候補パラメータ数を確認します。']
    ], prediction ? predictionSample : regressionSample, prediction ? '予測する時点、リスク予測、校正・判別能、内部検証、モデルの式と仮定。' : '調整ハザード比と95%信頼区間、調整因子、イベント数、比例ハザード性と打ち切りの扱い。', ['surv-data', 'cox', 'cox-ph', prediction ? 'prediction-size' : 'survival-size'], {
      alternative: { title: '仮定が合わない場合', text: '時間依存効果や層別化など、目的に合うモデルを検討します。競合イベントの扱いも研究の問いに合わせます。' },
      details: [{ label: prediction ? '予測モデルの確認' : '調整と因果解釈', text: prediction ? '開発データでの良好な当てはまりだけでは予測性能を判断しません。校正・判別能と内部検証を確認します。' : '因子を加えるだけで因果効果を推定できるわけではありません。研究デザインと調整する因子の根拠を確認します。' }]
    });
  }

  function adjustResult(state) {
    const prediction = state.intent === 'prediction';
    if (state.outcome === 'time') return coxResult(state.intent, state.structure === 'clustered');
    if (state.structure === 'clustered') {
      const r = clusteredResult(state.outcome, 'adjust-' + state.intent);
      r.sample = prediction ? predictionSample + ' 集団内の相関と集団数も考慮します。' : r.sample;
      r.details = (r.details || []).concat([{ label: prediction ? '予測の評価' : '調整因子', text: prediction ? '予測したい対象を明確にし、校正・判別能と内部検証を計画します。' : 'どの効果を推定するかを決め、調整する因子を研究上の根拠から選びます。' }]);
      r.sources = Array.from(new Set(r.sources.concat(prediction ? ['prediction-size'] : [])));
      return r;
    }
    if (state.outcome === 'other') return result('regression-other-' + state.intent, 'アウトカムに合う回帰モデル', 'Regression matched to the outcome', '順序尺度、3カテゴリー以上、回数などでは、値の性質に合うモデルを選びます。', [
      ['値の意味', '順序だけがあるのか、順序のない分類か、回数かを整理します。'],
      ['モデルの前提', 'カテゴリーや回数の分布、関係の形、観測の独立性を確認します。'],
      ['研究目的', prediction ? '何を予測するかと、予測の評価・検証の方法を決めます。' : '何の差・比を推定するかと、調整する因子の根拠を決めます。']
    ], prediction ? predictionSample : regressionSample, 'アウトカムに合う係数・差・比、信頼区間、モデルの仮定と調整因子。', ['ordinal-model', 'prediction-size'], {
      candidates: [
        { title: '順序のあるカテゴリー', text: '順序ロジスティック回帰など。比例オッズなどの仮定を確認します。' },
        { title: '順序のない分類・回数', text: '多項ロジスティック回帰、Poisson・負の二項回帰など、値の性質に合う方法を選びます。' }
      ]
    });
    const binary = state.outcome === 'binary';
    return result((binary ? 'logistic-' : 'linear-') + state.intent, binary ? '二項ロジスティック回帰' : '線形回帰・重回帰', binary ? 'Binary logistic regression' : 'Linear regression', prediction ? (binary ? '複数の因子から、二値アウトカムが起こる確率を予測します。' : '複数の因子から、連続したアウトカムの値を予測します。') : (binary ? '背景因子を考慮して、二値アウトカムとの関連をオッズ比などで推定します。' : '背景因子を考慮して、連続したアウトカムの差や関連を推定します。'), [
      ['因子の選び方', prediction ? '候補因子を定め、予測する対象集団と利用する時点を明確にします。' : '研究の問いに基づき、調整因子を選びます。単変量のp値だけで選ばないようにします。'],
      ['モデルの仮定', binary ? '連続した因子と対数オッズの関係、疎なカテゴリー、完全分離などを確認します。' : '関係の形、残差、分散、外れ値を確認します。全説明変数の正規性が必要なわけではありません。'],
      [prediction ? '予測の検証' : '独立性と情報量', prediction ? '当てはまりだけでなく、内部検証を行い、予測の誤差や校正を評価します。' : '観測の独立性、推定する係数の数、必要な精度を確認します。']
    ], prediction ? predictionSample : regressionSample, prediction ? (binary ? 'モデルの式、予測確率、校正・判別能、内部検証の結果。' : 'モデルの式、予測誤差・校正、内部検証の結果。') : (binary ? '調整オッズ比と95%信頼区間、調整因子、イベント数とモデルの確認事項。' : '回帰係数・調整した差と95%信頼区間、調整因子、残差の確認事項。'), binary ? ['events', 'prediction-size'] : ['residuals', 'prediction-size'], {
      details: [{ label: prediction ? '変数数の数え方' : '調整と因果解釈', text: prediction ? '4カテゴリーの因子は通常3つの係数を使います。非線形効果・交互作用も含めた候補パラメータ数で考えます。' : '調整後の関連がそのまま因果効果になるとは限りません。研究デザインと調整する因子の役割を確認します。' }]
    });
  }

  function survivalResult(state) {
    if (state.task === 'adjust') return coxResult('effect', false);
    if (state.task === 'describe') return result('kaplan-meier', 'Kaplan–Meier法', 'Kaplan–Meier survival estimate', 'イベントが起こらずに経過する確率を、時間に沿って推定・表示します。曲線そのものは検定ではありません。', [
      ['時間の定義', '追跡の起点とイベントの定義をそろえます。'],
      ['打ち切り', 'イベント発生か打ち切りかを記録し、打ち切りの理由・妥当性を確認します。'],
      ['曲線の精度', '各時点のリスク集合人数と信頼区間を確認します。']
    ], '追跡が長い部分では残っている対象が少なくなります。総人数だけでなく、時点ごとの人数、イベント数、信頼区間を見ます。', '曲線、95%信頼区間、リスク集合人数、イベント・打ち切り数、追跡期間。', ['surv-data', 'km'], {
      alternative: { title: '別の目的がある場合', text: '群間比較はLog-rank検定、背景因子の調整はCoxモデルなど。競合イベントがある場合は累積発生関数などを検討します。' }
    });
    return result('log-rank', 'Log-rank検定', 'Log-rank test', '独立した群の生存曲線を比較します。Kaplan–Meier曲線と合わせて経過を確認します。', [
      ['群と起点', '比較する群、追跡の起点、イベントの定義をそろえます。'],
      ['打ち切り', '群ごとの追跡状況や打ち切りの理由・仮定を確認します。'],
      ['時間による違い', '曲線の交差や効果の時間変化に注意します。検出力や結果の解釈に影響します。']
    ], survivalSample, 'Kaplan–Meier曲線、リスク集合人数、イベント数、検定結果、目的に合う効果の指標。', ['surv-data', 'logrank', 'survival-size'], {
      alternative: { title: '調整や時間変化を扱う場合', text: '共変量を調整する場合はCoxモデルなど。効果が時間で変わる場合は、その問いに合う比較指標・モデルを検討します。' }
    });
  }

  function diagnosticResult(state) {
    if (state.task === 'estimate') return result('roc-auc', 'ROC曲線・AUC', 'ROC curve and area under the curve', '検査値やスコアが、病気あり・なしをどれくらい見分けるかを評価します。', [
      ['基準となる状態', '病気あり・なしを判定する基準と対象集団を明確にします。'],
      ['検査値の向き', '高いほど病気らしいのか、低いほど病気らしいのかを確認します。'],
      ['閾値と精度', 'AUCだけでなく、必要な閾値での感度・特異度と信頼区間を確認します。']
    ], '病気あり・なし両方の人数が精度に関係します。AUCや感度・特異度の信頼区間の幅から検討します。', 'ROC曲線、AUCと95%信頼区間、評価した閾値と感度・特異度、各群の人数。', ['roc'], {
      details: [{ label: '判別能と実際の利用', text: 'AUCだけで最適な閾値は決まりません。偽陽性・偽陰性の影響も考慮します。予測確率の校正とは別の評価です。' }]
    });
    const paired = state.pairing === 'paired';
    return result('roc-compare-' + state.pairing, paired ? '対応のあるAUC比較' : '独立したAUCの比較', paired ? 'Paired ROC / AUC comparison' : 'Independent ROC / AUC comparison', paired ? '同じ対象で得た2つの検査のAUCを、結果同士の相関を考慮して比較します。' : '独立した対象で得た2つのAUCを比較します。対象集団の違いにも注意が必要です。', [
      ['対応の指定', paired ? '両検査が同じ対象に行われ、対象の順序が正しく対応しているか確認します。' : '対象が独立しているか、病気の定義と比較する集団が同等か確認します。'],
      ['比較する量', '全AUC、部分AUC、特定の感度・特異度など、比較したい量を決めます。'],
      ['計算法', '検査値の方向をそろえ、比較対象に合うDeLong法・ブートストラップなどを選びます。']
    ], 'AUCの差、病気あり・なしの人数、対応の有無、必要な精度・検出力から設計します。', '両検査のAUC、AUC差と95%信頼区間、比較法、対応の有無、対象数。', ['roc', 'roc-test'], {
      alternative: { title: '特定の使用場面を比べる場合', text: 'AUC差だけでなく、必要な特異度での感度など、実際に利用する条件での性能も評価します。' }
    });
  }

  function resolve(input) {
    const state = input && typeof input === 'object' ? input : {};
    if (!goals.some((goal) => goal.id === state.goal)) return null;
    const qs = questionsFor(state);
    if (qs.length === 0 || !qs.every((q) => validAnswer(state, q))) return null;
    switch (state.goal) {
      case 'compare': return compareResult(state);
      case 'association': return associationResult(state);
      case 'adjust': return adjustResult(state);
      case 'survival': return survivalResult(state);
      case 'diagnostic': return diagnosticResult(state);
      default: return null;
    }
  }

  const quickRows = [
    { method: 'Welchのt検定', purpose: '平均の差', setting: '連続値・独立2群', check: '群ごとの分布・外れ値', state: { goal: 'compare', data: 'continuous', design: 'ind2', aim: 'mean' } },
    { method: 'Welchの分散分析', purpose: '平均の差', setting: '連続値・独立3群以上', check: '分布・比較する群・多重性', state: { goal: 'compare', data: 'continuous', design: 'indmany', aim: 'mean' } },
    { method: '対応のあるt検定', purpose: '平均変化量', setting: '連続値・対応2時点', check: '変化量の分布・外れ値', state: { goal: 'compare', data: 'continuous', design: 'pair2', aim: 'mean' } },
    { method: '反復測定分散分析', purpose: '平均の変化', setting: '連続値・対応3時点以上', check: '球面性・欠測・個人内相関', state: { goal: 'compare', data: 'continuous', design: 'pairmany', aim: 'mean' } },
    { method: 'Mann–WhitneyのU検定', purpose: '順位で比較', setting: '独立2群', check: '解釈・同順位・計算法', state: { goal: 'compare', data: 'continuous', design: 'ind2', aim: 'rank' } },
    { method: 'Kruskal–Wallis検定', purpose: '順位で比較', setting: '独立3群以上', check: '小標本での近似・多重性', state: { goal: 'compare', data: 'ordinal', design: 'indmany' } },
    { method: 'Wilcoxon符号順位検定', purpose: '差の順位で比較', setting: '対応2時点・差を扱える尺度', check: '差の対称性・差0・同順位', state: { goal: 'compare', data: 'continuous', design: 'pair2', aim: 'rank' } },
    { method: 'Friedman検定', purpose: '対象内の順位で比較', setting: '対応3時点以上', check: '測定のそろい方・欠測', state: { goal: 'compare', data: 'ordinal', design: 'pairmany' } },
    { method: 'カイ二乗／Fisher検定', purpose: '割合の差', setting: '二値・独立2群', check: '総人数ではなく期待度数', state: { goal: 'compare', data: 'binary', design: 'ind2' } },
    { method: 'McNemar検定', purpose: '割合の変化', setting: '二値・対応2時点', check: '不一致ペア数・正確法', state: { goal: 'compare', data: 'binary', design: 'pair2' } },
    { method: 'Pearsonの相関係数', purpose: '直線的な関連', setting: '対象ごとに2変数の組', check: '散布図・外れ値・推論の仮定', state: { goal: 'association', pattern: 'linear', structure: 'independent' } },
    { method: 'Spearmanの順位相関', purpose: '単調な関連', setting: '対象ごとに2変数の組', check: '単調性・同順位・小標本', state: { goal: 'association', pattern: 'rank', structure: 'independent' } },
    { method: '線形回帰・重回帰', purpose: '背景因子を調整', setting: '連続アウトカム', check: '関係の形・残差・調整因子', state: { goal: 'adjust', outcome: 'continuous', structure: 'independent', intent: 'effect' } },
    { method: '二項ロジスティック回帰', purpose: '背景因子を調整', setting: '二値アウトカム', check: '分離・係数の数・イベント数', state: { goal: 'adjust', outcome: 'binary', structure: 'independent', intent: 'effect' } },
    { method: 'Kaplan–Meier法', purpose: '経過を示す', setting: 'イベントまでの時間', check: '打ち切り・リスク集合人数', state: { goal: 'survival', task: 'describe' } },
    { method: 'Log-rank検定', purpose: '生存曲線を比較', setting: '時間・独立した群', check: '打ち切り・曲線の交差', state: { goal: 'survival', task: 'compare' } },
    { method: 'Cox比例ハザードモデル', purpose: '時間と背景因子', setting: 'イベントまでの時間', check: '比例ハザード性・係数の数', state: { goal: 'survival', task: 'adjust' } },
    { method: 'ROC曲線・AUC', purpose: '検査の判別能', setting: '二値の状態と検査値', check: '基準状態・閾値・信頼区間', state: { goal: 'diagnostic', task: 'estimate' } }
  ];

  const examples = [
    { label: '治療前後のLDL-C', state: { goal: 'compare', data: 'continuous', design: 'pair2', aim: 'mean' } },
    { label: '2群の発症割合', state: { goal: 'compare', data: 'binary', design: 'ind2' } },
    { label: '年齢を考慮したLDL-C', state: { goal: 'adjust', outcome: 'continuous', structure: 'independent', intent: 'effect' } },
    { label: '再発までの時間', state: { goal: 'survival', task: 'compare' } },
    { label: '検査値の判別能', state: { goal: 'diagnostic', task: 'estimate' } }
  ];

  window.StatGuide = { goals, questionsFor, resolve, sources, quickRows, examples };
}());

interface HowToPlayProps {
  onBack: () => void;
  language: 'ja' | 'en';
}

export function HowToPlay({ onBack, language }: HowToPlayProps) {
  const isJa = language === 'ja';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isJa ? '遊び方' : 'How to Play'}
        </h1>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {isJa ? (
            <>
              <section>
                <h2 className="text-lg font-bold text-white mb-2">基本ルール</h2>
                <p>
                  黒と白のプレイヤーが交互に駒を動かします。
                  自分のターンでは、自分の色の駒を選択して移動させます。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">駒の動かし方</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>移動させたい駒をタップして選択</li>
                  <li>複数の駒を選択することも可能（直線上に並んでいる必要あり）</li>
                  <li>ハイライトされたマスが移動可能な場所</li>
                  <li>移動先をタップして駒を動かす</li>
                </ol>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">押し出しのルール</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>相手の駒を押すことができます</li>
                  <li>押すには、自分の駒の数が相手より多い必要があります</li>
                  <li>例：自分3個 vs 相手2個 = 押せる</li>
                  <li>盤の端に追い詰めて押し出すと、相手の駒を排除できます</li>
                </ul>
              </section>

              <section className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-white mb-2">勝利条件</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-blue-400">押し出しモード</h3>
                    <p>相手の駒を盤外に押し出して、残り1個以下にすれば勝利！</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-400">整列モード</h3>
                    <p>自分の駒を一直線に5個並べれば勝利！</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">ヒント</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>複数の駒をまとめて動かすと、押す力が強くなります</li>
                  <li>盤の中央を制圧すると有利です</li>
                  <li>相手を端に追い詰める動きを狙いましょう</li>
                  <li>自分の駒が孤立しないように注意</li>
                </ul>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-white mb-2">Basic Rules</h2>
                <p>
                  Black and white players take turns moving pieces.
                  On your turn, select and move pieces of your color.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">How to Move</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Tap a piece to select it</li>
                  <li>You can select multiple pieces (must be in a straight line)</li>
                  <li>Highlighted cells show valid move destinations</li>
                  <li>Tap a destination to move your pieces</li>
                </ol>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">Pushing Rules</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>You can push opponent's pieces</li>
                  <li>To push, you need more pieces than the opponent</li>
                  <li>Example: Your 3 pieces vs Opponent's 2 = Can push</li>
                  <li>Push pieces off the edge to eliminate them</li>
                </ul>
              </section>

              <section className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-white mb-2">Victory Conditions</h2>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-blue-400">Push Out Mode</h3>
                    <p>Push opponent's pieces off the board until they have 1 or fewer pieces!</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-400">Line Up Mode</h3>
                    <p>Align 5 of your pieces in a straight line to win!</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">Tips</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Moving multiple pieces together increases pushing power</li>
                  <li>Controlling the center gives you an advantage</li>
                  <li>Try to corner your opponent at the edges</li>
                  <li>Avoid letting your pieces become isolated</li>
                </ul>
              </section>
            </>
          )}
        </div>

        <button
          onClick={onBack}
          className="mt-8 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          {isJa ? '戻る' : 'Back'}
        </button>
      </div>
    </div>
  );
}

interface AboutProps {
  onBack: () => void;
  language: 'ja' | 'en';
}

export function About({ onBack, language }: AboutProps) {
  const isJa = language === 'ja';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isJa ? 'Wrestle Chessについて' : 'About Wrestle Chess'}
        </h1>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {isJa ? (
            <>
              <section>
                <h2 className="text-lg font-bold text-white mb-2">ゲーム概要</h2>
                <p>
                  Wrestle Chess（レッスルチェス）は、六角形のボード上で駒を動かし、
                  相手の駒を盤外に押し出す戦略ゲームです。
                  シンプルなルールながら奥深い戦略性があり、
                  誰でも手軽に楽しめます。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">特徴</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-bold text-white">六角形ボード</span> -
                    従来のチェスとは異なる6方向への移動が可能
                  </li>
                  <li>
                    <span className="font-bold text-white">押し出しルール</span> -
                    相手の駒を押して盤外に落とすことで勝利
                  </li>
                  <li>
                    <span className="font-bold text-white">複数選択</span> -
                    複数の駒を同時に選択して連携プレイが可能
                  </li>
                  <li>
                    <span className="font-bold text-white">2つのゲームモード</span> -
                    「押し出し」と「整列」の2種類のルール
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">プレイモード</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-bold text-white">ローカル対戦</span> -
                    1台の端末で2人対戦
                  </li>
                  <li>
                    <span className="font-bold text-white">CPU対戦</span> -
                    4段階の難易度から選べるAIと対戦
                  </li>
                  <li>
                    <span className="font-bold text-white">オンライン対戦</span> -
                    友達とリアルタイムで対戦
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">運営情報</h2>
                <p>
                  本サービスは個人が運営する無料のウェブゲームです。
                  ご意見・ご要望は「お問い合わせ」ページよりお寄せください。
                </p>
              </section>

              <section>
                <p className="text-gray-500">バージョン: 1.0.0</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-white mb-2">Game Overview</h2>
                <p>
                  Wrestle Chess is a strategic game played on a hexagonal board
                  where you move pieces to push your opponent's pieces off the board.
                  With simple rules yet deep strategy, it's easy for anyone to enjoy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">Features</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-bold text-white">Hexagonal Board</span> -
                    Move in 6 directions unlike traditional chess
                  </li>
                  <li>
                    <span className="font-bold text-white">Push-out Rules</span> -
                    Win by pushing opponent's pieces off the board
                  </li>
                  <li>
                    <span className="font-bold text-white">Multi-select</span> -
                    Select multiple pieces for coordinated moves
                  </li>
                  <li>
                    <span className="font-bold text-white">Two Game Modes</span> -
                    "Push Out" and "Line Up" rule variations
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">Play Modes</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <span className="font-bold text-white">Local Play</span> -
                    2-player game on one device
                  </li>
                  <li>
                    <span className="font-bold text-white">vs CPU</span> -
                    Play against AI with 4 difficulty levels
                  </li>
                  <li>
                    <span className="font-bold text-white">Online Play</span> -
                    Real-time matches with friends
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">About Us</h2>
                <p>
                  This is a free web game operated by an individual.
                  For feedback or suggestions, please visit the Contact page.
                </p>
              </section>

              <section>
                <p className="text-gray-500">Version: 1.0.0</p>
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

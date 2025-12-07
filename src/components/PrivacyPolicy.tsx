interface PrivacyPolicyProps {
  onBack: () => void;
  language: 'ja' | 'en';
}

export function PrivacyPolicy({ onBack, language }: PrivacyPolicyProps) {
  const isJa = language === 'ja';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isJa ? 'プライバシーポリシー' : 'Privacy Policy'}
        </h1>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {isJa ? (
            <>
              <section>
                <h2 className="text-lg font-bold text-white mb-2">1. はじめに</h2>
                <p>
                  Wrestle Chess（以下「本サービス」）は、ユーザーのプライバシーを尊重し、
                  個人情報の保護に努めています。本プライバシーポリシーでは、
                  本サービスにおける情報の取り扱いについて説明します。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">2. 収集する情報</h2>
                <p>本サービスでは、以下の情報を収集する場合があります：</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>オンライン対戦時の一時的なセッション情報</li>
                  <li>Google AdSenseによる広告配信のためのCookie情報</li>
                  <li>アクセス解析のための匿名化された利用統計</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">3. 広告について</h2>
                <p>
                  本サービスでは、第三者配信の広告サービス（Google AdSense）を利用しています。
                  広告配信事業者は、ユーザーの興味に応じた広告を表示するために
                  Cookie を使用することがあります。
                </p>
                <p className="mt-2">
                  Google AdSenseの詳細については、
                  <a
                    href="https://policies.google.com/technologies/ads?hl=ja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Googleの広告に関するポリシー
                  </a>
                  をご確認ください。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">4. Cookieの使用</h2>
                <p>
                  本サービスでは、サービスの提供および広告配信のためにCookieを使用しています。
                  ブラウザの設定によりCookieを無効にすることができますが、
                  一部の機能が利用できなくなる場合があります。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">5. 第三者への提供</h2>
                <p>
                  本サービスは、法令に基づく場合を除き、
                  ユーザーの個人情報を第三者に提供することはありません。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">6. お問い合わせ</h2>
                <p>
                  本プライバシーポリシーに関するお問い合わせは、
                  本サービスの運営者までご連絡ください。
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">7. 改定</h2>
                <p>
                  本プライバシーポリシーは、必要に応じて改定されることがあります。
                  改定後のポリシーは、本ページに掲載された時点で効力を生じます。
                </p>
              </section>

              <p className="text-gray-500 mt-8">最終更新日: 2024年12月</p>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-lg font-bold text-white mb-2">1. Introduction</h2>
                <p>
                  Wrestle Chess ("the Service") respects user privacy and is committed to
                  protecting personal information. This Privacy Policy explains how we handle
                  information in the Service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">2. Information We Collect</h2>
                <p>The Service may collect the following information:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Temporary session information during online matches</li>
                  <li>Cookie information for Google AdSense advertising</li>
                  <li>Anonymized usage statistics for analytics</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">3. Advertising</h2>
                <p>
                  The Service uses third-party advertising services (Google AdSense).
                  Advertising partners may use cookies to display ads based on user interests.
                </p>
                <p className="mt-2">
                  For more information about Google AdSense, please see{' '}
                  <a
                    href="https://policies.google.com/technologies/ads"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    Google's Advertising Policies
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">4. Use of Cookies</h2>
                <p>
                  The Service uses cookies for service provision and advertising.
                  You can disable cookies through your browser settings, but some features
                  may not be available.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">5. Third-Party Disclosure</h2>
                <p>
                  The Service will not disclose user personal information to third parties
                  except as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">6. Contact</h2>
                <p>
                  For inquiries regarding this Privacy Policy, please contact the
                  Service operator.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">7. Updates</h2>
                <p>
                  This Privacy Policy may be updated as necessary. Updated policies
                  take effect when posted on this page.
                </p>
              </section>

              <p className="text-gray-500 mt-8">Last updated: December 2024</p>
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

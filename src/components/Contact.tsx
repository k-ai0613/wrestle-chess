interface ContactProps {
  onBack: () => void;
  language: 'ja' | 'en';
}

export function Contact({ onBack, language }: ContactProps) {
  const isJa = language === 'ja';

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">
          {isJa ? 'お問い合わせ' : 'Contact'}
        </h1>

        <div className="space-y-6 text-gray-300 text-sm leading-relaxed">
          {isJa ? (
            <>
              <section>
                <p>
                  Wrestle Chessに関するお問い合わせ、ご意見、ご要望は
                  以下のメールアドレスまでお気軽にご連絡ください。
                </p>
              </section>

              <section className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-white mb-2">連絡先</h2>
                <p>
                  メール：{' '}
                  <a
                    href="mailto:futaai2021com@gmail.com"
                    className="text-blue-400 underline"
                  >
                    futaai2021com@gmail.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">お問い合わせ内容について</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>バグの報告</li>
                  <li>機能のリクエスト</li>
                  <li>その他ご質問</li>
                </ul>
              </section>

              <section>
                <p className="text-gray-500">
                  ※ 返信には数日かかる場合があります。あらかじめご了承ください。
                </p>
              </section>
            </>
          ) : (
            <>
              <section>
                <p>
                  For inquiries, feedback, or suggestions about Wrestle Chess,
                  please feel free to contact us at the email address below.
                </p>
              </section>

              <section className="bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-bold text-white mb-2">Contact Information</h2>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:futaai2021com@gmail.com"
                    className="text-blue-400 underline"
                  >
                    futaai2021com@gmail.com
                  </a>
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-2">Types of Inquiries</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>Bug reports</li>
                  <li>Feature requests</li>
                  <li>General questions</li>
                </ul>
              </section>

              <section>
                <p className="text-gray-500">
                  * Please note that responses may take a few days.
                </p>
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

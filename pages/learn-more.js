
import Head from 'next/head';

export default function LearnMore() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-10">
      <Head>
        <title>Learn More</title>
      </Head>
      <h1 className="text-3xl font-bold mb-6">Learn More About Journal App</h1>
      <p className="text-gray-700 max-w-3xl text-center mb-6">
        Our app allows you to record your daily thoughts, track your moods, and reflect on your life.
        Over time, the app analyzes your journal entries and provides insights about your emotional
        journey. By writing regularly, you can gain a deeper understanding of yourself and your feelings.
      </p>
      <p className="text-gray-700 max-w-3xl text-center">
        With features like mood tracking, secure storage, and customizable options, Journal App makes
        journaling easy and meaningful.
      </p>
    </div>
  );
}

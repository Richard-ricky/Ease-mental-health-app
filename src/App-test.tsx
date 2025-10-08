import { useState } from "react";

export default function App() {
  const [test, setTest] = useState("Hello World");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">
          Ease App Test
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
          {test}
        </p>
        <button 
          onClick={() => setTest("App is working!")}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Test Button
        </button>
      </div>
    </div>
  );
}
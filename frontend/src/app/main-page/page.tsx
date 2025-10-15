

export const metadata = {
  title: 'Main Page', // Oldal címe
};

export default function MainPage() {
  return ( //Oldal HTML kódja
    <main className="min-h-dvh flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-semibold mb-4">Main Page</h1>
      <p className="text-gray-600 mb-6 text-center">
        Welcome! This is the main page placeholder.
      </p>
      <div className="border rounded p-4 text-sm text-gray-700 bg-gray-50">
        <p>Here you can later show personalized recipe recommendations, ingredients, or dashboard widgets.</p>
      </div>
    </main>
  );
}
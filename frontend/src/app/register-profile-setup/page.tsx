export const metadata = {
    title: 'ProfileData', // Oldal címe
};

export default function ProfileDataPage() {
    return ( // HTML tartalom
        <main className="max-w-2xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Setting up user prefrences</h1>
            <p className="opacity-80">
            </p>
            {/* TODO: fetch and display user profile data using the stored token or cookie */}
            <div className="rounded border p-4">
                <p className="text-sm">This is a placeholder for your profile details.</p>
            </div>
        </main>
    );
}
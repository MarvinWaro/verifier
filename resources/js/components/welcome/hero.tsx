// C:\Users\MARVIN\projects\verifier\resources\js\components\welcome\hero.tsx

export default function WelcomeHero() {
    return (
        <div className="mb-8 pt-4 text-center lg:text-left">
            <div className="mb-4 flex justify-center lg:justify-start">
                <div className="rounded-full bg-white/50 p-2 shadow-lg dark:bg-gray-800/50">
                    <img
                        src="/assets/img/ched-logo.png"
                        alt="CHED Logo"
                        className="h-20 w-20 object-contain drop-shadow-md"
                    />
                </div>
            </div>
            <h1 className="mb-1 text-3xl font-semibold text-gray-900 dark:text-white md:text-4xl">
                Commission on Higher Education
            </h1>
            <p className="mt-1 mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                Regional Office XII
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-300 md:text-5xl">
                CHECK with CHED
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
                Verify institutional programs and permits
            </p>
        </div>
    );
}

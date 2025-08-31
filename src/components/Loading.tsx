export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] bg-background">
            <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin border-4 border-terminal-primary border-t-transparent"></div>
                <div className="mt-4 font-mono text-terminal-primary">
                    <pre>
                        {`Loading...
|█████████           | 45%
Analyzing questionable taste...`}
                    </pre>
                </div>
            </div>
        </div>
    );
}
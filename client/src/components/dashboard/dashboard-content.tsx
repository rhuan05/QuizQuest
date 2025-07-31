import { useDashboard } from "@/hooks/use-dashboard";
import { useEffect } from "react";

export default function DashboardContent() {
    const { startDashboard, quizCompleted } = useDashboard();
    
    const handleStartDashboard = async () => {
        const quizCompleted = await startDashboard();
    };

    useEffect(() => {
        const run = async () => {
            handleStartDashboard();
        };

        run();
    }, []);
        
    return (
        <div style={{ minHeight: 'calc(100vh - 65px)' }} className="flex items-center justify-center">
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-center text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                    {quizCompleted?.length ?? 'Carregando...'}
                </h1>
                <h2 className="text-center text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Quizzes</span> concluídos!
                </h2>
            </div>
        </div>
    )
};
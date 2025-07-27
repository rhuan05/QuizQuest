import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Code, Home, BarChart3 } from "lucide-react";
import { useQuiz } from "@/hooks/use-quiz";

export default function Header() {
  const [location, setLocation] = useLocation();
  
  const { startQuiz } = useQuiz();

  const handleStartQuiz = async () => {
    await startQuiz();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setLocation("/")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Code className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Quiz de Programação</h1>
              <p className="text-sm text-gray-500">JavaScript Fundamentals</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className={location === "/" ? "text-primary" : "text-gray-600"}
            >
              <Home className="mr-2 h-4 w-4" />
              Início
            </Button>
            <Button 
              variant="ghost"
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Estatísticas
            </Button>
            {location !== "/quiz" && (
              <Button
                onClick={handleStartQuiz}
                className="bg-primary text-white hover:bg-blue-600 transition-colors duration-200"
              >
                <Code className="mr-2 h-4 w-4" />
                Começar Quiz
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LoadingOverlay from "@/components/layout/loading-overlay";
import { Rocket, Clock, BarChart3, Zap, TrendingUp, Smartphone } from "lucide-react";
import { useStartQuiz } from "@/hooks/useStartQuiz";
import { useQuiz } from "@/hooks/use-quiz";

export default function Home() {
  const { isStarting, isLoading } = useStartQuiz();
  
  const { startQuiz } = useQuiz();

  const handleStartQuiz = async () => {
    await startQuiz();
  };

  return (
    <>
      {(isLoading || isStarting) && <LoadingOverlay />}
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Colorful abstract background with code pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 text-6xl font-mono text-primary transform rotate-12">{"{}"}</div>
          <div className="absolute top-40 right-20 text-4xl font-mono text-green-600 transform -rotate-12">[]</div>
          <div className="absolute bottom-32 left-20 text-5xl font-mono text-orange-600 transform rotate-45">()</div>
          <div className="absolute bottom-20 right-10 text-3xl font-mono text-red-600 transform -rotate-6">;</div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Teste seus conhecimentos em
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600"> JavaScript</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubra suas habilidades com perguntas desafiadoras sobre conceitos fundamentais do JavaScript. 
              Receba feedback imediato e aprenda com explicações detalhadas.
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">10</div>
                  <div className="text-gray-600">Perguntas Selecionadas</div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">15min</div>
                  <div className="text-gray-600">Tempo Estimado</div>
                </CardContent>
              </Card>
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-orange-600 mb-2">3</div>
                  <div className="text-gray-600">Níveis de Dificuldade</div>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              onClick={handleStartQuiz}
              disabled={isStarting}
              className="bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <Rocket className="mr-3 h-5 w-5" />
              Começar Quiz Agora
            </Button>
            
            <div className="mt-8 text-sm text-gray-500">
              <Clock className="inline mr-2 h-4 w-4" />
              Sem necessidade de cadastro • Resultados instantâneos
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Por que usar nosso Quiz?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma experiência gamificada para aprender JavaScript de forma efetiva
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-primary text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Feedback Imediato</h4>
              <p className="text-gray-600">Receba explicações detalhadas após cada resposta para acelerar seu aprendizado</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-green-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-green-600 text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Análise de Performance</h4>
              <p className="text-gray-600">Acompanhe seu progresso e identifique áreas que precisam de mais atenção</p>
            </div>
            
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-orange-600 text-2xl" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Totalmente Responsivo</h4>
              <p className="text-gray-600">Estude em qualquer dispositivo, com interface otimizada para mobile</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

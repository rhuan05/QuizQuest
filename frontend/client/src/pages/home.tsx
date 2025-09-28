import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import LoadingOverlay from "../components/layout/loading-overlay";
import { AuthModal } from "../components/auth/auth-modal";
import { Rocket, Zap, TrendingUp, Smartphone, Code, Database, Cpu, Globe, Shield, Layers } from "lucide-react";
import { useQuiz } from "../hooks/use-quiz";
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function Home() {
  const { startQuiz, isLoading } = useQuiz();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [, setLocation] = useLocation();
  const [, setIsLoading] = useState(false);

  // Tech-focused categories with icons
  const techCategories: Category[] = [
    {
      id: 'javascript',
      name: 'JavaScript',
      description: 'Fundamentos, ES6+, promises, async/await',
      icon: Code,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'react',
      name: 'React',
      description: 'Hooks, componentes, state management',
      icon: Layers,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      description: 'Backend, APIs, Express, middleware',
      icon: Cpu,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'database',
      name: 'Banco de Dados',
      description: 'SQL, NoSQL, queries, otimização',
      icon: Database,
      color: 'from-purple-400 to-violet-500'
    },
    {
      id: 'web-apis',
      name: 'Web APIs',
      description: 'REST, GraphQL, autenticação, CORS',
      icon: Globe,
      color: 'from-teal-400 to-blue-500'
    },
    {
      id: 'security',
      name: 'Segurança',
      description: 'JWT, HTTPS, XSS, CSRF, validação',
      icon: Shield,
      color: 'from-red-400 to-pink-500'
    }
  ];

  useEffect(() => {
    setCategories(techCategories);
  }, []);

  const handleStartQuiz = async () => {
    setAuthError('');
    
    const token = localStorage.getItem("authToken");

    if (token) {
      setIsLoading(true);
        await startQuiz("JavaScript"); // Categoria padrão
        setTimeout(() => {
          setLocation('/quiz');
        }, 10)
    } else {
      setShowAuthModal(true);
    }

  };

  const handleAuth = async (email: string, password: string) => {
    try {
      setAuthError(''); // Limpar erros anteriores
      
      const sessionToken = await startQuiz("JavaScript"); // Categoria padrão
      
      if (!sessionToken) {
        throw new Error("Sessão não foi criada corretamente");
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));

      // Fechar modal
      setShowAuthModal(false);
      
      setLocation('/quiz');
      
    } catch (error: any) {
      setAuthError(error.message || 'Erro ao iniciar quiz');
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600"> Tecnologia</span>
            </h2>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Descubra suas habilidades com perguntas desafiadoras sobre desenvolvimento web, programação e tecnologias modernas. 
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleStartQuiz}
                disabled={isLoading}
                className="bg-primary text-white px-8 py-4 text-lg font-semibold hover:bg-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <Rocket className="mr-3 h-5 w-5" />
                Quiz Misto
              </Button>
              <Button 
                variant="outline"
                disabled={isLoading}
                className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
              >
                <Code className="mr-3 h-5 w-5" />
                Explorar Categorias
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Escolha sua Especialidade</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Foque seus estudos em tecnologias específicas ou teste conhecimentos gerais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {category.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          Em breve
                        </Badge>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {category.description}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300"
                      disabled={true}
                    >
                      Iniciar Quiz
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">Não encontrou sua tecnologia favorita?</p>
            <Button variant="outline" className="text-primary border-primary hover:bg-primary hover:text-white">
              Sugerir Nova Categoria
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Por que usar nosso Quiz?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Uma experiência gamificada para evoluir suas habilidades em tecnologia
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

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthError('');
        }}
        onAuth={handleAuth}
        loading={isLoading}
        error={authError}
      />
    </>
  );
}

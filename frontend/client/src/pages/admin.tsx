import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { Trash2, Edit, Plus, Eye, AlertCircle } from 'lucide-react';
import { useLocation } from 'wouter';

interface Question {
  id: string;
  question: string;
  explanation: string;
  difficulty: Difficulty;
  category: Category;
  options: Option[];
  createdAt: string;
}

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Difficulty {
  id: string;
  name: string;
  description?: string;
}

interface QuestionForm {
  question: string;
  explanation: string;
  difficulty: string;
  category: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
}

export default function AdminPage() {
  const { user, isAdmin, token } = useAuth();
  const [, setLocation] = useLocation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<QuestionForm>({
    question: '',
    explanation: '',
    difficulty: '',
    category: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [questionsRes, categoriesRes, difficultiesRes] = await Promise.all([
        fetch('/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/difficulties', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!questionsRes.ok) {
        const errorData = await questionsRes.json().catch(() => ({ message: 'Erro desconhecido' }));
        setError({
          status: questionsRes.status,
          message: errorData.message || 'Erro ao carregar dados do admin'
        });
        return;
      }

      const questionsData = await questionsRes.json();
      setQuestions(questionsData);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (difficultiesRes.ok) {
        const difficultiesData = await difficultiesRes.json();
        setDifficulties(difficultiesData);
      } else {
        setDifficulties([
          { id: '1', name: 'Iniciante', description: 'Nível básico' },
          { id: '2', name: 'Intermediário', description: 'Nível médio' },
          { id: '3', name: 'Avançado', description: 'Nível alto' }
        ]);
      }
    } catch (error) {
      setError({
        status: 500,
        message: 'Erro de conexão com o servidor'
      });
      setDifficulties([
        { id: '1', name: 'Iniciante', description: 'Nível básico' },
        { id: '2', name: 'Intermediário', description: 'Nível médio' },
        { id: '3', name: 'Avançado', description: 'Nível alto' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      explanation: '',
      difficulty: '',
      category: '',
      options: [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
    setEditingQuestion(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.category || !formData.explanation.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const validOptions = formData.options.filter(opt => opt.text.trim());
    if (validOptions.length < 2) {
      alert('É necessário ter pelo menos 2 opções.');
      return;
    }

    const correctOptions = validOptions.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      alert('É necessário ter exatamente 1 opção correta.');
      return;
    }

    try {
      const method = editingQuestion ? 'PUT' : 'POST';
      const url = editingQuestion 
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';

      const requestData = {
        question: formData.question.trim(),
        explanation: formData.explanation.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        options: validOptions.map(opt => ({
          text: opt.text.trim(),
          isCorrect: opt.isCorrect
        }))
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        await fetchData();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        alert(`Erro ${response.status}: ${errorData.message || 'Erro ao salvar pergunta'}`);
      }
    } catch (error) {
      alert('Erro de conexão: Não foi possível salvar a pergunta');
    }
  };

  const handleEdit = (question: Question) => {
    const newFormData = {
      question: question.question,
      explanation: question.explanation,
      difficulty: question.difficulty?.name || '',
      category: question.category?.name || '',
      options: question.options.map(opt => ({
        text: opt.text,
        isCorrect: opt.isCorrect
      }))
    };
    
    setEditingQuestion(question);
    setFormData(newFormData);
    setIsDialogOpen(true);
  };

  const handleDelete = async (questionId: string) => {
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchData();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
        alert(`Erro ${response.status}: ${errorData.message || 'Erro ao excluir pergunta'}`);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Erro de conexão: Não foi possível excluir a pergunta');
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...formData.options];
    if (field === 'isCorrect' && value === true) {
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setFormData({ ...formData, options: newOptions });
  };

  const getDifficultyColor = (difficulty: Difficulty | string) => {
    const difficultyName = typeof difficulty === 'string' ? difficulty : difficulty?.name;
    switch (difficultyName) {
      case 'Iniciante': return 'bg-green-100 text-green-800';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Mostrar erro no estilo not-found
  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Falha ao acessar</h1>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {error.message}
            </p>
            
            <Button 
              onClick={() => setLocation('/')} 
              className="mt-4 w-full"
              variant="outline"
            >
              Voltar ao início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token && !isLoading) {
    setLocation('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
            <p className="text-gray-600 mt-2">Gerencie as perguntas do QuizQuest</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Pergunta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pergunta *
                    </label>
                    <Textarea
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Digite a pergunta..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dificuldade *
                    </label>

                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => 
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a dificuldade" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty.id} value={difficulty.name}>
                            {difficulty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explicação *
                    </label>
                    <Textarea
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      placeholder="Explicação da resposta correta..."
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Opções de Resposta (marque a correta)
                  </label>
                  <div className="space-y-3">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={option.isCorrect}
                          onChange={() => handleOptionChange(index, 'isCorrect', true)}
                          className="h-4 w-4 text-blue-600"
                        />
                        <Input
                          value={option.text}
                          onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                          placeholder={`Opção ${index + 1}`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingQuestion ? 'Atualizar' : 'Criar'} Pergunta
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="questions">Perguntas ({questions.length})</TabsTrigger>
            <TabsTrigger value="categories">Categorias ({categories.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            {questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhuma pergunta cadastrada</p>
                  <p className="text-gray-400 mt-2">Clique em "Nova Pergunta" para começar</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {questions.map((question) => (
                  <Card key={question.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-6 mb-2">
                            {question.question}
                          </CardTitle>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty?.name === 'Iniciante' ? 'Fácil' : 
                               question.difficulty?.name === 'Intermediário' ? 'Médio' : 'Difícil'}
                            </Badge>
                            <Badge variant="outline">
                              {question.category?.name || 'Sem categoria'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta pergunta? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(question.id)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Opções:</p>
                          <div className="space-y-1">
                            {question.options.map((option, index) => (
                              <div key={option.id} className="flex items-center text-sm">
                                <span className={`w-2 h-2 rounded-full mr-2 ${
                                  option.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                                }`}></span>
                                <span className={option.isCorrect ? 'font-medium text-green-700' : 'text-gray-600'}>
                                  {option.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Explicação:</p>
                          <p className="text-sm text-gray-600">{question.explanation}</p>
                        </div>
                        <div className="text-xs text-gray-400">
                          Criada em: {new Date(question.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            {categories.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">Nenhuma categoria cadastrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{category.description}</p>
                      <div className="mt-3 text-xs text-gray-400">
                        {questions.filter(q => 
                          q.category?.name === category.name
                        ).length} perguntas
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

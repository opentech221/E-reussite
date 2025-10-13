import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Video, Search, BookCopy, Atom, Globe, PenSquare, History, BrainCircuit, Unlock, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const allCourses = [
  { id: 1, level: 'bfem', parcours: 'BFEM', title: 'Mathématiques', icon: BookCopy, chapters: 12, lessons: 80, exercises: 200, freePreview: true },
  { id: 2, level: 'bfem', parcours: 'BFEM', title: 'Physique-Chimie', icon: Atom, chapters: 10, lessons: 65, exercises: 150, freePreview: false },
  { id: 3, level: 'bfem', parcours: 'BFEM', title: 'SVT', icon: Globe, chapters: 11, lessons: 70, exercises: 160, freePreview: true },
  { id: 4, level: 'bfem', parcours: 'BFEM', title: 'Français', icon: PenSquare, chapters: 15, lessons: 90, exercises: 180, freePreview: false },
  { id: 7, level: 'bac', parcours: 'BAC S', title: 'Mathématiques', icon: BookCopy, chapters: 18, lessons: 120, exercises: 300, freePreview: true },
  { id: 8, level: 'bac', parcours: 'BAC S', title: 'Physique-Chimie', icon: Atom, chapters: 16, lessons: 100, exercises: 250, freePreview: false },
  { id: 9, level: 'bac', parcours: 'BAC S', title: 'SVT', icon: Globe, chapters: 15, lessons: 95, exercises: 220, freePreview: true },
  { id: 10, level: 'bac', parcours: 'BAC L', title: 'Français', icon: PenSquare, chapters: 20, lessons: 110, exercises: 240, freePreview: false },
  { id: 11, level: 'bac', parcours: 'BAC L', title: 'Philosophie', icon: BrainCircuit, chapters: 12, lessons: 80, exercises: 150, freePreview: true },
  { id: 12, level: 'bac', parcours: 'BAC G', title: 'Anglais', icon: BookOpen, chapters: 17, lessons: 105, exercises: 230, freePreview: false },
];

const annalesData = {
  1: [{ year: 2023, title: 'Annales BFEM Maths 2023' }, { year: 2022, title: 'Annales BFEM Maths 2022' }],
  7: [{ year: 2023, title: 'Annales BAC S Maths 2023' }, { year: 2022, title: 'Annales BAC S Maths 2022' }],
};

const fichesData = {
  1: [{ title: 'Fiche de révision: Théorème de Thalès' }, { title: 'Fiche de révision: Équations' }],
  7: [{ title: 'Fiche de révision: Nombres complexes' }, { title: 'Fiche de révision: Intégration' }],
};

const Courses = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeParcours, setActiveParcours] = useState('BFEM');

  const handleAction = (title) => {
    toast({
      title: `🚧 ${title}`,
      description: "Cette fonctionnalité est en cours de préparation. Revenez bientôt ! 🚀",
    });
  };

  const handleDownload = (title) => {
    toast({
      title: `Téléchargement de "${title}"`,
      description: "Cette fonctionnalité sera bientôt disponible pour le mode hors-ligne. 🚀",
    });
  };

  const parcoursList = {
    bfem: ['BFEM'],
    bac: ['BAC S', 'BAC L', 'BAC G'],
  };

  const renderCourseList = (level) => {
    const filteredCourses = allCourses.filter(course => 
      course.level === level && 
      course.parcours === activeParcours &&
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredCourses.length === 0) {
      return <p className="text-center text-slate-500 col-span-full mt-8">Aucun cours ne correspond à votre recherche pour le parcours {activeParcours}.</p>;
    }

    return filteredCourses.map((course, index) => (
      <motion.div
        key={course.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="flex"
      >
        <Card className="hover-lift h-full flex flex-col w-full">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <course.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex items-center gap-3">
                {course.freePreview && (
                  <div className="flex items-center gap-1 text-green-600 cursor-pointer" onClick={() => handleAction('Aperçu gratuit')}>
                    <Unlock size={14} />
                    <span className="text-sm font-semibold">Aperçu</span>
                  </div>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDownload(course.title)}>
                  <Download className="w-5 h-5 text-slate-500" />
                </Button>
              </div>
            </div>
            <CardTitle className="text-xl">{course.title}</CardTitle>
            <CardDescription>
              {course.chapters} chapitres • {course.lessons} leçons • {course.exercises}+ exercices
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col justify-end">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="annales">
                <AccordionTrigger>Annales Corrigées</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {(annalesData[course.id] || []).map((annale, i) => (
                      <li key={i} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-slate-100">
                        <span>{annale.title}</span>
                        <div className="flex gap-2">
                          <FileText className="w-4 h-4 text-primary cursor-pointer" onClick={() => handleAction('Voir le corrigé PDF')} />
                          <Video className="w-4 h-4 text-accent cursor-pointer" onClick={() => handleAction('Voir la vidéo explicative')} />
                        </div>
                      </li>
                    ))}
                     {!(annalesData[course.id]) && <p className="text-xs text-slate-400">Aucune annale disponible pour le moment.</p>}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fiches">
                <AccordionTrigger>Fiches de Révision</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {(fichesData[course.id] || []).map((fiche, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-slate-100 cursor-pointer" onClick={() => handleAction('Voir la fiche')}>
                        <FileText className="w-4 h-4 text-primary" />
                        <span>{fiche.title}</span>
                      </li>
                    ))}
                    {!(fichesData[course.id]) && <p className="text-xs text-slate-400">Aucune fiche disponible pour le moment.</p>}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button 
              onClick={() => handleAction(`S'inscrire au cours de ${course.title}`)}
              className="w-full bg-accent text-white hover:bg-accent/90 mt-4"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Commencer le cours
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    ));
  };

  return (
    <>
      <Helmet>
        <title>Nos Cours - BFEM et BAC Sénégal, Côte d'Ivoire</title>
        <meta name="description" content="Découvrez nos cours en ligne pour le BFEM et le Baccalauréat. Programmes complets avec professeurs experts pour le Sénégal, la Côte d'Ivoire et l'Afrique francophone." />
        <meta name="keywords" content="cours en ligne, révisions BFEM Sénégal, préparation BAC Côte d'Ivoire, e-learning Afrique" />
      </Helmet>

      <div className="min-h-screen bg-white">
        <Navbar />

        <section className="pt-32 pb-20 px-4 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-heading text-slate-900 mb-6">
                Nos <span className="text-primary">Parcours</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Un catalogue de cours rigoureux pour une préparation d'excellence, du collège au lycée.
              </p>
            </motion.div>

            <Tabs defaultValue="bfem" className="w-full" onValueChange={(value) => setActiveParcours(value === 'bfem' ? 'BFEM' : 'BAC S')}>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                <TabsList>
                  <TabsTrigger value="bfem">Collège (BFEM)</TabsTrigger>
                  <TabsTrigger value="bac">Lycée (Baccalauréat)</TabsTrigger>
                </TabsList>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher une matière..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <TabsContent value="bfem">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {renderCourseList('bfem')}
                </div>
              </TabsContent>
              <TabsContent value="bac">
                <div className="mb-6 flex justify-center gap-2">
                  {parcoursList.bac.map(p => (
                    <Button key={p} variant={activeParcours === p ? 'default' : 'outline'} onClick={() => setActiveParcours(p)}>
                      {p}
                    </Button>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {renderCourseList('bac')}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Courses;
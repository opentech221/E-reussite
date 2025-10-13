import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Calendar, Trophy, Target, User, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const currentChallenge = {
  id: 1,
  name: 'Défi Réussite BFEM - Octobre',
  description: 'Obtenez le meilleur score combiné sur les quiz de Maths, Physique et Français du parcours BFEM.',
  endDate: '2025-10-31',
  participants: 127,
  leaderboard: [
    { rank: 1, name: 'Amina Diallo', score: 4500 },
    { rank: 2, name: 'Moussa Traoré', score: 4350 },
    { rank: 3, name: 'Toi', score: 4200, isCurrentUser: true },
    { rank: 4, name: 'Fatou Ndiaye', score: 4150 },
    { rank: 5, name: 'Koffi Amoussou', score: 4000 },
  ],
};

const Challenges = () => {
  const { toast } = useToast();

  const handleParticipate = () => {
    toast({
      title: "Participation enregistrée !",
      description: "Bonne chance pour le défi ! 🚀",
    });
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Star className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Star className="w-5 h-5 text-amber-700" />;
    return <span className="w-5 text-center">{rank}</span>;
  };

  return (
    <>
      <Helmet>
        <title>Défis Mensuels - E-Réussite</title>
        <meta name="description" content="Participez à nos défis mensuels et mesurez-vous aux autres élèves." />
      </Helmet>
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <main className="pt-32 pb-20 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <Trophy className="w-20 h-20 mx-auto text-primary mb-4" />
              <h1 className="text-5xl font-bold font-heading">Défis Mensuels</h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">Prouvez votre valeur et remportez des récompenses exclusives !</p>
            </motion.div>

            <div className="grid lg:grid-cols-5 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-3xl font-bold text-primary">{currentChallenge.name}</CardTitle>
                    <CardDescription className="text-base">{currentChallenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 my-6">
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span>Se termine le : {new Date(currentChallenge.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                        <User className="w-5 h-5 text-primary" />
                        <span>{currentChallenge.participants} participants</span>
                      </div>
                    </div>
                    <Button onClick={handleParticipate} size="lg" className="w-full bg-accent text-white hover:bg-accent/90">
                      Participer au Défi
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target /> Classement du Défi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {currentChallenge.leaderboard.map(player => (
                        <li key={player.rank} className={`flex items-center p-3 rounded-lg ${player.isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-slate-50'}`}>
                          <div className="w-10 font-bold text-lg flex justify-center items-center">{getRankIcon(player.rank)}</div>
                          <div className={`flex-grow font-semibold ${player.isCurrentUser ? 'text-primary' : ''}`}>{player.name}</div>
                          <div className="font-bold text-slate-700 dark:text-slate-200">{player.score} pts</div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Challenges;
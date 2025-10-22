import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Composant de quiz optimisé pour mobile avec swipe gestures
 * Swipe left/right pour naviguer entre les questions
 * Tap pour sélectionner une réponse
 */
const MobileQuizSwiper = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [direction, setDirection] = useState(0);

  const currentQuestion = questions[currentIndex];

  // Gestion des gestures
  const { ref, gestureState } = useTouchGestures({
    onSwipeLeft: () => {
      if (currentIndex < questions.length - 1) {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    },
    onSwipeRight: () => {
      if (currentIndex > 0) {
        setDirection(-1);
        setCurrentIndex(prev => prev - 1);
      }
    },
    minSwipeDistance: 50
  });

  const handleAnswerSelect = (answerId) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const isAnswered = answers[currentQuestion?.id] !== undefined;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-primary/5 to-white pb-safe">
      {/* Header avec progression */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">
            Question {currentIndex + 1}/{questions.length}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Container avec gesture */}
      <div
        ref={ref}
        className="flex-1 overflow-hidden relative px-4 pt-6"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            className="absolute inset-0 px-4 flex flex-col"
          >
            {/* Question card */}
            <Card className="mb-6 shadow-lg">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 leading-relaxed">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.image && (
                  <img
                    src={currentQuestion.image}
                    alt="Question illustration"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
              </CardContent>
            </Card>

            {/* Options */}
            <div className="space-y-3 flex-1 overflow-y-auto pb-6">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.id;
                const isCorrect = option.isCorrect;
                const showResult = isAnswered && isCorrect;

                return (
                  <motion.button
                    key={option.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswerSelect(option.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all",
                      "active:scale-[0.98] touch-manipulation",
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300",
                      showResult && isSelected && isCorrect && "border-green-500 bg-green-50",
                      showResult && isSelected && !isCorrect && "border-red-500 bg-red-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          isSelected ? "border-primary bg-primary" : "border-gray-300"
                        )}
                      >
                        {isSelected && (
                          <Check className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <span className="text-base flex-1">{option.text}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicateur de swipe */}
        {gestureState.isSwiping && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
            Glissez pour naviguer
          </div>
        )}
      </div>

      {/* Footer avec boutons */}
      <div className="bg-white border-t shadow-2xl p-4 flex gap-3 safe-area-inset-bottom">
        <Button
          variant="outline"
          size="lg"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex-1"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Précédent
        </Button>
        <Button
          size="lg"
          onClick={handleNext}
          disabled={!isAnswered}
          className="flex-1"
        >
          {currentIndex === questions.length - 1 ? 'Terminer' : 'Suivant'}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default MobileQuizSwiper;

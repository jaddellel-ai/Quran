import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';

const QuizScreen = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const generateQuiz = (surahNumber, difficulty) => {
    // Generate quiz questions based on selected surah and difficulty
    // Types: verse completion, word meaning, context questions, etc.
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>اختبار القرآن</Text>
      <Text style={styles.question}>السؤال {currentQuestion + 1}</Text>
      
      <View style={styles.options}>
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>الخيار الأول</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>الخيار الثاني</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>الخيار الثالث</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.optionButton}>
          <Text style={styles.optionText}>الخيار الرابع</Text>
        </TouchableOpacity>
      </View>
      
      <Button title="التالي" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#0f172a',
  },
  question: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#475569',
  },
  options: {
    marginBottom: 30,
  },
  optionButton: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#0f172a',
  },
});

export default QuizScreen;
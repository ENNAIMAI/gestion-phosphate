<?php

namespace App\Services\ML;

class NaiveBayesClassifier
{
    private array $classes = [];
    private array $vocab = [];
    private array $classWordCounts = [];
    private array $classDocCounts = [];
    private int $totalDocs = 0;

    /**
     * Train the classifier with an array of samples.
     * $samples = [['text' => 'bonjour', 'intent' => 'greeting'], ...]
     */
    public function train(array $samples): void
    {
        foreach ($samples as $sample) {
            $intent = $sample['intent'];
            $text = $sample['text'];

            if (!isset($this->classDocCounts[$intent])) {
                $this->classDocCounts[$intent] = 0;
                $this->classWordCounts[$intent] = [];
                $this->classes[] = $intent;
            }

            $this->classDocCounts[$intent]++;
            $this->totalDocs++;

            $words = $this->tokenize($text);
            foreach ($words as $word) {
                $this->vocab[$word] = true;
                if (!isset($this->classWordCounts[$intent][$word])) {
                    $this->classWordCounts[$intent][$word] = 0;
                }
                $this->classWordCounts[$intent][$word]++;
            }
        }
    }

    /**
     * Predict the intent of a given text, returning intent and confidence.
     */
    public function predict(string $text): array
    {
        if ($this->totalDocs === 0) {
            return ['intent' => 'unknown', 'confidence' => 0.0];
        }

        $words = $this->tokenize($text);
        $scores = [];
        $vocabSize = count($this->vocab);

        foreach ($this->classes as $intent) {
            // P(Class)
            $logProb = log($this->classDocCounts[$intent] / $this->totalDocs);

            // Total words in this class
            $totalWordsInClass = array_sum($this->classWordCounts[$intent]);
            $alpha = 0.05; // Small alpha for tiny datasets to prevent confidence dilution

            foreach ($words as $word) {
                // Laplace Smoothing (Add-alpha)
                $count = $this->classWordCounts[$intent][$word] ?? 0;
                $wordProb = ($count + $alpha) / ($totalWordsInClass + $alpha * $vocabSize);
                $logProb += log($wordProb);
            }

            $scores[$intent] = $logProb;
        }

        // Convert log probabilities to probabilities using softmax to get a confidence score
        $maxLog = max($scores);
        $sumExp = 0;
        foreach ($scores as $intent => $logProb) {
            $sumExp += exp($logProb - $maxLog);
        }

        $probabilities = [];
        foreach ($scores as $intent => $logProb) {
            $probabilities[$intent] = exp($logProb - $maxLog) / $sumExp;
        }

        arsort($probabilities);
        $bestIntent = array_key_first($probabilities);
        $confidence = $probabilities[$bestIntent];

        return [
            'intent' => $bestIntent,
            'confidence' => round($confidence, 4)
        ];
    }

    private function tokenize(string $text): array
    {
        $text = mb_strtolower(trim($text));
        // Remove punctuation but keep letters and numbers
        $text = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $text);
        $words = preg_split('/\s+/', $text, -1, PREG_SPLIT_NO_EMPTY);
        return $words;
    }
}

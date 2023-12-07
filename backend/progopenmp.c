#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <ctype.h>
#include <omp.h>

#define MAX_WORD_LENGTH 50
#define MAX_WORDS_PER_THREAD 1000
#define MAX_TOTAL_WORDS (MAX_WORDS_PER_THREAD * 4) // Si vous utilisez 4 threads

typedef struct {
    char word[MAX_WORD_LENGTH];
    int count;
} WordCount;

void processWord(char *word) {
    int len = strlen(word);
    if (len > 0 && (word[len - 1] == ',' || word[len - 1] == '.')) {
        word[len - 1] = '\0'; // Supprimer la ponctuation à la fin du mot
    }
}

int main() {
    FILE *file = fopen("text.txt", "r");
    if (file == NULL) {
        printf("Erreur lors de l'ouverture du fichier.\n");
        return 1;
    }

    int numThreads = 4;
    omp_set_num_threads(numThreads);

    WordCount *finalCounts = (WordCount *)malloc(MAX_TOTAL_WORDS * sizeof(WordCount));
    int finalTotalWords = 0;

    // Initialisation des comptes finaux à zéro
    for (int i = 0; i < MAX_TOTAL_WORDS; ++i) {
        finalCounts[i].count = 0;
    }

    #pragma omp parallel
    {
        int tid = omp_get_thread_num();
        WordCount *wordCounts = (WordCount *)malloc(MAX_WORDS_PER_THREAD * sizeof(WordCount));
        int totalWords = 0;

        // Initialisation des comptes par thread à zéro
        for (int i = 0; i < MAX_WORDS_PER_THREAD; ++i) {
            wordCounts[i].count = 0;
        }

        char word[MAX_WORD_LENGTH];
        int wordsRead = 0;

        while (fscanf(file, "%s", word) != EOF) {
            processWord(word); // Supprimer la ponctuation à la fin du mot

            // Compter le mot
            if (strlen(word) > 0) {
                int found = 0;
                for (int i = 0; i < totalWords; ++i) {
                    if (strcmp(wordCounts[i].word, word) == 0) {
                        #pragma omp atomic
                        wordCounts[i].count++;
                        found = 1;
                        break;
                    }
                }

                if (!found) {
                    if (totalWords < MAX_WORDS_PER_THREAD) {
                        strcpy(wordCounts[totalWords].word, word);
                        #pragma omp atomic
                        wordCounts[totalWords].count++;
                        totalWords++;
                    }
                }
            }

            wordsRead++;
        }

        // Affichage des occurrences pour chaque thread
        printf("=================================================\n");
        printf("Thread %d - Occurrences de mots :\n", tid);
        for (int i = 0; i < totalWords; ++i) {
            printf("%s : %d\n", wordCounts[i].word, wordCounts[i].count);
        }
        printf("\n");

        // Fusion des résultats pour chaque thread avec une section critique
        #pragma omp critical
        {
            for (int i = 0; i < totalWords; ++i) {
                int k;
                for (k = 0; k < finalTotalWords; ++k) {
                    if (strcmp(finalCounts[k].word, wordCounts[i].word) == 0) {
                        #pragma omp atomic
                        finalCounts[k].count += wordCounts[i].count;
                        break;
                    }
                }
                if (k == finalTotalWords && finalTotalWords < MAX_TOTAL_WORDS) {
                    strcpy(finalCounts[k].word, wordCounts[i].word);
                    finalCounts[k].count = wordCounts[i].count;
                    finalTotalWords++;
                }
            }
        }

        free(wordCounts); // Libérer la mémoire allouée pour les résultats de chaque thread
    }

    // Affichage des résultats globaux
    printf("=================================================\n");
    printf("Occurrences de mots globales :\n");
    for (int i = 0; i < finalTotalWords; ++i) {
        printf("%s : %d\n", finalCounts[i].word, finalCounts[i].count);
    }

    free(finalCounts); // Libérer la mémoire allouée pour les résultats globaux
    fclose(file);

    return 0;
}

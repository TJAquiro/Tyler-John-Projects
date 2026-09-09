

int firstGuessCorrectCount = 0;
int[] firstGuessIntArray = new int[4];

int secondGuessCorrectCount = 0;
int[] secondGuessIntArray = new int[4];

int thirdGuessCorrectCount = 0;
int[] thirdGuessIntArray = new int[4];

//create all possible combinations of the game board
List<int[]> possibleCombinations = new List<int[]>();
int[] gameBoard = [1, 2, 3, 4, 5, 6, 7, 8];
String answer = "1";
// creates a list of all possible combinations of 4 numbers where order does not matter and no number is repeated
for (int i = 0; i < gameBoard.Length; i++)
{
    for (int j = i+1; j < gameBoard.Length; j++)
    {
        for (int k = j+1; k < gameBoard.Length; k++)
        {
            for (int l = k+1; l < gameBoard.Length; l++)
            {
                possibleCombinations.Add(new int[] { gameBoard[i], gameBoard[j], gameBoard[k], gameBoard[l] });
            }
        }
    }

}

while (answer == "1")
{
    //Stage one: Get frimilar with the game board
    Console.WriteLine("The game board is: \n[1] [2] [3] [4] \n[5] [6] [7] [8]");

    //Stage two: Get the first guess and how many were correct
    Console.WriteLine("What numbers did you guess? Example: 1,2,3,4");
    string guess = Console.ReadLine();
    string[] guessArray = guess.Split(',');
    firstGuessIntArray = Array.ConvertAll(guessArray, int.Parse);

    Console.WriteLine("How many were correct? (2 or 3)");
    string correctCount = Console.ReadLine();
    firstGuessCorrectCount = int.Parse(correctCount);

    //Stage three: remove all combinations from the list that more than correctCount amount of numbers that are 
    // the same as the first guess.

    possibleCombinations.RemoveAll(combination => 
    {
        int correctNumbers = 0;
        foreach (int number in combination)
        {
            if (firstGuessIntArray.Contains(number))
            {
                correctNumbers++;
            }
        }
        return correctNumbers > firstGuessCorrectCount;
    });

    Console.WriteLine("[1] Add another guess \n[2] Show remaining possible combinations");
    answer = Console.ReadLine();
}
foreach (var combination in possibleCombinations)
{
    Console.WriteLine(string.Join(", ", combination));
}   

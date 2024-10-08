
using FourSquare_Analysis;
using System;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;

// SETUP START ------------------

var cipher = "JBYEUAYCBUUENYOUMCODVOCNIELJBSPFUINOGHROGDESGPJCIGTASIDUJBYEJSGVIONSNWYZFLUWROZDOBXGDSTERNDWDPPDMVRLCUCWMUNJNTNSRLENODNXSVGEDJKLYULVMNLRKNNDZYZEOBNDMNTWSUUEKCOADAFYBUIHNSHLMMCUDSRTLSCNMPIHUOEGNJNDCUPARDFHUIYHDSJSGVIONS";
var chars = "ABCDEFGHIJKLMNOPRSTUVWXYZ";

char[,] plainGrid = { { 'A', 'B', 'C', 'D', 'E' },
                        { 'F', 'G', 'H', 'I', 'J' },
                        { 'K', 'L', 'M', 'N', 'O' },
                        { 'P', 'R', 'S', 'T', 'U' },
                        { 'V', 'W', 'X', 'Y', 'Z' }, };



var cipherDigrams = Enumerable.Range(0, cipher.Length/2).Select(x => cipher.Substring(x * 2, 2));
var cipherDigramFrequencies = from x in cipherDigrams group x by x into g let count = g.Count() orderby count descending select new { Digram = g.Key, Count = g.Count() };

Dictionary<double, char[]> englishDigramFrequencies = new Dictionary<double, char[]>
{
    { 0.003882543, ['T', 'H'] },
    { 0.003681391, ['H', 'E'] },
    { 0.002283899, ['I', 'N'] },
    { 0.002178042, ['E', 'R'] },
    { 0.002140460, ['A', 'N'] },
    { 0.001749394, ['R', 'E'] },
    { 0.001561977, ['N', 'D'] },
    { 0.001418244, ['O', 'N'] },
    { 0.001383239, ['E', 'N'] },
    { 0.001335523, ['A', 'T'] },
    { 0.001285484, ['O', 'U'] },
    { 0.001275779, ['E', 'D'] },
    { 0.001274742, ['H', 'A'] },
    { 0.001169655, ['T', 'O'] },
    { 0.001151094, ['O', 'R'] },
    { 0.001134891, ['I', 'T'] },
    { 0.001109877, ['I', 'S'] },
    { 0.001092302, ['H', 'I'] },
    { 0.001092301, ['E', 'S'] },
    { 0.001053385, ['N', 'G'] }
};

IList<char[]> digramContainer = new List<char[]>();
foreach (var digram in englishDigramFrequencies)
{
    digramContainer.Append(digram.Value);
}

Random rnd = new Random();
Dictionary<string, double> solutions = new Dictionary<string, double>();

// SETUP END -------------------

char[,] upperRightGrid = new char[5, 5];
char[,] lowerLeftGrid = new char[5, 5];

for (int k = 0; k < 100; k++)
{
    var upperRightAvailableChars = chars.ToList();
    var lowerLeftAvailableChars = chars.ToList();

    // Substitute digrams
    var o = 0;
    foreach (var item in digramContainer)
    {
        (int alpha, int beta) = plainGrid.CoordinatesOf(item[0]);
        (int gamma, int delta) = plainGrid.CoordinatesOf(item[1]);

        var cipherDigram = cipherDigramFrequencies.ElementAt(o).Digram; ;

        if (upperRightGrid[alpha, delta] == 0 && lowerLeftGrid[gamma, beta] == 0 && upperRightAvailableChars.Contains(cipherDigram[0]) && lowerLeftAvailableChars.Contains(cipherDigram[1]))
        {
            upperRightGrid[alpha, delta] = cipherDigram[0];
            lowerLeftGrid[gamma, beta] = cipherDigram[1];

            upperRightAvailableChars.Remove(cipherDigram[0]);
            lowerLeftAvailableChars.Remove(cipherDigram[1]);
        }
        o++;
    }

    // Loop for each digram setup
    for (int x = 0; x < 10000; x++)
    {
        var upperRightRemainderChars = new List<char>(upperRightAvailableChars);
        var lowerLeftRemainderChars = new List<char>(lowerLeftAvailableChars);

        var ur = (char[,])upperRightGrid.Clone();
        var ll = (char[,])lowerLeftGrid.Clone();

        // Substitute rest at random
        for (int i = 0; i < 5; i++)
        {
            for (int j = 0; j < 5; j++)
            {
                if (ur[i, j] == 0)
                {
                    int randomNumber = rnd.Next(0, upperRightRemainderChars.Count);
                    ur[i, j] =  upperRightRemainderChars[randomNumber];
                    upperRightRemainderChars.RemoveAt(randomNumber);
                }

                if (ll[i, j] == 0)
                {
                    int randomNumber = rnd.Next(0, lowerLeftRemainderChars.Count);
                    ll[i, j] =  lowerLeftRemainderChars[randomNumber];
                    lowerLeftRemainderChars.RemoveAt(randomNumber);
                }
            }
        }

        // Solve
        var decryptedTextChars = new char[cipher.Length];
        var pointer = 0;
        while (pointer < cipher.Length)
        {
            (int x1, int y1) = plainGrid.CoordinatesOf(cipher[pointer]);
            (int x2, int y2) = plainGrid.CoordinatesOf(cipher[pointer + 1]);

            decryptedTextChars[pointer] = ur[x1, y2];
            decryptedTextChars[pointer+1] = ll[x2, y1];

            pointer = pointer + 2;
        }

        var decryptedText = String.Concat(decryptedTextChars);

        //// Compute value of solution
        //double penaltyScore = 0;
        //foreach (var f in englishDigramFrequencies)
        //{
        //    var regex = new Regex($"{String.Concat(f.Value)}");

        //    var expectedRelativeFrequency = f.Key;
        //    var actualRelativeFrequency = (double)regex.Matches(decryptedText).Count / decryptedText.Length;

        //    penaltyScore += Math.Abs(actualRelativeFrequency - expectedRelativeFrequency);
        //}

        //solutions.Add(decryptedText, penaltyScore);

        // Compute index of coincidence
        int sum = 0;
        var letterIncidences = decryptedText.GroupBy(x => x).Select(group => group.Count());

        foreach (var incidence in letterIncidences)
        {
            sum += incidence * (incidence - 1);
        }

        var indexOfCoincidence = (sum*26)/(double)(decryptedText.Length*(decryptedText.Length - 1));
        solutions.Add(decryptedText, Math.Abs(1.73-indexOfCoincidence));
    }

    digramContainer.Shuffle();
}



var sortedSolutions = from entry in solutions orderby entry.Value ascending select entry;




Temp.Print2DArray<char>(upperRightGrid);
Temp.Print2DArray<char>(lowerLeftGrid);
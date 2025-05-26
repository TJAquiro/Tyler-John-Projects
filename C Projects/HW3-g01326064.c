/*
Name: Tyler John Aquiro
G#: G01326064
Homework # 3
*/

#include <stdio.h>
#include <time.h>
#include <stdlib.h>
#include <string.h>

char *getDateAndTime();
int getInteger();
void decimalToBinary(int decValue, char binString[]);
void decimalToHex(int decValue, char hexString[]);
void decimalToOct(int decValue, char octString[]);
int saveFile(char name[], char date[], int decValue, char octString[], char hexString[], char binString[]);

int main()
{
    char dateTime[32];
    char name[32];
    char binString[32];
    char octString[32];
    char hexString[32];
    int decVal = 0;
    int saveSuccess = 0;
    strcpy(dateTime, getDateAndTime());
    //  prompt	user	for	name
    decVal = getInteger();
    //	exit	clause
    if (decVal == -1)
        return 0;

    //	run	conversions
    decimalToBinary(decVal, binString);
    decimalToHex(decVal, hexString);
    decimalToOct(decVal, octString);
    //	print	conversions	to	the	console
    printf("Decimal:	%d\n", decVal);
    printf("Binary:	%s\n", binString);
    printf("Octal:	%s\n", octString);
    printf("Hexidecimal:	%s\n", hexString);

    //	save	the	file
    saveSuccess = saveFile(name, dateTime, decVal, octString, hexString, binString);
    if (!saveSuccess)
        return 1;
    return 0;
}

char *getDateAndTime()
{
    // gets time from local mechine
    time_t t;
    time(&t);
    return ctime(&t);
}

int getInteger()
{
    // will continue to reprompt the user till they input an acceptabe integer
    while (1)
    {
        char str[100];
        int num;

        // prompts the user for an integer
        printf("Enter an Integer [1,000 - 1,000,000] or type x to exit: ");
        fgets(str, sizeof(str), stdin);

        // if x is entered, the user will exit
        if (str[0] == 'x')
        {
            printf("Goodbye!\n");
            return -1;
        }

        // checks if integer range is correct, returns that intereger if true
        if (sscanf(str, "%d", &num) == 1 && num >= 1000 && num <= 1000000)
        {
            return num;
        }
        // error message for incorrect values
        else
        {
            str[strcspn(str, "\n")] = '\0';
            printf("Error: %s out of range.\n", str);
        }
    }
}

void decimalToBinary(int decValue, char binString[])
{
    // repeatedly divids decValue by 2, storing the remainder
    int binNumber[32], i = 0, j;
    while (decValue > 0)
    {
        binNumber[i++] = decValue % 2;
        decValue /= 2;
    }

    // Converts the binary digits in binNumber to character representation
    for (j = 0; j < i; j++)
    {
        binString[j] = binNumber[i - j - 1] + '0';
    }
    binString[i] = '\0';
}

void decimalToHex(int decValue, char hexString[])
{
    int quotient;
    int i = 0, j, temp;
    char hexadecimalNumber[32];

    quotient = decValue;

    // repeatedly divids decValue by 16, storing the remainder
    while (quotient != 0)
    {
        temp = quotient % 16;

        // If the remainder is less than 10, it's a digit 0-9
        if (temp < 10)
            temp = temp + '0';
        // Otherwise it's a letters A-F
        else
            temp = temp + 'A' - 10;
        hexadecimalNumber[i++] = temp;
        quotient = quotient / 16;
    }

    // Reverse the order of the hexadecimal digits to match the correct format
    for (j = 0; j < i; j++)
    {
        hexString[j] = hexadecimalNumber[i - j - 1];
    }
    hexString[i] = '\0';
}

void decimalToOct(int decValue, char octString[])
{
    int index = 0;
    char temp[32];

    // repeatedly divids decValue by 16, storing the remainder
    while (decValue > 0)
    {
        temp[index++] = (decValue % 8) + '0';
        decValue /= 8;
    }
    temp[index] = '\0';
    // Reverse the order of the octal digits to match the correct format
    for (int i = 0; i < index; i++)
    {
        octString[i] = temp[index - i - 1];
    }
    octString[index] = '\0';
}

int saveFile(char name[], char date[], int decValue, char octString[], char hexString[], char binString[])
{
    char response;

    while (1)
    {
        // Ask the user whether to save to a file
        printf("Save to a file? (y/n): ");
        scanf(" %c", &response);

        // must answer y/n or will be reprompted
        while (getchar() != '\n')
            ;

        if (response == 'n')
        {
            return 1;
        }
        else if (response == 'y')
        {
            break;
        }
        // error message for illigal values
        else
        {
            printf("Error: illegal value\n");
        }
    }

    // Askes user to name the file
    char filename[100];
    printf("Enter file name: ");
    fgets(filename, sizeof(filename), stdin);
    filename[strcspn(filename, "\n")] = '\0';

    FILE *file = fopen(filename, "w");

    // checks if the file can be opened
    if (file == NULL)
    {
        printf("output file cannot be opened\n");
        return 0;
    }
    // writes all the information into the file
    else
    {
        fprintf(file, "$%s\n\n", filename);
        fprintf(file, "Tyler Aquiro\n");
        fprintf(file, "Today's date: %s\n\n", date);
        fprintf(file, "Decimal: %d\n", decValue);
        fprintf(file, "Hexadecimal: %s\n", hexString);
        fprintf(file, "Octal: %s\n", octString);
        fprintf(file, "Binary: %s\n", binString);

        fclose(file);
        printf("File saved.\n\n");
        return 1;
    }
}
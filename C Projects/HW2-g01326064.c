/*
Name: Tyler John Aquiro
G#: G01326064
Homework # 2
*/

#include <stdio.h>

/**
 * Gets an integer input for the user
 *
 * @returns the number entered by the user
 * @throw a printed exception if the number is not between 1 and 999999
 */
int get_input()
{
    int number;
    printf("Enter an integer[1,999999]: ");
    scanf("%d", &number);

    // code for checking if the number is in the right range
    if (number < 1 || number > 999999)
    {
        printf("Number out of range.\n");

        return get_input();
    }
    else
    {
        return number;
    }
}

/**
 * takes in a number and prints each digit from the ones place onward then prints whether the number is divisable by 9
 *
 * @param val any integer value
 * @returns 1 if the number is divisible by 9 else returns 0
 */
int display(int val)
{
    int tempVal = val;

    // code for printing each digit in the number
    while (tempVal > 0)
    {
        printf("%d\n", tempVal % 10);
        tempVal = tempVal / 10;
    }

    // code for determining if the number is divisible by 9
    if (val % 9 == 0)
    {
        printf("%d is divisible by 9", val);
        return 1;
    }
    else
    {
        printf("%d is not divisible by 9", val);
        return 0;
    }
}

int main()
{
    display(get_input());
}
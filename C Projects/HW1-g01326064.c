#include <stdio.h>

int main()
{
	//code for getting an integer input from the user
    int number;
    printf("Enter an integer: ");
    scanf("%d", &number);
    
	//code for figuring out if the input is positive, negative, or zero.
    if (number < 0)
    {
        printf("%d is negative.\n", number);
    }
    else if (number > 0)
    {
        printf("%d is positive.\n", number);
    }
    else
    {
        printf("%d is zero\n", number);
    }
    
	//code for figuring out if the input is even or odd.
    if (number % 2 == 0)
    {
        printf("%d is even.\n", number);
    }
    else
    {
        printf("%d is odd\n", number);
    }
    return 0;
}